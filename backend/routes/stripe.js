const express = require('express');
const Stripe = require('stripe');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

router.post('/create-checkout', auth, async (req, res) => {
    const { tokenAmount, priceId } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [{ price: priceId, quantity: 1 }],
            client_reference_id: req.user.id,
            metadata: { tokenAmount },
            success_url: (process.env.SUCCESS_URL || 'alchat://stripe/success') + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: process.env.CANCEL_URL || 'alchat://stripe/cancel',
        });

        res.json({ url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Webhook
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
        console.log(`[STRIPE] ${extra} tokens added to user:${userId}`);
    }
    res.json({ received: true });
});

module.exports = router;
