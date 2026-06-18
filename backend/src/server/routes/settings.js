const express = require('express');
const router = express.Router();
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getGuildSettings, saveGuildSettings } = require('../../database/settingsManager');
const client = require('../../bot/client');
const authMiddleware = require('../middleware/auth');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { GifUtil, GifFrame } = require('gifwrap');
const { getModerationLogs } = require('../../database/logManager');

// Get settings for a guild
router.get('/:guildId', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  try {
    const settings = await getGuildSettings(guildId);
    res.json(settings);
  } catch (error) {
    console.error(`[Server Settings Error] Failed to fetch settings for ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings for a guild
router.post('/:guildId', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  const newSettings = req.body;

  try {
    const settings = await saveGuildSettings(guildId, newSettings);
    res.json(settings);
  } catch (error) {
    console.error(`[Server Settings Error] Failed to update settings for ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Publish verification message to guild channel
router.post('/:guildId/verification-embed', authMiddleware, async (req, res) => {
  const { guildId } = req.params;

  try {
    const settings = await getGuildSettings(guildId);
    if (!settings || !settings.verification.enabled || !settings.verification.channelId) {
      return res.status(400).json({ error: 'Verification is disabled or channel is not configured.' });
    }

    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this guild.' });
    }

    const channel = guild.channels.cache.get(settings.verification.channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Configured verification channel was not found.' });
    }

    const embedDesc = settings.verification.welcomeMessage || (
      settings.verification.type === 'reaction'
        ? 'React to this message with the emoji below to verify and gain access to the server.'
        : 'Click the button below to verify and gain access to the server.'
    );

    const embed = new EmbedBuilder()
      .setTitle('Verification Required')
      .setDescription(embedDesc)
      .setColor('#2563eb')
      .setThumbnail(guild.iconURL({ size: 128 }))
      .setFooter({ text: `${guild.name} Verification System` });

    let msg;
    if (settings.verification.type === 'reaction') {
      msg = await channel.send({ embeds: [embed] });
      
      const emojiToReact = settings.verification.reactionEmoji || '✅';
      try {
        await msg.react(emojiToReact);
      } catch (reactErr) {
        console.error(`[Server Settings Warning] Bot failed to react with '${emojiToReact}':`, reactErr.message);
        if (emojiToReact !== '✅') {
          await msg.react('✅').catch(() => {});
        }
      }

      settings.verification.messageId = msg.id;
      if (typeof settings.save === 'function') {
        await settings.save();
      } else {
        await saveGuildSettings(guildId, settings);
      }
    } else {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('verify_member')
          .setLabel(settings.verification.buttonText || 'Verify')
          .setStyle(ButtonStyle.Success)
      );

      msg = await channel.send({ embeds: [embed], components: [row] });

      settings.verification.messageId = '';
      if (typeof settings.save === 'function') {
        await settings.save();
      } else {
        await saveGuildSettings(guildId, settings);
      }
    }

    res.json({ message: 'Verification message sent successfully!' });
  } catch (error) {
    console.error(`[Server Settings Error] Failed to publish verification embed for ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to send verification message.' });
  }
});

// Publish ticket creation message to guild channel
router.post('/:guildId/tickets-embed', authMiddleware, async (req, res) => {
  const { guildId } = req.params;

  try {
    const settings = await getGuildSettings(guildId);
    if (!settings || !settings.tickets || !settings.tickets.enabled || !settings.tickets.channelId) {
      return res.status(400).json({ error: 'Ticket system is disabled or channel is not configured.' });
    }

    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this guild.' });
    }

    const channel = guild.channels.cache.get(settings.tickets.channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Configured ticket channel was not found.' });
    }

    const embed = new EmbedBuilder()
      .setTitle(settings.tickets.title || 'Support Ticket')
      .setDescription(settings.tickets.welcomeMessage || 'Click the button below to open a ticket. Our support team will help you shortly.')
      .setColor('#2563eb')
      .setThumbnail(guild.iconURL({ size: 128 }))
      .setFooter({ text: `${guild.name} Support System` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_ticket')
        .setLabel(settings.tickets.buttonText || 'Create Ticket')
        .setStyle(ButtonStyle.Success)
    );

    await channel.send({ embeds: [embed], components: [row] });

    res.json({ message: 'Ticket system panel embed published successfully!' });
  } catch (error) {
    console.error(`[Server Settings Error] Failed to publish tickets embed for ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to send ticket panel message: ' + error.message });
  }
});

// Trigger Custom Mass-DM Broadcast
router.post('/:guildId/mass-dm', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  const { message, button, buttons, embed, filterRole, excludeRole, delayInterval } = req.body;
  const { startMassDMBroadcast } = require('../../bot/utils/massDM');

  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this guild.' });
    }

    // Trigger the broadcast in the background
    startMassDMBroadcast(client, guildId, { message, button, buttons, embed, filterRole, excludeRole, delayInterval });

    res.json({ message: 'Mass DM broadcast successfully started in the background!' });
  } catch (error) {
    console.error(`[Server Settings Error] Failed to start mass DM for ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to start mass DM broadcast.' });
  }
});

// Send Test DM
router.post('/:guildId/mass-dm/test', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  const { message, button, buttons, embed } = req.body;
  const { sendTestDM } = require('../../bot/utils/massDM');

  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this guild.' });
    }

    const adminUserId = req.user.id;
    if (!adminUserId) {
      return res.status(400).json({ error: 'User ID not found in session.' });
    }

    const success = await sendTestDM(client, adminUserId, guildId, { message, button, buttons, embed });
    if (success) {
      res.json({ message: 'Test DM sent successfully to your Discord account!' });
    } else {
      res.status(500).json({ error: 'Failed to send test DM. Make sure your DMs are open.' });
    }
  } catch (error) {
    console.error(`[Server Settings Error] Failed to send test DM:`, error.message);
    res.status(500).json({ error: 'Failed to send test DM: ' + error.message });
  }
});

// Get scheduled DMs
router.get('/:guildId/scheduled-dms', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  const ScheduledDM = require('../../database/models/ScheduledDM');
  try {
    const scheduled = await ScheduledDM.find({ guildId, status: 'pending' }).sort({ publishAt: 1 });
    res.json(scheduled);
  } catch (error) {
    console.error(`[Server Settings Error] Failed to get scheduled DMs:`, error.message);
    res.status(500).json({ error: 'Failed to fetch scheduled DMs' });
  }
});

// Create scheduled DM
router.post('/:guildId/scheduled-dms', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  const { message, buttons, embed, filterRole, excludeRole, delayInterval, publishAt } = req.body;
  const ScheduledDM = require('../../database/models/ScheduledDM');

  if (!publishAt) {
    return res.status(400).json({ error: 'Publish time is required.' });
  }

  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this guild.' });
    }

    const scheduledDate = new Date(publishAt);
    if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      return res.status(400).json({ error: 'Publish time must be a valid future date/time.' });
    }

    const scheduled = await ScheduledDM.create({
      guildId,
      message: message || '',
      buttons: buttons || [],
      embed: embed && embed.enabled ? embed : null,
      filterRole: filterRole || '',
      excludeRole: excludeRole || '',
      delayInterval: Number(delayInterval) || 1,
      publishAt: scheduledDate,
      status: 'pending'
    });

    res.json({ message: 'Mass DM broadcast scheduled successfully!', scheduled });
  } catch (error) {
    console.error(`[Server Settings Error] Failed to schedule DM broadcast:`, error.message);
    res.status(500).json({ error: 'Failed to schedule DM broadcast: ' + error.message });
  }
});

// Delete/Cancel scheduled DM
router.delete('/:guildId/scheduled-dms/:id', authMiddleware, async (req, res) => {
  const { guildId, id } = req.params;
  const ScheduledDM = require('../../database/models/ScheduledDM');
  try {
    const deleted = await ScheduledDM.findOneAndDelete({ _id: id, guildId, status: 'pending' });
    if (deleted) {
      res.json({ message: 'Scheduled DM broadcast cancelled and deleted!' });
    } else {
      res.status(404).json({ error: 'Scheduled DM broadcast not found or already sent.' });
    }
  } catch (error) {
    console.error(`[Server Settings Error] Failed to delete scheduled DM broadcast:`, error.message);
    res.status(500).json({ error: 'Failed to delete scheduled DM broadcast.' });
  }
});

// Get recent broadcasts
router.get('/:guildId/broadcasts', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  const mongoose = require('mongoose');

  if (mongoose.connection.readyState !== 1) {
    console.warn(`[Server Settings] MongoDB is offline. Returning empty broadcasts list fallback for guild ${guildId}`);
    return res.json([]);
  }

  const Broadcast = require('../../database/models/Broadcast');
  try {
    const broadcasts = await Broadcast.find({ guildId })
      .sort({ createdAt: -1 })
      .limit(20)
      .maxTimeMS(2000);
    res.json(broadcasts);
  } catch (error) {
    console.error(`[Server Settings Error] Failed to fetch broadcasts for ${guildId}:`, error.message);
    // Return clean empty fallback instead of HTTP 500 error
    res.json([]);
  }
});

// Revoke DMs of a broadcast
router.post('/:guildId/broadcasts/:broadcastId/revoke', authMiddleware, async (req, res) => {
  const { guildId, broadcastId } = req.params;
  const { revokeBroadcastDMs } = require('../../bot/utils/massDM');
  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this guild.' });
    }
    // Trigger background revocation
    revokeBroadcastDMs(client, broadcastId);
    res.json({ message: 'DMs revocation successfully started in the background!' });
  } catch (error) {
    console.error(`[Server Settings Error] Failed to revoke DMs for broadcast ${broadcastId}:`, error.message);
    res.status(500).json({ error: 'Failed to start DMs revocation.' });
  }
});

// Send styled message to a server channel
router.post('/:guildId/channel-message', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  const { channelId, message, button, embed, buttons, ping } = req.body;

  if (!channelId) {
    return res.status(400).json({ error: 'Target channel is required.' });
  }

  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this guild.' });
    }

    const channel = guild.channels.cache.get(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Target channel was not found on this server.' });
    }

    // Construct the premium styled Discord embed
    const embeds = [];
    if (embed && embed.enabled && (embed.title || embed.description)) {
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

      // Embed Fields Builder
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

      // Custom Footer Configuration
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

    // Support multiple buttons
    const components = [];
    let buttonsList = [];
    if (buttons && Array.isArray(buttons)) {
      buttonsList = buttons.filter(btn => btn && btn.label && btn.url);
    } else if (button && button.enabled && button.label && button.url) {
      buttonsList = [{ label: button.label, url: button.url }];
    }

    if (buttonsList.length > 0) {
      const row = new ActionRowBuilder();
      buttonsList.slice(0, 5).forEach(btn => {
        row.addComponents(
          new ButtonBuilder()
            .setLabel(btn.label.substring(0, 80))
            .setURL(btn.url)
            .setStyle(ButtonStyle.Link)
        );
      });
      components.push(row);
    }

    // Construct text message content, incorporating ping target
    let formattedMessage = message || '';
    if (formattedMessage) {
      formattedMessage = formattedMessage.replace(/{server}/g, guild.name);
    }

    let pingPrefix = '';
    if (ping && ping.type !== 'none') {
      if (ping.type === 'everyone') {
        pingPrefix = '@everyone';
      } else if (ping.type === 'here') {
        pingPrefix = '@here';
      } else if (ping.type === 'role' && ping.roleId) {
        pingPrefix = `<@&${ping.roleId}>`;
      }
    }

    if (pingPrefix) {
      formattedMessage = pingPrefix + (formattedMessage ? '\n' + formattedMessage : '');
    }

    if (formattedMessage && formattedMessage.length > 2000) {
      formattedMessage = formattedMessage.substring(0, 2000);
    }

    if (!formattedMessage && embeds.length === 0) {
      return res.status(400).json({ error: 'Please enter a message or enable a rich embed to send.' });
    }

    await channel.send({
      content: formattedMessage || undefined,
      embeds: embeds.length > 0 ? embeds : undefined,
      components: components.length > 0 ? components : undefined
    });

    res.json({ message: 'Styled message published successfully!' });
  } catch (error) {
    console.error(`[Server Settings Error] Failed to publish message to channel ${channelId}:`, error.message);
    res.status(500).json({ error: 'Failed to send message: ' + error.message });
  }
});

const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure multer storage
const uploadDir = path.join(__dirname, '../../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `welcome-${req.params.guildId}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, JPEG, and GIF files are allowed.'));
    }
  }
});

