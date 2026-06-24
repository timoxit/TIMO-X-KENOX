const express = require('express');
const router = express.Router();
const client = require('../../bot/client');
const authMiddleware = require('../middleware/auth');
const Poll = require('../../database/models/Poll');
const { getIo } = require('../socket');
const { AttachmentBuilder } = require('discord.js');
const { renderPollEmbed, renderPollComponents, generatePollChart } = require('../../bot/utils/pollHelper');

// Get all polls for a guild
router.get('/:guildId', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  try {
    const polls = await Poll.find({ guildId }).sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    console.error(`[Server Polls Error] Failed to fetch polls for ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch polls' });
  }
});

// Create a new poll in a guild channel
router.post('/:guildId', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  const { channelId, question, description, options, settings } = req.body;

  if (!channelId) return res.status(400).json({ error: 'Target channel is required.' });
  if (!question) return res.status(400).json({ error: 'Poll question is required.' });
  if (!options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: 'At least two options are required to create a poll.' });
  }
  if (options.length > 10) {
    return res.status(400).json({ error: 'Maximum of 10 options are allowed for a poll.' });
  }

  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Bot is not in this guild.' });

    const channel = guild.channels.cache.get(channelId);
    if (!channel) return res.status(404).json({ error: 'Target channel was not found on this server.' });

    // Build options objects
    const pollOptions = options.map((optText, index) => ({
      id: `opt_${index}`,
      text: optText.trim(),
      votes: []
    }));

    // Instantiate poll document to generate an _id
    const poll = new Poll({
      guildId,
      channelId,
      messageId: 'TEMP', // Will update after sending
      question: question.trim(),
      description: description ? description.trim() : '',
      options: pollOptions,
      settings: {
        multipleChoice: !!settings?.multipleChoice,
        anonymous: !!settings?.anonymous,
        showResultsBeforeEnding: settings?.showResultsBeforeEnding !== false, // default true
        expiresAt: settings?.expiresAt ? new Date(settings.expiresAt) : undefined,
        color: settings?.color || '#2563eb',
        imageUrl: settings?.imageUrl || undefined,
        thumbnailUrl: settings?.thumbnailUrl || undefined
      },
      status: 'active',
      creatorId: req.user.id
    });

    // Render embed and components
    const embed = renderPollEmbed(poll, guild);
    const components = renderPollComponents(poll);

    const payload = { embeds: [embed], components: components };
    const showResults = poll.status === 'ended' || poll.settings.showResultsBeforeEnding;
    if (showResults) {
      const chartBuffer = await generatePollChart(poll);
      const attachmentName = `poll_chart_${Date.now()}.png`;
      embed.setImage(`attachment://${attachmentName}`);
      const attachment = new AttachmentBuilder(chartBuffer, { name: attachmentName });
      payload.files = [attachment];
    }

    // Send to Discord
    const message = await channel.send(payload);

    // Update message ID and save
    poll.messageId = message.id;
    await poll.save();

    // Emit Socket.io update to the guild room
    const io = getIo();
    if (io) {
      io.to(`guild_${guildId}`).emit('poll_update', poll);
    }

    res.json(poll);
  } catch (error) {
    console.error(`[Server Polls Error] Failed to create poll for guild ${guildId}:`, error);
    res.status(500).json({ error: 'Failed to create poll: ' + error.message });
  }
});

// End a poll manually
router.post('/:guildId/:pollId/end', authMiddleware, async (req, res) => {
  const { guildId, pollId } = req.params;

  try {
    const poll = await Poll.findOne({ _id: pollId, guildId });
    if (!poll) return res.status(404).json({ error: 'Poll not found.' });

    if (poll.status === 'ended') {
      return res.json(poll); // Already ended
    }

    poll.status = 'ended';
    await poll.save();

    // Update Discord message
    const guild = client.guilds.cache.get(guildId);
    if (guild) {
      const channel = guild.channels.cache.get(poll.channelId);
      if (channel) {
        try {
          const message = await channel.messages.fetch(poll.messageId);
          if (message) {
            const embed = renderPollEmbed(poll, guild);
            const components = renderPollComponents(poll);
            
            const payload = { embeds: [embed], components: components };
            const showResults = poll.status === 'ended' || poll.settings.showResultsBeforeEnding;
            if (showResults) {
              const chartBuffer = await generatePollChart(poll);
              const attachmentName = `poll_chart_${Date.now()}.png`;
              embed.setImage(`attachment://${attachmentName}`);
              const attachment = new AttachmentBuilder(chartBuffer, { name: attachmentName });
              payload.files = [attachment];
            } else {
              payload.files = [];
            }
            await message.edit(payload);
          }
        } catch (msgErr) {
          console.warn(`[Server Polls Warning] Could not edit Discord message ${poll.messageId} to end poll:`, msgErr.message);
        }
      }
    }

    // Emit Socket.io update
    const io = getIo();
    if (io) {
      io.to(`guild_${guildId}`).emit('poll_update', poll);
    }

    res.json(poll);
  } catch (error) {
    console.error(`[Server Polls Error] Failed to end poll ${pollId}:`, error.message);
    res.status(500).json({ error: 'Failed to end poll: ' + error.message });
  }
});

// Delete a poll
router.delete('/:guildId/:pollId', authMiddleware, async (req, res) => {
  const { guildId, pollId } = req.params;

  try {
    const poll = await Poll.findOne({ _id: pollId, guildId });
    if (!poll) return res.status(404).json({ error: 'Poll not found.' });

    // Try deleting the Discord message
    const guild = client.guilds.cache.get(guildId);
    if (guild) {
      const channel = guild.channels.cache.get(poll.channelId);
      if (channel) {
        try {
          const message = await channel.messages.fetch(poll.messageId);
          if (message) {
            await message.delete();
          }
        } catch (msgErr) {
          console.warn(`[Server Polls Warning] Could not delete Discord message ${poll.messageId} for poll:`, msgErr.message);
        }
      }
    }

    // Remove from database
    await Poll.deleteOne({ _id: pollId });

    // Emit Socket.io delete event
    const io = getIo();
    if (io) {
      io.to(`guild_${guildId}`).emit('poll_delete', { pollId });
    }

    res.json({ message: 'Poll deleted successfully!' });
  } catch (error) {
    console.error(`[Server Polls Error] Failed to delete poll ${pollId}:`, error.message);
    res.status(500).json({ error: 'Failed to delete poll: ' + error.message });
  }
});

module.exports = router;
