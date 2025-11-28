const express = require('express');
const router = express.Router();
const admin = require('../middleware/admin');
const collector = require('../services/statsCollector');

router.get('/live-stats', admin, (req, res) => {
    const stats = collector.getAll();
    res.json(stats);
});

module.exports = router;
