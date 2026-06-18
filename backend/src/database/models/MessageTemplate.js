const mongoose = require('mongoose');

const messageTemplateSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['announcement', 'dm'], required: true },
  data: { type: Object, required: true }
}, { timestamps: true });

// Avoid duplicate template names per type per guild
messageTemplateSchema.index({ guildId: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('MessageTemplate', messageTemplateSchema);
