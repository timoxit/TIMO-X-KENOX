const ScheduledAnnouncement = require('../../database/models/ScheduledAnnouncement');
const ScheduledDM = require('../../database/models/ScheduledDM');
const { startMassDMBroadcast } = require('./massDM');
const client = require('../client');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function processScheduledAnnouncements() {
  try {
    const now = new Date();
    // Find pending scheduled announcements whose publishAt is <= now
    const pending = await ScheduledAnnouncement.find({
      status: 'pending',
      publishAt: { $lte: now }
    });

    if (pending.length === 0) return;

    console.log(`[Scheduler] Found ${pending.length} pending announcements to publish.`);

    for (const ann of pending) {
      try {
        const guild = client.guilds.cache.get(ann.guildId);
        if (!guild) {
          throw new Error('Bot is not in this guild.');
        }

        const channel = guild.channels.cache.get(ann.channelId);
        if (!channel) {
          throw new Error('Target channel was not found.');
        }

        // Construct Embeds
        const embeds = [];
        if (ann.embeds && Array.isArray(ann.embeds)) {
          for (const embed of ann.embeds) {
            if (embed && (embed.title || embed.description)) {
              const embedBuilder = new EmbedBuilder()
                .setColor(embed.color || '#2563eb')
                .setTimestamp();

              // Custom Author Configuration
              if (embed.author && embed.author.enabled && embed.author.name) {
                embedBuilder.setAuthor({
                  name: embed.author.name.replace(/{server}/g, guild.name).substring(0, 256),
                  iconURL: embed.author.iconURL || undefined,
                  url: embed.author.url || undefined
                });
              } else {
                embedBuilder.setAuthor({ 
                  name: guild.name, 
                  iconURL: guild.iconURL({ size: 128 }) || undefined 
                });
              }

              if (embed.title) {
                let formattedTitle = embed.title.replace(/{server}/g, guild.name);
                if (formattedTitle.length > 256) formattedTitle = formattedTitle.substring(0, 256);
                embedBuilder.setTitle(formattedTitle);
              }
              if (embed.description) {
                let formattedDesc = embed.description.replace(/{server}/g, guild.name);
                if (formattedDesc.length > 4000) formattedDesc = formattedDesc.substring(0, 4000);
                embedBuilder.setDescription(formattedDesc);
              }
              if (embed.thumbnail) embedBuilder.setThumbnail(embed.thumbnail);
              if (embed.image) embedBuilder.setImage(embed.image);

              // Fields
              if (embed.fields && Array.isArray(embed.fields)) {
                const validFields = embed.fields
                  .filter(f => f && f.name && f.value)
                  .slice(0, 25)
                  .map(f => ({
                    name: f.name.substring(0, 256),
                    value: f.value.substring(0, 1024),
                    inline: !!f.inline
                  }));
                if (validFields.length > 0) {
                  embedBuilder.addFields(validFields);
                }
              }

              // Footer
              if (embed.footer && embed.footer.enabled && embed.footer.text) {
                embedBuilder.setFooter({
                  text: embed.footer.text.replace(/{server}/g, guild.name).substring(0, 2048),
                  iconURL: embed.footer.iconURL || undefined
                });
              } else {
                embedBuilder.setFooter({ 
                  text: `${guild.name} Official Announcement`, 
                  iconURL: guild.iconURL({ size: 128 }) || undefined 
                });
              }

              embeds.push(embedBuilder);
            }
          }
        }

        // Construct Buttons (up to 5)
        const components = [];
        if (ann.buttons && Array.isArray(ann.buttons) && ann.buttons.length > 0) {
          const row = new ActionRowBuilder();
          ann.buttons.slice(0, 5).forEach(btn => {
            row.addComponents(
              new ButtonBuilder()
                .setLabel(btn.label.substring(0, 80))
                .setURL(btn.url)
                .setStyle(ButtonStyle.Link)
            );
          });
          components.push(row);
        }

        // Ping mentions
        let formattedMessage = ann.message || '';
        if (formattedMessage) {
          formattedMessage = formattedMessage.replace(/{server}/g, guild.name);
        }

        let pingPrefix = '';
        if (ann.ping && ann.ping.type !== 'none') {
          if (ann.ping.type === 'everyone') {
            pingPrefix = '@everyone';
          } else if (ann.ping.type === 'here') {
            pingPrefix = '@here';
          } else if (ann.ping.type === 'role' && ann.ping.roleId) {
            pingPrefix = `<@&${ann.ping.roleId}>`;
          }
        }

        if (pingPrefix) {
          formattedMessage = pingPrefix + (formattedMessage ? '\n' + formattedMessage : '');
        }

        if (formattedMessage && formattedMessage.length > 2000) {
          formattedMessage = formattedMessage.substring(0, 2000);
        }

        await channel.send({
          content: formattedMessage || undefined,
          embeds: embeds.length > 0 ? embeds : undefined,
          components: components.length > 0 ? components : undefined
        });

        // Mark as sent
        ann.status = 'sent';
        await ann.save();
        console.log(`[Scheduler] Successfully published scheduled announcement ID ${ann._id}`);
      } catch (err) {
        console.error(`[Scheduler Error] Failed to publish announcement ID ${ann._id}:`, err.message);
        ann.status = 'failed';
        ann.error = err.message;
        await ann.save();
      }
    }
  } catch (error) {
    console.error(`[Scheduler Critical Error]`, error.message);
  }
}

