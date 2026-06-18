const mongoose = require('mongoose');
const GuildSettings = require('./models/GuildSettings');

const memorySettings = new Map();

function getDefaultSettings(guildId) {
  return {
    guildId,
    welcome: {
      enabled: false,
      channelId: '',
      message: 'Welcome {user} to the server!',
      background: '',
      textColor: '#ffffff',
      fontFamily: 'Sans',
      gifSupport: false,
      avatarSize: 140,
      avatarX: 400,
      avatarY: 130,
      avatarRotation: 0,
      avatarBorderThickness: 6,
      avatarBorderColor: '#ffffff',
      usernameX: 400,
      usernameY: 320,
      usernameSize: 38,
      titleX: 400,
      titleY: 260,
      titleSize: 54,
      subtextX: 400,
      subtextY: 370,
      subtextSize: 22,
      textAlignment: 'center',
      fontWeight: 'bold',
      avatarEnabled: true,
      titleEnabled: true,
      usernameEnabled: true,
      subtextEnabled: true,
      
      layoutType: 'classic',
      titleText: 'WELCOME',
      subtextText: 'TO {server}',
      usernameColor: '#2563eb',
      subtextColor: 'rgba(255, 255, 255, 0.7)',
      textShadowEnabled: false,
      textShadowColor: '#000000',
      textShadowBlur: 5,
      avatarShadowEnabled: false,
      avatarShadowColor: '#2563eb',
      avatarShadowBlur: 15,
      overlayOpacity: 0.3,
      overlayColor: '#000000',
      cardBorderEnabled: false,
      cardBorderColor: '#2563eb',
      cardBorderThickness: 8
    },
    verification: {
      enabled: false,
      channelId: '',
      roleId: '',
      buttonText: 'Verify',
      welcomeMessage: 'Click the button below to verify your account and gain access to the server.',
      type: 'button',
      reactionEmoji: '✅',
      messageId: ''
    },
    autoRole: {
      enabled: false,
      roleId: ''
    },
    autoNickname: {
      enabled: false,
      format: 'Member | {username}'
    },
    moderation: {
      spam: {
        enabled: false,
        protectedChannels: [],
        maxMessages: 5,
        timeWindow: 5000,
        timeoutDuration: 5
      },
      links: {
        enabled: false,
        protectedChannels: [],
        allowedLinks: []
      }
    },
    youtube: {
      enabled: false,
      channelUrl: '',
      channelId: '',
      channelName: '',
      notifyMethod: 'channel',
      targetChannelId: '',
      pingRoleId: '',
      messageTemplate: '{url}',
      lastVideoId: ''
    },
    tickets: {
      enabled: false,
      channelId: '',
      categoryId: '',
      supportRoleId: '',
      buttonText: 'Create Ticket',
      title: 'Support Ticket',
      welcomeMessage: 'Click the button below to open a ticket. Our support team will help you shortly.',
      ticketMessage: 'Welcome {user}! Please describe your issue. Support staff will assist you shortly.'
    }
  };
}

async function getGuildSettings(guildId) {
  if (mongoose.connection.readyState === 1) {
    try {
      const settings = await GuildSettings.findOne({ guildId }).maxTimeMS(2500);
      if (settings) return settings;
      
      try {
        return await GuildSettings.create({ guildId });
      } catch (err) {
        console.warn(`[SettingsManager] Failed to create db setting, using default:`, err.message);
        return getDefaultSettings(guildId);
      }
    } catch (e) {
      console.warn(`[SettingsManager] MongoDB query failed: ${e.message}. Using in-memory settings.`);
    }
  }

  if (!memorySettings.has(guildId)) {
    memorySettings.set(guildId, getDefaultSettings(guildId));
  }
  return memorySettings.get(guildId);
}

async function saveGuildSettings(guildId, newSettings) {
  if (mongoose.connection.readyState === 1) {
    try {
      delete newSettings.guildId;
      delete newSettings._id;

      // Preserve poller-managed lastVideoId from being overwritten by stale dashboard settings
      const current = await GuildSettings.findOne({ guildId });
      if (current && newSettings.youtube) {
        if (newSettings.youtube.channelId !== current.youtube.channelId) {
          // If they connected a new channel, clear lastVideoId so the poller re-initializes it safely
          newSettings.youtube.lastVideoId = '';
        } else {
          // Otherwise, preserve the current poller state
          newSettings.youtube.lastVideoId = current.youtube.lastVideoId || '';
        }
      }

      const settings = await GuildSettings.findOneAndUpdate(
        { guildId },
        { $set: newSettings },
        { new: true, upsert: true }
      );
      if (settings) return settings;
    } catch (e) {
      console.warn(`[SettingsManager] MongoDB save failed: ${e.message}. Saving in memory.`);
    }
  }

  const current = await getGuildSettings(guildId);
  const updated = {
    ...current,
    ...newSettings,
    welcome: { ...current.welcome, ...newSettings.welcome },
    verification: { ...current.verification, ...newSettings.verification },
    autoRole: { ...current.autoRole, ...newSettings.autoRole },
    autoNickname: { ...current.autoNickname, ...newSettings.autoNickname },
    moderation: {
      spam: { ...current.moderation?.spam, ...newSettings.moderation?.spam },
      links: { ...current.moderation?.links, ...newSettings.moderation?.links }
    },
    youtube: { ...current.youtube, ...newSettings.youtube },
    tickets: { ...current.tickets, ...newSettings.tickets }
  };

  memorySettings.set(guildId, updated);
  return updated;
}

module.exports = { getGuildSettings, saveGuildSettings };
