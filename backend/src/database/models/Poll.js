const mongoose = require('mongoose');

const pollOptionSchema = new mongoose.Schema({
  id: { type: String, required: true }, // e.g. "opt_0", "opt_1", ...
  text: { type: String, required: true },
  votes: { type: [String], default: [] } // Array of Discord User IDs
});

const pollSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true },
  question: { type: String, required: true },
  description: { type: String },
  options: [pollOptionSchema],
  settings: {
    multipleChoice: { type: Boolean, default: false },
    anonymous: { type: Boolean, default: false },
    showResultsBeforeEnding: { type: Boolean, default: true },
    expiresAt: { type: Date },
    color: { type: String, default: '#2563eb' },
    imageUrl: { type: String },
    thumbnailUrl: { type: String }
  },
  status: { type: String, enum: ['active', 'ended'], default: 'active' },
  creatorId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Poll', pollSchema);
