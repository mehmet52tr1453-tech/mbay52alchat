const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email:    { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['admin', 'user'], default: 'user' },
  status:   { type: String, enum: ['active', 'paused', 'banned'], default: 'active' },
  expiresAt: Date,
  
  // AI & Token settings
  aiModel:  { type: String, enum: ['gpt-3.5-turbo', 'gpt-4', 'claude'], default: 'gpt-3.5-turbo' },
  monthlyTokenLimit: { type: Number, default: 0 }, // 0 = unlimited
  monthlyTokenUsed:  { type: Number, default: 0 },
  tokenResetAt:      { type: Date,   default: Date.now },
  
  apiKey:   String,
  fcmToken: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
