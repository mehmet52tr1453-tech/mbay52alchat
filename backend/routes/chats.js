const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const auth = require('../middleware/auth'); // sadece giriş yapmış kullanıcı

// 1-1 sohbet oluştur (yoksa yeni, varsa id’sini dön)
router.post('/private', auth, async (req, res) => {
    const { targetId } = req.body; // karşı tarafın user id
    const me = req.user.id;

    // önce var mı kontrol et
    let chat = await Chat.findOne({
        type: 'private',
        participants: { $all: [me, targetId] }
    });

    if (!chat) {
        chat = await Chat.create({
            type: 'private',
            participants: [me, targetId],
            aiEnabled: false
        });
    }
    res.json(chat);
});

// Kullanıcının sohbetlerini getir
router.get('/my-chats', auth, async (req, res) => {
    try {
        const chats = await Chat.find({ participants: req.user.id })
            .populate('participants', 'username email')
            .sort({ updatedAt: -1 });

        // Her sohbet için son mesajı getir
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

// Mesaj gönder
router.post('/:chatId/messages', auth, async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content, type = 'text', fileUrl, fileName, fileSize } = req.body;

        // Sohbetin var olduğunu ve kullanıcının katılımcı olduğunu kontrol et
        const chat = await Chat.findOne({
            _id: chatId,
            participants: req.user.id
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found or access denied' });
        }

        const message = await Message.create({
            chatId,
            sender: req.user.id,
            content,
            type,
            fileUrl,
            fileName,
            fileSize
        });

        // Sohbetin updatedAt'ini güncelle
        chat.updatedAt = new Date();
        await chat.save();

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'username email');

        res.json(populatedMessage);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Sohbet mesajlarını getir
router.get('/:chatId/messages', auth, async (req, res) => {
    try {
        const { chatId } = req.params;
        const { limit = 50, skip = 0 } = req.query;

        // Sohbetin var olduğunu ve kullanıcının katılımcı olduğunu kontrol et
        const chat = await Chat.findOne({
            _id: chatId,
            participants: req.user.id
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found or access denied' });
        }

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

module.exports = router;
