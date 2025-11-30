const express = require('express');
const router = express.Router();
const admin = require('../middleware/admin');
const collector = require('../services/statsCollector');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// Live stats
router.get('/live-stats', admin, (req, res) => {
    const stats = collector.getAll();
    res.json(stats);
});

// Get all chats (for monitoring)
router.get('/chats', admin, async (req, res) => {
    try {
        const chats = await Chat.find()
            .populate('participants', 'username email')
            .sort({ updatedAt: -1 })
            .limit(100);

        // Get last message for each chat
        const chatsWithLastMessage = await Promise.all(
            chats.map(async (chat) => {
                const lastMessage = await Message.findOne({ chatId: chat._id })
                    .sort({ createdAt: -1 })
                    .populate('sender', 'username');

                return {
                    ...chat.toObject(),
                    lastMessage
                };
            })
        );

        res.json(chatsWithLastMessage);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get messages for a specific chat
router.get('/chats/:chatId/messages', admin, async (req, res) => {
    try {
        const { chatId } = req.params;
        const { limit = 100, skip = 0 } = req.query;

        const messages = await Message.find({ chatId })
            .populate('sender', 'username email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Message.countDocuments({ chatId });

        res.json({
            messages: messages.reverse(),
            total,
            hasMore: total > (parseInt(skip) + messages.length)
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get all messages (with filters)
router.get('/messages', admin, async (req, res) => {
    try {
        const { type, userId, limit = 50, skip = 0 } = req.query;

        const filter = {};
        if (type) filter.type = type;
        if (userId) filter.sender = userId;

        const messages = await Message.find(filter)
            .populate('sender', 'username email')
            .populate('chatId')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Message.countDocuments(filter);

        res.json({
            messages,
            total,
            hasMore: total > (parseInt(skip) + messages.length)
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get user's chat history
router.get('/users/:userId/chats', admin, async (req, res) => {
    try {
        const { userId } = req.params;

        const chats = await Chat.find({ participants: userId })
            .populate('participants', 'username email')
            .sort({ updatedAt: -1 });

        res.json(chats);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delete a chat (admin only)
router.delete('/chats/:chatId', admin, async (req, res) => {
    try {
        const { chatId } = req.params;

        // Delete all messages in the chat
        await Message.deleteMany({ chatId });

        // Delete the chat
        await Chat.findByIdAndDelete(chatId);

        res.json({ message: 'Chat deleted successfully' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
