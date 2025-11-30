const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const router = express.Router();

// Register (Admin only in production, or public for demo)
router.post('/register', async (req, res) => {
    const { username, email, password, role, expiresAt, createdBy } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already exists' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({
            username, email, password: hashed, role, expiresAt, createdBy
        });
        res.json(user);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// DEBUG: List all users (remove in production)
router.get('/debug-users', async (req, res) => {
    try {
        const users = await User.find({}, 'email username role');
        res.json({
            count: users.length,
            dbName: mongoose.connection.name,
            users
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        console.log('Login attempt:', email);
        console.log('Received password length:', password.length);
        console.log('Stored password length:', user.password.length);
        console.log('Stored password (first 3 chars):', user.password.substring(0, 3));
        console.log('Received password (first 3 chars):', password.substring(0, 3));

        // DEBUG: Önce düz metin kontrolü yap
        let valid = false;
        if (password === user.password) {
            valid = true;
        } else {
            // Hash kontrolü (eski kullanıcılar için)
            valid = await bcrypt.compare(password, user.password);
        }

        if (!valid) return res.status(401).json({ error: 'Wrong password' });

        if (user.status === 'banned') return res.status(403).json({ error: 'Account suspended' });
        if (user.expiresAt && new Date() > new Date(user.expiresAt))
            return res.status(403).json({ error: 'Account expired' });

        const token = jwt.sign(
            { id: user._id, role: user.role, username: user.username },
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '7d' }
        );
        res.json({
            token,
            user: {
                id: user._id,
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
