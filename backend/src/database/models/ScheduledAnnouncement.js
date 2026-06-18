const mongoose = require('mongoose');

const scheduledAnnouncementSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  channelId: { type: String, required: true },
  message: { type: String, default: '' },
  ping: {
    type: { type: String, default: 'none' },
    roleId: { type: String, default: '' }
  },
  embeds: { type: Array, default: [] },
  buttons: { type: Array, default: [] },
  publishAt: { type: Date, required: true, index: true },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending', index: true },
  error: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('ScheduledAnnouncement', scheduledAnnouncementSchema);
