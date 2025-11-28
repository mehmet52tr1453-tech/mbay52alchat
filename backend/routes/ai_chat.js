const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const auth = require('../middleware/auth');
// const Message = require('../models/Message'); // Message modelini henüz oluşturmadık ama referans verelim

const modelMap = { gpt: 'gpt-3.5-turbo', gpt4: 'gpt-4', claude: 'claude-3-haiku' };

router.post('/', auth, async (req, res) => {
    const { chatId, prompt } = req.body;

    const user = await User.findById(req.user.id);
    if (user.monthlyTokenLimit > 0 && user.monthlyTokenUsed >= user.monthlyTokenLimit) {
        return res.status(402).json({ error: 'Aylık token limiti doldu' });
    }

    const model = user.aiModel || 'gpt-3.5-turbo';
    let answer, used;

    try {
        if (model === 'claude') {
            // Claude stub (SDK gerektirir, şimdilik mock)
            answer = "Claude entegrasyonu henüz tamamlanmadı.";
            used = 100;
        } else {
            // OpenAI
            const completion = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                { model, messages: [{ role: 'user', content: prompt }] },
                { headers: { Authorization: `Bearer ${process.env.OPENAI_KEY}` } }
            );
            answer = completion.data.choices[0].message.content;
            used = completion.data.usage.total_tokens;
        }

        user.monthlyTokenUsed += used;
        await user.save();

        // Mesaj kaydetme işlemi burada yapılmalı (Message modelini import edip)
        // await Message.create({ chatId, senderId: 'ai', type: 'ai', content: answer });

        res.json({ answer, used, left: Math.max(0, (user.monthlyTokenLimit || 0) - user.monthlyTokenUsed) });
    } catch (error) {
        console.error("AI Error:", error.response?.data || error.message);
        res.status(500).json({ error: 'AI servisi hatası' });
    }
});

router.get('/token-left', auth, async (req, res) => {
    const user = await User.findById(req.user.id).select('monthlyTokenLimit monthlyTokenUsed');
    const left = user.monthlyTokenLimit === 0 ? null : Math.max(0, user.monthlyTokenLimit - user.monthlyTokenUsed);
    res.json({ left });
});

module.exports = router;
