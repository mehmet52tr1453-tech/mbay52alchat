const express = require('express');
const router = express.Router();
const User = require('../models/User');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');

// Get all users (Admin)
router.get('/', admin, async (req, res) => {
    try {
        const users = await User.find().populate('createdBy', 'username');
        res.json(users);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Search users (Public/User)
router.get('/search', auth, async (req, res) => {
    const q = req.query.q || '';
    try {
        const users = await User.find({
            username: { $regex: q, $options: 'i' },
            role: 'user'
        }).select('username createdAt');
        res.json(users);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update status (Admin)
router.patch('/:id/status', admin, async (req, res) => {
    const { status } = req.body;
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(user);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update Token Limit (Admin)
router.patch('/:id/token-limit', admin, async (req, res) => {
    const limit = Number(req.body.limit) || 0;
    try {
        await User.findByIdAndUpdate(req.params.id, { monthlyTokenLimit: limit });
        res.json({ msg: 'updated' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update AI Model (Admin)
router.patch('/:id/model', admin, async (req, res) => {
    const { model } = req.body;
    try {
        await User.findByIdAndUpdate(req.params.id, { aiModel: model });
        res.json({ msg: 'ok' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update FCM Token (User)
router.patch('/fcm-token', auth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { fcmToken: req.body.token });
        res.json({ msg: 'ok' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete User (Admin)
router.delete('/:id', admin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Deleted' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
