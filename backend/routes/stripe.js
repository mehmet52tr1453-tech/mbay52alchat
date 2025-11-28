const express = require('express');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Checkout başlat
router.post('/create-checkout', auth, async (req, res) => {
    const { tokenAmount, priceId } = req.body; // priceId = Stripe fiyat ID

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{ price: priceId, quantity: 1 }],
        client_reference_id: req.user.id, // hangi kullanıcı
        metadata: { tokenAmount },        // ekstra veri
        success_url: process.env.SUCCESS_URL + '?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: process.env.CANCEL_URL,
    });

    res.json({ url: session.url });
});

// Webhook – ödeme başarılı
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_ENDPOINT_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const extra = Number(session.metadata.tokenAmount);

        await User.findByIdAndUpdate(userId, {
            $inc: { monthlyTokenLimit: extra },
        });
        console.log(`[STRIPE] ${extra} token eklendi user:${userId}`);
    }
    res.json({ received: true });
});

module.exports = router;
