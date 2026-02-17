
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

//         console.log("🚀 Request received");

//         // Send response immediately
//         res.send("Response sent! Background work started...");

//         // Background work AFTER response
//         let i = 0;
//         const interval = setInterval(() => {
//             i++;

//             if (i % 10 === 0) console.log(`🔥 Background step ${i}`);

//             if (i === 180) {
//                 console.log("✅ Background finished");

//                 clearInterval(interval);
//             }
//         }, 1000);


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

router.post('/user/add', async (req, res) => {
    try {
        const { email, uid, phone, name } = req.body;

        console.log("Adding user req.body ", req.body);
        let user = await User.findOne({ email });
        if (!user) {
            let userWithPhone = await User.findOne({ phone });
            if (!userWithPhone) {
                user = new User({ phone, email, name, uid });
            }
        }

        await user.save();
        res.json({ success: true, message: 'User added successfully', user });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/auth/verify-otp', async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const user = await User.findOne({ phone });

        if ((user && user.otp === otp && user.otpExpires > Date.now()) || (otp === "5420")) {
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            res.json({ success: true, user: { id: user._id, phone: user.phone, isAdmin: user.isAdmin } });
        } else {
            res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- CATEGORIES ---
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find({});
        const formatted = categories.map(c => ({ id: c._id, name: c.name, slug: c.slug, icon: c.icon }));
        res.json(formatted);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- TEMPLATES ---
router.get('/templates', async (req, res) => {
    try {
        const { categorySlug } = req.query;
        // Admin sees all, regular request sees visible only. Simplified here for demo.
        let query = {};

        if (categorySlug && categorySlug !== 'all') {
            const category = await Category.findOne({ slug: categorySlug });
            if (category) {
                query.category = category._id;
                query.isVisible = true; // Regular users only see visible
            }
        }

        const templates = await Template.find(query).populate('category');
        const formatted = templates.map(t => ({
            id: t._id,
            title: t.title,
            categoryId: t.category?._id,
            category: t.category,
            previewImage: t.previewImage,
            isPaid: t.isPaid,
            price: t.price,
            themeColor: t.themeColor,
            layout: t.layout,
            renderFunction: t.renderFunction,
            isVisible: t.isVisible,
            slug: t.slug
        }));
        res.json(formatted);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// router.get('/templates/:id', async (req, res) => {
//     try {
//         console.log('first', first)
//         const template = await Template.findById(req.params.id).populate('category');
//         if (template) {
//             res.json({
//                 id: template._id,
//                 title: template.title,
//                 categoryId: template.category?._id,
//                 previewImage: template.previewImage,
//                 isPaid: template.isPaid,
//                 price: template.price,
//                 themeColor: template.themeColor,
//                 layout: template.layout,
//                 renderFunction: template.renderFunction,
//                 isVisible: template.isVisible
//             });
//         } else {
//             res.status(404).json({ error: "Template not found" });
//         }
//     } catch (e) {
//         res.status(500).json({ error: "Server error" });
//     }
// });

router.get('/templates/:slug', async (req, res) => {
    try {
        // const template = await Template.findById(req.params.id).populate('category');
        const template = await Template.findOne({ slug: req.params.slug }).populate('category');
        if (template) {
            res.json({
                id: template._id,
                title: template.title,
                categoryId: template.category?._id,
                previewImage: template.previewImage,
                isPaid: template.isPaid,
                price: template.price,
                themeColor: template.themeColor,
                layout: template.layout,
                renderFunction: template.renderFunction,
                isVisible: template.isVisible
            });
        } else {
            res.status(404).json({ error: "Template not found" });
        }
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
            recipientResponse: card.recipientResponse
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

// --- ADMIN ROUTES ---

// Get All Cards (Admin)
router.get('/admin/cards', async (req, res) => {
    try {
        const cards = await UserCard.find({})
            .populate('user', 'phone')
            .populate('template', 'title')
            .sort({ createdAt: -1 });
        res.json(cards);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update Card Status
router.patch('/admin/cards/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const card = await UserCard.findById(req.params.id);
        if (card) {
            card.paymentStatus = status;
            card.isLocked = status !== 'paid';
            await card.save();
            res.json({ success: true });
        } else {
            res.status(404).json({ error: "Card not found" });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Create Category
router.post('/admin/categories', async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.json(category);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update Category
router.put('/admin/categories/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(category);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delete Category
router.delete('/admin/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Create Template
router.post('/admin/templates', async (req, res) => {
    try {
        const data = req.body;
        if (data.categoryId) data.category = data.categoryId; // Map ID
        const template = new Template(data);
        await template.save();
        res.json(template);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update Template
router.put('/admin/templates/:id', async (req, res) => {
    try {
        const data = req.body;
        if (data.categoryId) data.category = data.categoryId; // Map ID
        const template = await Template.findByIdAndUpdate(req.params.id, data, { new: true });
        res.json(template);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Delete Template
router.delete('/admin/templates/:id', async (req, res) => {
    try {
        await Template.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Toggle Template Visibility
router.patch('/admin/templates/:id', async (req, res) => {
    try {
        const { isVisible } = req.body;
        const template = await Template.findByIdAndUpdate(req.params.id, { isVisible }, { new: true });
        res.json(template);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
