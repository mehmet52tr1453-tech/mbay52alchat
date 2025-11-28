const admin = require('firebase-admin');

// serviceAccount’ı indir: Project settings → Service accounts → Generate new private key
// const serviceAccount = require('../keys/firebase-adminsdk.json');
// NOT: Gerçek projede bu dosya olmalı. Şimdilik mock yapıyoruz veya env'den okutuyoruz.

/*
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
*/

// Mock implementation if no service account
if (admin.apps.length === 0) {
    // admin.initializeApp(); // Hata vermemesi için comment out
}

async function sendFCM(token, title, body, data = {}) {
    try {
        if (admin.apps.length === 0) return; // Firebase init edilmediyse çık

        await admin.messaging().send({
            token,
            notification: { title, body },
            data,
            android: { priority: 'high' },
            apns: { payload: { aps: { sound: 'default' } } },
        });
    } catch (e) {
        console.error("FCM Error:", e.message);
    }
}

module.exports = { sendFCM };
