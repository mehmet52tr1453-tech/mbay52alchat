const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    type: { type: String, enum: ['text', 'image', 'video', 'audio', 'file'], default: 'text' },
    fileUrl: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
    isAI: { type: Boolean, default: false },
    aiModel: { type: String },
    read: { type: Boolean, default: false }
}, { timestamps: true });

// Index for faster queries
MessageSchema.index({ chatId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
