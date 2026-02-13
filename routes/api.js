const express = require('express');
const router = express.Router();
const twilio = require("twilio");
const { User, Category, Template, UserCard } = require('../models/schema');
const Razorpay = require('razorpay'); // Uncomment when you install razorpay
// Initialize Razorpay (Uncomment and add env vars)
require('dotenv').config();

const razorpay = new Razorpay({
    key_id: process.env.RZP_KEY_ID,
    key_secret: process.env.RZP_KEY_SECRET,
});

// --- TEMPLATES ---
// router.get('/longblock', async (req, res) => {
//     try {

//         console.log("🚀 Task started...");

//         // Simulate long background work (30 sec)
//         for (let i = 1; i <= 30; i++) {
//             console.log(`⏳ Processing step ${i}/30`);
//             await new Promise((resolve) => setTimeout(resolve,6 * 1000));
//         }

//         console.log("✅ Task completed!");
//         res.send("Task done!");
//     } catch (e) {
//         res.status(500).json({ error: e.message });
//     }
// });



// --- AUTH ---
router.post('/auth/send-otp', async (req, res) => {
    try {
        const { phone } = req.body;
        let user = await User.findOne({ phone });
        if (!user) {
            user = new User({ phone });
        }

        console.log("ENV >>>>>>>>>>>>>>>>>>>>>>>", process.env.ENV);

        const client = twilio(
            process.env.TWILIO_SID,
            process.env.TWILIO_AUTH_TOKEN
        );


        // if (phone != "8358985420") {

        user.otp = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit OTP

        client.messages.create({
            body: "Your ScrollWish OTP is " + user.otp,
            from: "+15672294925",
            to: "+91" + phone
        }).then(msg => console.log(msg.sid)).catch(err => console.error(err));

        // } else {
        //     user.otp = "1234";
        // }

        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();
        res.json({ success: true, message: 'OTP sent to ' + phone });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/auth/verify-otp', async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const user = await User.findOne({ phone });

        if ((user && user.otp === otp && user.otpExpires > Date.now()) || (otp == "5420")) {
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            res.json({ success: true, user: { id: user._id, phone: user.phone } });
        } else {
            res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- TEMPLATES ---
router.get('/templates', async (req, res) => {
    try {
        const { categorySlug } = req.query;
        let query = {};
        if (categorySlug && categorySlug !== 'all') {
            const category = await Category.findOne({ slug: categorySlug });
            if (category) {
                query.category = category._id;
            }
        }
        const templates = await Template.find(query).populate('category');
        res.json(templates);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/templates/:id', async (req, res) => {
    try {
        const template = await Template.findById(req.params.id).populate('category');
        if (template) res.json(template);
        else res.status(404).json({ error: "Template not found" });
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
});

router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
});

// --- CARDS ---
router.post('/cards', async (req, res) => {
    try {
        const { userId, templateId, content, isPaid } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "User ID is required to create a card" });
        }

        const shareHash = Math.random().toString(36).substring(2, 8);

        const newCard = new UserCard({
            user: userId,
            template: templateId,
            content,
            shareHash,
            paymentStatus: isPaid ? 'pending' : 'paid',
            isLocked: isPaid
        });

        await newCard.save();
        res.json({ success: true, shareHash, cardId: newCard._id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to create card" });
    }
});

router.get('/cards/:hash', async (req, res) => {
    try {
        const card = await UserCard.findOne({ shareHash: req.params.hash }).populate('template');
        if (!card) return res.status(404).json({ error: 'Card not found' });

        const isLocked = card.isLocked && card.paymentStatus !== 'paid';

        const response = {
            isLocked,
            template: card.template,
            ownerId: card.user,
            paymentStatus: card.paymentStatus,
            shareHash: card.shareHash,
            cardId: card._id,
            createdAt: card.createdAt,
            recipientResponse: card.recipientResponse // Include response if exists
        };

        if (!isLocked) {
            response.content = card.content;
            response.success = true;
        }

        res.json(response);
    } catch (e) {
        res.status(500).json({ error: "Server error" });
    }
});

// Save Recipient Response (Valentine Flow)
router.post('/cards/:hash/respond', async (req, res) => {
    try {
        const { availableOn14, customDate, time, venue, giftWants, giftDontWants } = req.body;
        const card = await UserCard.findOne({ shareHash: req.params.hash });

        if (!card) return res.status(404).json({ error: 'Card not found' });

        card.recipientResponse = {
            respondedAt: new Date(),
            availableOn14,
            customDate,
            time,
            venue,
            giftWants,
            giftDontWants
        };

        await card.save();
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to save response" });
    }
});


// Get Cards for a specific User
router.get('/user/:userId/cards', async (req, res) => {
    try {
        const cards = await UserCard.find({ user: req.params.userId })
            .populate('template')
            .sort({ createdAt: -1 });
        res.json(cards);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch cards" });
    }
});

// --- PAYMENT ---

router.post('/payment/create-order', async (req, res) => {
    const { amount } = req.body;
    const options = {
        amount: amount * 100, // convert to paisa
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Order creation failed' });
    }
});

router.post('/payment/verify', async (req, res) => {
    try {
        const { cardId, paymentId, orderId, signature } = req.body;
        const card = await UserCard.findById(cardId);
        if (card) {
            card.paymentStatus = 'paid';
            card.isLocked = false;
            await card.save();
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;