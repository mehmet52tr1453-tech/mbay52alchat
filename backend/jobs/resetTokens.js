const cron = require('node-cron');
const User = require('../models/User');

// Her ayın 1’i 00:00
module.exports = () => {
    cron.schedule('0 0 1 * *', async () => {
        await User.updateMany({}, { monthlyTokenUsed: 0, tokenResetAt: new Date() });
        console.log('[CRON] Token limits reset');
    });
};
