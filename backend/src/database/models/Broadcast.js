const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  message: { type: String, default: '' },
  embed: { type: Object, default: null },
  button: { type: Object, default: null }, // Legacy single button support
  buttons: { type: Array, default: [] }, // Array of { label, url }
  sentDMs: [
    {
      userId: { type: String, required: true },
      messageId: { type: String, required: true }
    }
  ],
  revoked: { type: Boolean, default: false },
  
  // Progress tracking & filters
  status: { type: String, enum: ['pending', 'sending', 'completed', 'cancelled', 'failed'], default: 'pending' },
  totalTargets: { type: Number, default: 0 },
  successCount: { type: Number, default: 0 },
  failCount: { type: Number, default: 0 },
  filterRole: { type: String, default: '' },
  excludeRole: { type: String, default: '' },
  delayInterval: { type: Number, default: 1 }, // Stagger delay in seconds
  scheduledAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Broadcast', broadcastSchema);
