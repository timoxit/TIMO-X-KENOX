const mongoose = require('mongoose');

const guildSettingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true, index: true },
  welcome: {
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: '' },
    message: { type: String, default: 'Welcome {user} to {server}!' },
    background: { type: String, default: '' }, // Hex color or URL
    textColor: { type: String, default: '#ffffff' },
    fontFamily: { type: String, default: 'Sans' },
    gifSupport: { type: Boolean, default: false },
    avatarSize: { type: Number, default: 140 },
    avatarX: { type: Number, default: 400 },
    avatarY: { type: Number, default: 130 },
    avatarRotation: { type: Number, default: 0 },
    avatarBorderThickness: { type: Number, default: 6 },
    avatarBorderColor: { type: String, default: '#ffffff' },
    usernameX: { type: Number, default: 400 },
    usernameY: { type: Number, default: 320 },
    usernameSize: { type: Number, default: 38 },
    titleX: { type: Number, default: 400 },
    titleY: { type: Number, default: 260 },
    titleSize: { type: Number, default: 54 },
    subtextX: { type: Number, default: 400 },
    subtextY: { type: Number, default: 370 },
    subtextSize: { type: Number, default: 22 },
    textAlignment: { type: String, default: 'center' },
    fontWeight: { type: String, default: 'bold' },
    avatarEnabled: { type: Boolean, default: true },
    titleEnabled: { type: Boolean, default: true },
    usernameEnabled: { type: Boolean, default: true },
    subtextEnabled: { type: Boolean, default: true },
    
    // Premium features:
    layoutType: { type: String, default: 'classic' }, // classic, embed-card, embed-only, text-only
    titleText: { type: String, default: 'WELCOME' },
    subtextText: { type: String, default: 'TO {server}' },
    usernameColor: { type: String, default: '#2563eb' },
    subtextColor: { type: String, default: 'rgba(255, 255, 255, 0.7)' },
    
    textShadowEnabled: { type: Boolean, default: false },
    textShadowColor: { type: String, default: '#000000' },
    textShadowBlur: { type: Number, default: 5 },
    
    avatarShadowEnabled: { type: Boolean, default: false },
    avatarShadowColor: { type: String, default: '#2563eb' },
    avatarShadowBlur: { type: Number, default: 15 },
    
    overlayOpacity: { type: Number, default: 0.3 },
    overlayColor: { type: String, default: '#000000' },
    
    cardBorderEnabled: { type: Boolean, default: false },
    cardBorderColor: { type: String, default: '#2563eb' },
    cardBorderThickness: { type: Number, default: 8 }
  },
  verification: {
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: '' },
    roleId: { type: String, default: '' },
    buttonText: { type: String, default: 'Verify' },
    welcomeMessage: { type: String, default: 'Click the button below to verify your account and gain access to the server.' },
    type: { type: String, default: 'button' }, // 'button' or 'reaction'
    reactionEmoji: { type: String, default: '✅' },
    messageId: { type: String, default: '' }
  },
  autoRole: {
    enabled: { type: Boolean, default: false },
    roleId: { type: String, default: '' }
  },
  autoNickname: {
    enabled: { type: Boolean, default: false },
    format: { type: String, default: 'Member | {username}' }
  },
  moderation: {
    spam: {
      enabled: { type: Boolean, default: false },
      protectedChannels: { type: [String], default: [] },
      maxMessages: { type: Number, default: 5 },
      timeWindow: { type: Number, default: 5000 }, // ms
      timeoutDuration: { type: Number, default: 5 } // minutes
    },
    links: {
      enabled: { type: Boolean, default: false },
      protectedChannels: { type: [String], default: [] },
      allowedLinks: { type: [String], default: [] }
    }
  },
  youtube: {
    enabled: { type: Boolean, default: false },
    channelUrl: { type: String, default: '' },
    channelId: { type: String, default: '' },
    channelName: { type: String, default: '' },
    notifyMethod: { type: String, default: 'channel' },
    targetChannelId: { type: String, default: '' },
    pingRoleId: { type: String, default: '' },
    messageTemplate: { type: String, default: '{url}' },
    lastVideoId: { type: String, default: '' }
  },
  tickets: {
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: '' },
    categoryId: { type: String, default: '' },
    supportRoleId: { type: String, default: '' },
    buttonText: { type: String, default: 'Create Ticket' },
    title: { type: String, default: 'Support Ticket' },
    welcomeMessage: { type: String, default: 'Click the button below to open a ticket. Our support team will help you shortly.' },
    ticketMessage: { type: String, default: 'Welcome {user}! Please describe your issue. Support staff will assist you shortly.' }
  },
  tempVoice: {
    enabled: { type: Boolean, default: false },
    channelId: { type: String, default: '' },
    categoryId: { type: String, default: '' },
    nameTemplate: { type: String, default: '🔊 {username}\'s Room' }
  }
}, { timestamps: true });

guildSettingsSchema.statics.getOrCreate = async function(guildId) {
  let settings = await this.findOne({ guildId });
  if (!settings) {
    settings = await this.create({ guildId });
  }
  return settings;
};

module.exports = mongoose.model('GuildSettings', guildSettingsSchema);
