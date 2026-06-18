const mongoose = require('mongoose');

const moderationLogSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  actionType: { type: String, required: true }, // 'timeout', 'ban', 'kick', 'warn', 'message_delete', 'role_update'
  moderator: {
    id: { type: String, required: true },
    username: { type: String, required: true },
    avatar: { type: String }
  },
  target: {
    id: { type: String, required: true },
    username: { type: String, required: true },
    avatar: { type: String }
  },
  details: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ModerationLog', moderationLogSchema);
