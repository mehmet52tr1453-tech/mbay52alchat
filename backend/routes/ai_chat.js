const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const auth = require('../middleware/auth');

// AI Chat Endpoint
router.post('/ai', auth, async (req, res) => {
    const { prompt } = req.body;

    try {
        const user = await User.findById(req.user.id);

        // Check Token Limit
        if (user.monthlyTokenLimit > 0 && user.monthlyTokenUsed >= user.monthlyTokenLimit) {
            return res.status(402).json({ error: 'Monthly token limit exceeded' });
        }

        const model = user.aiModel || 'gpt-3.5-turbo';
        let answer, used;

        // Simulate AI Response (Replace with actual API call)
        // In production, use process.env.OPENAI_KEY
        if (model === 'claude') {
            // Mock Claude
            answer = `[Claude] Echo: ${prompt}`;
            used = prompt.length + answer.length;
        } else {
            // Mock OpenAI
            // const completion = await axios.post(...)
            answer = `[${model}] Echo: ${prompt}`;
            used = prompt.length + answer.length;
        }

        // Update usage
        user.monthlyTokenUsed += used;
        await user.save();

        const left = user.monthlyTokenLimit === 0 ? null : Math.max(0, user.monthlyTokenLimit - user.monthlyTokenUsed);

        res.json({ answer, used, left });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Get Token Left
router.get('/token-left', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('monthlyTokenLimit monthlyTokenUsed');
        const left = user.monthlyTokenLimit === 0 ? null : Math.max(0, user.monthlyTokenLimit - user.monthlyTokenUsed);
        res.json({ left });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
