const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const Quotation = require('../models/Quotation');
const crypto = require("crypto")
const session = require('express-session');
const nodemailer = require('nodemailer');
const dotenv = require("dotenv").config()
const { appendToSheet } = require('../utils/googleSheetService');
const { calculateQuotation } = require('../utils/quotationCalculator');

router.use(session({
    secret: "dasdasdasdsad",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const transporter = nodemailer.createTransport({
    service: 'gmail', // or your preferred email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

const pricing = {
    LivingRoom: {
        'TV Unit': { price: 41000, size: '5ft X 4ft', description: '1 drawer, 1 open unit & TV Panel' },
        'Sofa': { price: 35000, size: '6ft', description: '3 seater fabric sofa bed' },
        'Crockery Unit': { price: 32900, size: '4ft X 3ft', description: '2 drawer & Base Unit with Shutters and 1 shelf' },
        'Shoe Rack': { price: 11890, size: '3ft X 2ft', description: 'Base unit with shutters and 1 shelf' },
        'Console': { price: 27500, size: '3ft X 3ft', description: '1 drawer with base unit and 1 shelf' }
    },
    Kitchen: {
        'L Shape': { price: 140000, size: '7*8', description: 'L shaped Kitchen with Base unit on frame and shutters includes 3 SS drawers and 1 SS masala pullout' },
        'U Shape': { price: 199000, size: '7*8', description: 'U shaped Kitchen with Base unit on frame and shutters includes 6 SS drawers and 1 SS masala pullout' },
        '|| Shape': { price: 166900, size: '7*8', description: 'Parallel shaped Kitchen with Base unit on frame and shutters includes 5 SS drawers and 1 SS masala pullout' },
        'G Shape': { price: 215900, size: '7*8', description: 'G shaped Kitchen with Base unit on frame and shutters includes 6 SS drawers and 2 SS masala pullout' },
        '| Shape': { price: 90000, size: '7*8', description: 'Single platform Kitchen with Base unit on frame and shutters includes 3 SS drawers and 1 SS masala pullout' }
    },
    MasterBedroom: {
        'Wardrobe': { price: 63000, size: '6X7', description: '2 drawer, 5 shelves and hanging rod, Internal White Laminate' },
        'Lofts on Wardrobe': { price: 10700, size: '6X2', description: 'Lofts above wardrobe' },
        'Bed': { price: 42000, size: '5X6', description: 'Queen size Hydraulic lift-up bed' },
        'Bed Side Tables': { price: 13300, size: '1.5ft X 2', description: 'Wall mounted side table with drawer Qty 2' },
        'Dresser': { price: 17000, size: '2ft X 4ft', description: 'Base unit with shutters and 6inch dept wall unit with mirror' },
        "Vanity": { price: 7200, size: "2ft X 2ft", description: "Base Unit with Shutters" },
        "Study": { price: 0, size: "0ft X 0ft", description: "Add Description" }
    },
    CommonBedroom: {
        'Wardrobe': { price: 63000, size: '6X7', description: '2 drawer, 5 shelves and hanging rod, Internal White Laminate' },
        'Lofts on Wardrobe': { price: 10700, size: '6X2', description: 'Lofts above wardrobe' },
        'Bed': { price: 42000, size: '5X6', description: 'Queen size Hydraulic lift-up bed' },
        'Bed Side Tables': { price: 13300, size: '1.5ft X 2', description: 'Wall mounted side table with drawer Qty 2' },
        'Dresser': { price: 17000, size: '2ft X 4ft', description: 'Base unit with shutters and 6inch dept wall unit with mirror' },
        "Study": { price: 0, size: "0ft X 0ft", description: "Add Description" }
    },
    FalseCeilingElectrical: {
        'Fire pipe Boxing': { price: 80, isPerSqFt: true, description: 'Fire pipe boxing work' },
        'Basic': { price: 105, isPerSqFt: true, description: 'Basic false ceiling work' },
        'Peripheral': { price: 95, isPerSqFt: true, description: 'Peripheral false ceiling work' },
        'Custom Design': { price: 0, description: 'We will contact you for custom design requirements' }
    }
};

const options = {
    '1 BHK': {
        LivingRoom: ['TV Unit', 'Sofa', 'Crockery Unit', 'Shoe Rack', 'Console'],
        Kitchen: ['L Shape', 'U Shape', '|| Shape', 'G Shape', '| Shape'],
        MasterBedroom: ['Wardrobe', "Lofts on Wardrobe", 'Bed', 'Bed Side Tables', 'Dresser', 'Study', "Vanity"],
        WholeHousePainting: ['Enter Carpet Area'],
        FalseCeilingElectrical: ['Fire pipe Boxing', 'Basic', 'Peripheral', 'Custom Design']
    },
    '2 BHK': {
        LivingRoom: ['TV Unit', 'Sofa', 'Crockery Unit', 'Shoe Rack', 'Console'],
        Kitchen: ['L Shape', 'U Shape', '|| Shape', 'G Shape', '| Shape'],
        MasterBedroom: ['Wardrobe', "Lofts on Wardrobe", 'Bed', 'Bed Side Tables', 'Dresser', 'Study', "Vanity"],
        CommonBedroom: ['Wardrobe', "Lofts on Wardrobe", 'Bed', 'Bed Side Tables', 'Dresser', 'Study'],
        WholeHousePainting: ['Enter Carpet Area'],
        FalseCeilingElectrical: ['Fire pipe Boxing', 'Basic', 'Peripheral', 'Custom Design']
    },
    '3 BHK': {
        LivingRoom: ['TV Unit', 'Sofa', 'Crockery Unit', 'Shoe Rack', 'Console'],
        Kitchen: ['L Shape', 'U Shape', '|| Shape', 'G Shape', '| Shape'],
        MasterBedroom: ['Wardrobe', "Lofts on Wardrobe", 'Bed', 'Bed Side Tables', 'Dresser', 'Study', "Vanity"],
        CommonBedroom: ['Wardrobe', "Lofts on Wardrobe", 'Bed', 'Bed Side Tables', 'Dresser', 'Study'],
        MasterBedroom2: ['Wardrobe', "Lofts on Wardrobe", 'Bed', 'Bed Side Tables', 'Dresser', 'Study', "Vanity"],
        WholeHousePainting: ['Enter Carpet Area'],
        FalseCeilingElectrical: ['Fire pipe Boxing', 'Basic', 'Peripheral', 'Custom Design']
    },
    WholeHousePainting: {
        'Enter Carpet Area': {
            price: 55,
            isPerSqFt: true,
            needsCoats: true,
            description: 'Whole house painting with 3.5 coats'
        }
    },
};

async function sendQuotationEmail(email, quotationId, validUntil) {
    const quotationLink = `${process.env.FRONTEND_URL}/quotation/${quotationId}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Custom Interior Design Quotation',
        html: `
        <h2>Thank you for your interest!</h2>
        <p>Your custom interior design quotation is ready. Click the link below to view it:</p>
        <p><a href="${quotationLink}">${quotationLink}</a></p>
        <p>Please note that this quotation is valid until ${validUntil.toLocaleDateString()}.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
      `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

const userCustomOptions = {};

router.get('/options/:bhkType', (req, res) => {
    const bhkType = decodeURIComponent(req.params.bhkType);
    const userId = req.session.id;

    if (!options[bhkType]) {
        return res.status(400).json({ error: 'Invalid BHK type' });
    }

    const mergedOptions = JSON.parse(JSON.stringify(options[bhkType]));
    if (userCustomOptions[userId] && userCustomOptions[userId][bhkType]) {
        Object.keys(userCustomOptions[userId][bhkType]).forEach(category => {
            if (mergedOptions[category]) {
                mergedOptions[category] = [
                    ...mergedOptions[category],
                    ...userCustomOptions[userId][bhkType][category]
                ];
            }
        });
    }
    res.json(mergedOptions);
});

router.post('/submit', async (req, res) => {
    try {
        const formData = new Form(req.body);
        await formData.save();
        await appendToSheet(req.body);

        let totalCost = 0;
        const details = [];

        if (req.body.carpetArea) {
            const area = parseFloat(req.body.carpetArea);
            const coatedArea = area * 3.5;
            const paintingPrice = coatedArea * 55;

            details.push({
                room: 'WholeHousePainting',
                item: 'Enter Carpet Area',
                size: `${area} sq ft`,
                price: paintingPrice,
                description: `Whole house painting (${area} sq ft × 3.5 = ${coatedArea.toFixed(2)} sq ft @ ₹55/sq ft)`,
                isCustom: false
            });

            totalCost += paintingPrice;
        }

        Object.entries(req.body.selectedOptions).forEach(([room, options]) => {
            options.forEach(option => {
                if (pricing[room]?.[option]) {
                    const item = pricing[room][option];
                    let itemPrice = item.price;
                    let description = item.description;

                    // Handle per square foot pricing for FalseCeilingElectrical
                    if (room === 'FalseCeilingElectrical' && item.isPerSqFt) {
                        itemPrice = item.price * parseFloat(req.body.carpetArea || 0);
                        description = `${description} (${req.body.carpetArea} sq ft @ ₹${item.price}/sq ft)`;
                    }

                    // Handle WholeHousePainting calculation
                    if (room === 'WholeHousePainting') {
                        const area = parseFloat(req.body.carpetArea || 0);
                        const coatedArea = area * 3.5; // 3.5 coats
                        itemPrice = coatedArea * item.price;
                        description = `${description} (${area} sq ft × 3.5 coats = ${coatedArea} sq ft @ ₹${item.price}/sq ft)`;
                    }

                    // Handle custom options
                    if (option === 'Custom Design' || (!pricing[room]?.[option] && room !== 'WholeHousePainting')) {
                        description = 'Our team will contact you for custom requirements';
                        itemPrice = 0;
                    }

                    totalCost += itemPrice;
                    details.push({
                        room,
                        item: option,
                        size: item.size || `${req.body.carpetArea} sq ft`,
                        price: itemPrice,
                        description,
                        isCustom: !pricing[room]?.[option]
                    });
                } else {
                    details.push({
                        room,
                        item: option,
                        size: '-',
                        price: 0,
                        description: 'Our team will contact you for custom requirements',
                        isCustom: true
                    });
                }
            });
        });



        // Create quotation with 15 days validity
        const validUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
        const quotation = new Quotation({
            formId: formData._id,
            details,
            totalCost,
            bhkType: req.body.bhkType,
            finishType: 'Laminate',
            coreType: 'BWR & BWP (Only Vanity)',
            carpetArea: req.body.carpetArea,
            validUntil
        });

        await quotation.save();

        const emailSent = await sendQuotationEmail(
            req.body.email,
            quotation._id,
            validUntil
        );

        // Generate secure quotation link
        const quotationId = crypto.randomBytes(32).toString('hex');

        res.status(201).json({
            message: 'Form submitted successfully',
            formId: formData._id,
            quotationId: quotation._id,
            emailSent,
            quotationLink: `/quotation/${quotation._id}`
        });


    } catch (error) {
        res.status(400).json({
            error: 'Error submitting form',
            details: error.message
        });
    }
});

router.get('/quotation/:quotationId', async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.quotationId);
        if (!quotation) {
            return res.status(404).json({ error: 'Quotation not found' });
        }

        // Check if quotation is expired
        if (new Date() > quotation.validUntil) {
            return res.status(410).json({ error: 'Quotation has expired' });
        }

        res.json(quotation);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching quotation' });
    }
});

router.post('/addCustomOption', (req, res) => {
    const { bhkType, category, customOption } = req.body;
    const userId = req.session.id;

    if (!bhkType || !category || !customOption) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (!options[bhkType] || !options[bhkType][category]) {
        return res.status(400).json({ error: 'Invalid BHK type or category' });
    }

    if (category === 'Kitchen' || category === 'WholeHousePainting') {
        return res.status(400).json({ error: 'Cannot add custom options to this category' });
    }

    if (customOption.length < 2 || customOption.length > 50) {
        return res.status(400).json({ error: 'Custom option must be between 2 and 50 characters' });
    }

    if (!userCustomOptions[userId]) {
        userCustomOptions[userId] = {};
    }

    if (!userCustomOptions[userId][bhkType]) {
        userCustomOptions[userId][bhkType] = {};
    }

    if (!userCustomOptions[userId][bhkType][category]) {
        userCustomOptions[userId][bhkType][category] = [];
    }

    userCustomOptions[userId][bhkType][category].push(customOption);

    res.json({ message: 'Custom option added successfully', updatedOptions: [...options[bhkType][category], ...userCustomOptions[userId][bhkType][category]] });
});

module.exports = router;