async function processScheduledDMs() {
  try {
    const now = new Date();
    // Find pending scheduled DMs whose publishAt is <= now
    const pending = await ScheduledDM.find({
      status: 'pending',
      publishAt: { $lte: now }
    });

    if (pending.length === 0) return;

    console.log(`[Scheduler] Found ${pending.length} pending scheduled DMs to start.`);

    for (const dm of pending) {
      try {
        const guild = client.guilds.cache.get(dm.guildId);
        if (!guild) {
          throw new Error('Bot is not in this guild.');
        }

        // Trigger mass DM broadcast
        await startMassDMBroadcast(client, dm.guildId, {
          message: dm.message,
          buttons: dm.buttons,
          embed: dm.embed,
          filterRole: dm.filterRole,
          excludeRole: dm.excludeRole,
          delayInterval: dm.delayInterval,
          scheduledAt: dm.publishAt
        });

        // Mark as sent
        dm.status = 'sent';
        await dm.save();
        console.log(`[Scheduler] Successfully triggered scheduled DM ID ${dm._id}`);
      } catch (err) {
        console.error(`[Scheduler Error] Failed to process scheduled DM ID ${dm._id}:`, err.message);
        dm.status = 'failed';
        dm.error = err.message;
        await dm.save();
      }
    }
  } catch (error) {
    console.error(`[Scheduler Critical Error for DMs]`, error.message);
  }
}

async function processExpiredPolls() {
  try {
    const Poll = require('../../database/models/Poll');
    const { renderPollEmbed, renderPollComponents, generatePollChart } = require('./pollHelper');
    const { getIo } = require('../../server/socket');

    const now = new Date();
    // Find active polls whose expiresAt is <= now
    const expiredPolls = await Poll.find({
      status: 'active',
      'settings.expiresAt': { $lte: now }
    });

    if (expiredPolls.length === 0) return;

    console.log(`[Scheduler] Found ${expiredPolls.length} expired polls to close.`);

    for (const poll of expiredPolls) {
      try {
        poll.status = 'ended';
        await poll.save();

        const guild = client.guilds.cache.get(poll.guildId);
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
                  const { AttachmentBuilder } = require('discord.js');
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
              console.warn(`[Scheduler Warning] Could not edit Discord message ${poll.messageId} to end expired poll:`, msgErr.message);
            }
          }
        }

        // Emit Socket.io update
        const io = getIo();
        if (io) {
          io.to(`guild_${poll.guildId}`).emit('poll_update', poll);
        }

        console.log(`[Scheduler] Closed expired poll ID ${poll._id}`);
      } catch (err) {
        console.error(`[Scheduler Error] Failed to process expired poll ID ${poll._id}:`, err.message);
      }
    }
  } catch (error) {
    console.error(`[Scheduler Critical Error for Polls]`, error.message);
  }
}

function startAnnouncementScheduler() {
  console.log('[Scheduler] Starting scheduled announcement, DM & poll checker (every 30 seconds)...');
  // Run once immediately on start
  processScheduledAnnouncements();
  processScheduledDMs();
  processExpiredPolls();

  setInterval(() => {
    processScheduledAnnouncements();
    processScheduledDMs();
    processExpiredPolls();
  }, 30000);
}

module.exports = { startAnnouncementScheduler };

