const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    type: { type: String, enum: ['private', 'ai', 'group'], default: 'private' },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    aiEnabled: { type: Boolean, default: false },
    aiModel: String
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
