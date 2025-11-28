const cron = require('node-cron');
const User = require('../models/User');

module.exports = () => {
    // Reset tokens on the 1st of every month
    cron.schedule('0 0 1 * *', async () => {
        try {
            await User.updateMany({}, { monthlyTokenUsed: 0, tokenResetAt: new Date() });
            console.log('[CRON] Token limits reset');
        } catch (e) {
            console.error('[CRON] Error resetting tokens', e);
        }
    });
};
