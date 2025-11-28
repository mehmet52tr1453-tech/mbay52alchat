const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get all users (Admin only)
router.get('/', admin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Kullanıcı adına göre ara (partial, büyük/küçük harf duyarsız)
router.get('/search', admin, async (req, res) => {
    const q = req.query.q || '';
    const users = await User.find({
        username: { $regex: q, $options: 'i' },
        role: 'user'
    }).select('username createdAt');
    res.json(users);
});

// Token güncelle (kendi hesabı)
router.patch('/fcm-token', auth, async (req, res) => {
    await User.findByIdAndUpdate(req.user.id, { fcmToken: req.body.token });
    res.json({ msg: 'ok' });
});

// Admin limit güncelleme
router.patch('/:id/token-limit', admin, async (req, res) => {
    const limit = Number(req.body.limit) || 0;
    await User.findByIdAndUpdate(req.params.id, { monthlyTokenLimit: limit });
    res.json({ msg: 'updated' });
});

// Admin model güncelleme
router.patch('/:id/model', admin, async (req, res) => {
    const { model } = req.body;
    await User.findByIdAndUpdate(req.params.id, { aiModel: model });
    res.json({ msg: 'ok' });
});

module.exports = router;