// Get moderation logs for a guild
router.get('/:guildId/logs', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  try {
    const logs = await getModerationLogs(guildId);
    res.json(logs);
  } catch (error) {
    console.error(`[Server Settings Error] Failed to fetch moderation logs for ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch moderation logs' });
  }
});

// File upload endpoint with 16:9 crop & GIF support
router.post('/:guildId/upload', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const isGif = req.file.mimetype === 'image/gif' || path.extname(req.file.originalname).toLowerCase() === '.gif';

  // Ensure GifError is defined globally so that the gifwrap library doesn't throw a ReferenceError
  global.GifError = require('gifwrap').GifError;

  try {
    // Parse crop parameters if sent (e.g. from frontend cropper)
    let cropX = req.body.cropX ? Math.round(parseFloat(req.body.cropX)) : null;
    let cropY = req.body.cropY ? Math.round(parseFloat(req.body.cropY)) : null;
    let cropWidth = req.body.cropWidth ? Math.round(parseFloat(req.body.cropWidth)) : null;
    let cropHeight = req.body.cropHeight ? Math.round(parseFloat(req.body.cropHeight)) : null;

    if (isGif) {
      console.log(`[Upload] Processing animated GIF: ${filePath}`);
      const gif = await GifUtil.read(filePath);

      const origWidth = gif.width;
      const origHeight = gif.height;

      if (cropX === null || cropY === null || cropWidth === null || cropHeight === null) {
        // Enforce center 16:9 crop
        if (origWidth / origHeight > 16 / 9) {
          cropHeight = origHeight;
          cropWidth = Math.round(origHeight * (16 / 9));
          cropX = Math.round((origWidth - cropWidth) / 2);
          cropY = 0;
        } else {
          cropWidth = origWidth;
          cropHeight = Math.round(origWidth * (9 / 16));
          cropX = 0;
          cropY = Math.round((origHeight - cropHeight) / 2);
        }
      }

      // Clamp crop values to be strictly within image bounds
      cropX = Math.max(0, Math.min(origWidth - 1, cropX));
      cropY = Math.max(0, Math.min(origHeight - 1, cropY));
      cropWidth = Math.max(1, Math.min(origWidth - cropX, cropWidth));
      cropHeight = Math.max(1, Math.min(origHeight - cropY, cropHeight));

      const newFrames = [];
      const accumCanvas = createCanvas(origWidth, origHeight);
      const accumCtx = accumCanvas.getContext('2d');

      // Keep track of the canvas states to restore if disposalMethod is 3
      let prevCanvasState = null;

      for (let i = 0; i < gif.frames.length; i++) {
        const frame = gif.frames[i];

        // Save current canvas state if disposalMethod is 3 (Restore to previous)
        if (frame.disposalMethod === 3) {
          prevCanvasState = createCanvas(origWidth, origHeight);
          const prevCtx = prevCanvasState.getContext('2d');
          prevCtx.drawImage(accumCanvas, 0, 0);
        }

        // Create a temporary canvas for this frame's raw bitmap
        const frameCanvas = createCanvas(frame.bitmap.width, frame.bitmap.height);
        const frameCtx = frameCanvas.getContext('2d');
        const imgData = frameCtx.createImageData(frame.bitmap.width, frame.bitmap.height);
        
        // Copy the frame's bitmap data to the canvas image data
        imgData.data.set(frame.bitmap.data);
        frameCtx.putImageData(imgData, 0, 0);

        // Draw this frame onto the accumulator canvas
        accumCtx.drawImage(frameCanvas, frame.xOffset, frame.yOffset);

        // Extract the cropped region from the accumulator canvas
        const croppedCanvas = createCanvas(cropWidth, cropHeight);
        const croppedCtx = croppedCanvas.getContext('2d');
        croppedCtx.drawImage(
          accumCanvas,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );

        // Get the cropped image data
        const croppedImgData = croppedCtx.getImageData(0, 0, cropWidth, cropHeight);
        const buffer = Buffer.from(croppedImgData.data);

        // Create new GifFrame with the cropped data
        const newFrame = new GifFrame({
          width: cropWidth,
          height: cropHeight,
          data: buffer
        }, {
          delayCentisecs: frame.delayCentisecs,
          disposalMethod: 1, // Since it is now coalesced/full frame, 1 (Do Not Dispose) is safest
          xOffset: 0,
          yOffset: 0
        });

        newFrames.push(newFrame);

        // Apply disposal method for the next frame
        if (frame.disposalMethod === 2) {
          // Clear the frame's region to transparent
          accumCtx.clearRect(frame.xOffset, frame.yOffset, frame.bitmap.width, frame.bitmap.height);
        } else if (frame.disposalMethod === 3 && prevCanvasState) {
          // Restore to previous state
          accumCtx.clearRect(0, 0, origWidth, origHeight);
          accumCtx.drawImage(prevCanvasState, 0, 0);
        }
      }

      // Optimize: downsample if too many frames
      let finalFrames = newFrames;
      if (finalFrames.length > 40) {
        const skipRate = Math.ceil(finalFrames.length / 40);
        finalFrames = finalFrames.filter((_, idx) => idx % skipRate === 0);
        console.log(`[Upload] Downsampled GIF from ${newFrames.length} to ${finalFrames.length} frames.`);
      }

      await GifUtil.write(filePath, finalFrames, { loops: gif.loops });
      console.log(`[Upload] GIF processed and written successfully.`);
    } else {
      console.log(`[Upload] Processing static image: ${filePath}`);
      const image = await loadImage(filePath);
      const canvas = createCanvas(800, 450); // Enforce 16:9 ratio
      const ctx = canvas.getContext('2d');

      const origWidth = image.width;
      const origHeight = image.height;

      if (cropX === null || cropY === null || cropWidth === null || cropHeight === null) {
        // Enforce center 16:9 crop
        if (origWidth / origHeight > 16 / 9) {
          cropHeight = origHeight;
          cropWidth = Math.round(origHeight * (16 / 9));
          cropX = Math.round((origWidth - cropWidth) / 2);
          cropY = 0;
        } else {
          cropWidth = origWidth;
          cropHeight = Math.round(origWidth * (9 / 16));
          cropX = 0;
          cropY = Math.round((origHeight - cropHeight) / 2);
        }
      }

      // Clamp crop values to be strictly within image bounds
      cropX = Math.max(0, Math.min(origWidth - 1, cropX));
      cropY = Math.max(0, Math.min(origHeight - 1, cropY));
      cropWidth = Math.max(1, Math.min(origWidth - cropX, cropWidth));
      cropHeight = Math.max(1, Math.min(origHeight - cropY, cropHeight));

      // Draw cropped area
      ctx.drawImage(
        image,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, 800, 450
      );

      const buffer = await canvas.encode('png');
      fs.writeFileSync(filePath, buffer);
      console.log(`[Upload] Static image cropped to 16:9 and saved.`);
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (err) {
    console.error(`[Upload Error] Failed to process uploaded background:`, err.message, err.stack);
    res.status(500).json({ error: `Failed to process background media: ${err.message}` });
  }
});

// Cancel active Mass-DM Broadcast
router.post('/:guildId/broadcasts/:broadcastId/cancel', authMiddleware, async (req, res) => {
  const { guildId, broadcastId } = req.params;
  const { cancelMassDMBroadcast } = require('../../bot/utils/massDM');
  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this guild.' });
    }
    const cancelled = await cancelMassDMBroadcast(broadcastId);
    if (cancelled) {
      res.json({ message: 'Mass DM broadcast cancelled successfully!' });
    } else {
      res.status(400).json({ error: 'Broadcast is not currently running or cannot be cancelled.' });
    }
  } catch (error) {
    console.error(`[Server Settings Error] Failed to cancel broadcast ${broadcastId}:`, error.message);
    res.status(500).json({ error: 'Failed to cancel broadcast.' });
  }
});

const MessageTemplate = require('../../database/models/MessageTemplate');

// Get templates
router.get('/:guildId/templates', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  const { type } = req.query; // 'announcement' | 'dm'
  try {
    const filter = { guildId };
    if (type) filter.type = type;
    const templates = await MessageTemplate.find(filter).sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    console.error(`[Server Settings Error] Failed to get templates for ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Create/Update template
router.post('/:guildId/templates', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  const { name, type, data } = req.body;
  if (!name || !type || !data) {
    return res.status(400).json({ error: 'Name, type, and data are required.' });
  }
  try {
    // Upsert template by name & type for the guild
    const template = await MessageTemplate.findOneAndUpdate(
      { guildId, name, type },
      { data },
      { new: true, upsert: true }
    );
    res.json({ message: 'Template saved successfully!', template });
  } catch (error) {
    console.error(`[Server Settings Error] Failed to save template for ${guildId}:`, error.message);
    res.status(500).json({ error: 'Failed to save template: ' + error.message });
  }
});

// Delete template
router.delete('/:guildId/templates/:templateId', authMiddleware, async (req, res) => {
  const { guildId, templateId } = req.params;
  try {
    const deleted = await MessageTemplate.findOneAndDelete({ _id: templateId, guildId });
    if (deleted) {
      res.json({ message: 'Template deleted successfully!' });
    } else {
      res.status(404).json({ error: 'Template not found.' });
    }
  } catch (error) {
    console.error(`[Server Settings Error] Failed to delete template ${templateId}:`, error.message);
    res.status(500).json({ error: 'Failed to delete template.' });
  }
});

const ScheduledAnnouncement = require('../../database/models/ScheduledAnnouncement');

// Get scheduled announcements
router.get('/:guildId/scheduled', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  try {
    // Return pending scheduled announcements sorted by publishAt
    const scheduled = await ScheduledAnnouncement.find({ guildId, status: 'pending' }).sort({ publishAt: 1 });
    res.json(scheduled);
  } catch (error) {
    console.error(`[Server Settings Error] Failed to get scheduled announcements:`, error.message);
    res.status(500).json({ error: 'Failed to fetch scheduled announcements' });
  }
});

// Create scheduled announcement
router.post('/:guildId/scheduled', authMiddleware, async (req, res) => {
  const { guildId } = req.params;
  const { channelId, message, embed, ping, buttons, publishAt } = req.body;

  if (!channelId || !publishAt) {
    return res.status(400).json({ error: 'Target channel and publish time are required.' });
  }

  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'Bot is not in this guild.' });
    }

    const channel = guild.channels.cache.get(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Target channel was not found on this server.' });
    }

    const scheduledDate = new Date(publishAt);
    if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      return res.status(400).json({ error: 'Publish time must be a valid future date/time.' });
    }

    const scheduled = await ScheduledAnnouncement.create({
      guildId,
      channelId,
      message,
      embeds: embed && embed.enabled ? [embed] : [],
      ping,
      buttons: buttons || [],
      publishAt: scheduledDate,
      status: 'pending'
    });

    res.json({ message: 'Announcement scheduled successfully!', scheduled });
  } catch (error) {
    console.error(`[Server Settings Error] Failed to schedule announcement:`, error.message);
    res.status(500).json({ error: 'Failed to schedule announcement: ' + error.message });
  }
});

