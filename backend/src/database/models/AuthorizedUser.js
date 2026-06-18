const mongoose = require('mongoose');

const authorizedUserSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true },
  discriminator: { type: String, default: '' },
  avatar: { type: String, default: '' },
  customNickname: { type: String, default: '' },
  customBio: { type: String, default: '' },
  isAdmin: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  authorizedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AuthorizedUser', authorizedUserSchema);
