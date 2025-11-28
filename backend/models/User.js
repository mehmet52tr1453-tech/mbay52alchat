const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  // Token Limits
  monthlyTokenLimit: { type: Number, default: 0 },      // 0 = limitsiz
  monthlyTokenUsed: { type: Number, default: 0 },      // reset cron ile
  tokenResetAt: { type: Date, default: Date.now }, // son reset

  // AI Settings
  aiModel: { type: String, enum: ['gpt-3.5-turbo', 'gpt-4', 'claude'], default: 'gpt-3.5-turbo' },

  // Notifications
  fcmToken: String
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