// Delete/Cancel scheduled announcement
router.delete('/:guildId/scheduled/:announcementId', authMiddleware, async (req, res) => {
  const { guildId, announcementId } = req.params;
  try {
    const deleted = await ScheduledAnnouncement.findOneAndDelete({ _id: announcementId, guildId, status: 'pending' });
    if (deleted) {
      res.json({ message: 'Scheduled announcement cancelled and deleted!' });
    } else {
      res.status(404).json({ error: 'Scheduled announcement not found or already sent.' });
    }
  } catch (error) {
    console.error(`[Server Settings Error] Failed to delete scheduled announcement:`, error.message);
    res.status(500).json({ error: 'Failed to delete scheduled announcement.' });
  }
});

// Resolve YouTube handle or URL to Channel ID and Channel Name
router.post('/:guildId/youtube/resolve', authMiddleware, async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'YouTube channel URL or handle is required.' });
  }

  let targetUrl = url.trim();

  // If input is already a UC... channel ID, skip fetch and return it directly!
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(targetUrl)) {
    return res.json({
      success: true,
      channelId: targetUrl,
      channelName: 'YouTube Channel',
      channelUrl: `https://www.youtube.com/channel/${targetUrl}`
    });
  }

  // Handle bare handle/username input (e.g. '@timo_xiter' or 'timo_xiter')
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    if (targetUrl.startsWith('@')) {
      targetUrl = `https://www.youtube.com/${targetUrl}`;
    } else {
      targetUrl = `https://www.youtube.com/@${targetUrl}`;
    }
  }

  try {
    const axios = require('axios');
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 6000
    });

    const html = response.data;
    
    // 1. Try matching channel link in html
    let channelIdMatch = html.match(/https:\/\/www\.youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})/);
    
    // 2. Try itemprop="channelId"
    if (!channelIdMatch) {
      channelIdMatch = html.match(/<meta itemprop="channelId" content="(UC[a-zA-Z0-9_-]{22})"/);
    }

    // 3. Try "channelId":"..."
    if (!channelIdMatch) {
      channelIdMatch = html.match(/"channelId"\s*:\s*"(UC[a-zA-Z0-9_-]{22})"/);
    }

    // 4. Try href link
    if (!channelIdMatch) {
      channelIdMatch = html.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/);
    }

    // 5. Try a wider regex match for any youtube.com/channel/UC... link
    if (!channelIdMatch) {
      channelIdMatch = html.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})/i);
    }

    // 6. Try searching for og:url meta property
    if (!channelIdMatch) {
      channelIdMatch = html.match(/meta\s+property="og:url"\s+content="https:\/\/www\.youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})"/i);
    }

    // 7. Fallback: Search for any UC... channel ID in the HTML response
    if (!channelIdMatch) {
      const ucMatches = html.match(/UC[a-zA-Z0-9_-]{22}/g);
      if (ucMatches && ucMatches.length > 0) {
        channelIdMatch = [null, ucMatches[0]];
      }
    }

    if (!channelIdMatch) {
      return res.status(400).json({ error: 'Could not resolve channel ID. Please make sure the URL or handle is valid.' });
    }

    const channelId = channelIdMatch[1];

    // Extract channel name/title
    let channelName = '';
    const titleMatch = html.match(/<meta itemprop="name" content="([^"]+)"/);
    if (titleMatch) {
      channelName = titleMatch[1];
    } else {
      const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
      if (ogTitleMatch) {
        channelName = ogTitleMatch[1];
      } else {
        const titleTagMatch = html.match(/<title>(.*?)<\/title>/);
        if (titleTagMatch) {
          channelName = titleTagMatch[1].replace(' - YouTube', '');
        } else {
          channelName = targetUrl.split('/').pop();
        }
      }
    }

    // Decode standard XML/HTML entities
    channelName = channelName
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");

    res.json({
      success: true,
      channelId,
      channelName,
      channelUrl: targetUrl
    });
  } catch (err) {
    console.error(`[YouTube Resolver Error] Failed to resolve channel URL ${targetUrl}:`, err.message);
    res.status(500).json({ error: `Failed to fetch/resolve YouTube channel: ${err.message}` });
  }
});

module.exports = router;
