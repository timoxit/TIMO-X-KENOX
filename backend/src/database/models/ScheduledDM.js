const mongoose = require('mongoose');

const scheduledDMSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  message: { type: String, default: '' },
  buttons: { type: Array, default: [] },
  embed: { type: Object, default: null },
  filterRole: { type: String, default: '' },
  excludeRole: { type: String, default: '' },
  delayInterval: { type: Number, default: 1 },
  publishAt: { type: Date, required: true, index: true },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending', index: true },
  error: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('ScheduledDM', scheduledDMSchema);
