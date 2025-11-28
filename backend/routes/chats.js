const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
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

module.exports = router;
