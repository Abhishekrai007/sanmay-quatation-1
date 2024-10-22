const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const session = require('express-session');

router.use(session({
    secret: "dasdasdasdsad",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // set to true if using https
}));

const options = {
    '1 BHK': {
        LivingRoom: ['TV Unit', 'Sofa', 'Crockery Unit', 'Shoe Rack', 'Console'],
        Kitchen: ['L Shape', 'U Shape', '|| Shape', 'G Shape', '| Shape'],
        MasterBedroom: ['Wardrobe + Lofts', 'Bed', 'Bed Side Tables', 'Dresser', 'Study'],
        WholeHousePainting: ['Enter Carpet Area'],
        FalseCeilingElectrical: ['Fire pipe Boxing', 'Basic', 'Peripheral', 'Custom Design']
    },
    '2 BHK': {
        LivingRoom: ['TV Unit', 'Sofa', 'Crockery Unit', 'Shoe Rack', 'Console'],
        Kitchen: ['L Shape', 'U Shape', '|| Shape', 'G Shape', '| Shape'],
        MasterBedroom: ['Wardrobe + Lofts', 'Bed', 'Bed Side Tables', 'Dresser', 'Study'],
        CommonBedroom: ['Wardrobe + Lofts', 'Bed', 'Bed Side Tables', 'Dresser', 'Study'],
        WholeHousePainting: ['Enter Carpet Area'],
        FalseCeilingElectrical: ['Fire pipe Boxing', 'Basic', 'Peripheral', 'Custom Design']
    },
    '3 BHK': {
        LivingRoom: ['TV Unit', 'Sofa', 'Crockery Unit', 'Shoe Rack', 'Console'],
        Kitchen: ['L Shape', 'U Shape', '|| Shape', 'G Shape', '| Shape'],
        MasterBedroom: ['Wardrobe + Lofts', 'Bed', 'Bed Side Tables', 'Dresser', 'Study'],
        CommonBedroom: ['Wardrobe + Lofts', 'Bed', 'Bed Side Tables', 'Dresser', 'Study'],
        MasterBedroom2: ['Wardrobe + Lofts', 'Bed', 'Bed Side Tables', 'Dresser', 'Study'],
        WholeHousePainting: ['Enter Carpet Area'],
        FalseCeilingElectrical: ['Fire pipe Boxing', 'Basic', 'Peripheral', 'Custom Design']
    }
};

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
        res.status(201).json({ message: 'Form submitted successfully', formId: formData._id });
    } catch (error) {
        res.status(400).json({ error: 'Error submitting form', details: error.message });
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

    // Add custom option to user-specific storage
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
