const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const User = require('../models/User');
const admin = require('../middleware/admin');

const upload = multer({ dest: 'uploads/' });

router.post('/bulk-token-limit', admin, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
        const wb = XLSX.readFile(req.file.path);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        const ops = data.map(row =>
            User.updateOne(
                { username: String(row.username) },
                { monthlyTokenLimit: Number(row.limit) || 0 }
            )
        );

        await Promise.all(ops);
        fs.unlinkSync(req.file.path); // cleanup
        res.json({ updated: data.length });
    } catch (e) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(400).json({ error: e.message });
    }
});

module.exports = router;
