const express = require('express');
const router = express.Router();
const Form = require('../models/Form');

const options = {
    '1 BHK': {
        LivingRoom: ['TV Unit', 'Sofa', 'Crockery Unit', 'Shoe Rack', 'Console'],
        Kitchen: ['L Shape', 'U Shape', '|| Shape', 'G Shape', '| Shape'],
        MasterBedroom: ['Wardrobe + Lofts', 'Bed', 'Bed Side Tables', 'Dresser', 'Study'],
        WholeHousePainting: ['Enter Carpet Area'],
        FalseCeilingElectrical: ['Fire pipe Boxing', 'Basic', 'peripheral', 'Custom Design']
    },
    '2 BHK': {
        LivingRoom: ['TV Unit', 'Sofa', 'Crockery Unit', 'Shoe Rack', 'Console'],
        Kitchen: ['L Shape', 'U Shape', '|| Shape', 'G Shape', '| Shape'],
        MasterBedroom: ['Wardrobe + Lofts', 'Bed', 'Bed Side Tables', 'Dresser', 'Study'],
        CommonBedroom: ['Wardrobe + Lofts', 'Bed', 'Bed Side Tables', 'Dresser', 'Study'],
        WholeHousePainting: ['Enter Carpet Area'],
        FalseCeilingElectrical: ['Fire pipe Boxing', 'Basic', 'peripheral', 'Custom Design']
    },
    '3 BHK': {
        LivingRoom: ['TV Unit', 'Sofa', 'Crockery Unit', 'Shoe Rack', 'Console'],
        Kitchen: ['L Shape', 'U Shape', '|| Shape', 'G Shape', '| Shape'],
        MasterBedroom: ['Wardrobe + Lofts', 'Bed', 'Bed Side Tables', 'Dresser', 'Study'],
        CommonBedroom: ['Wardrobe + Lofts', 'Bed', 'Bed Side Tables', 'Dresser', 'Study'],
        MasterBedroom2: ['Wardrobe + Lofts', 'Bed', 'Bed Side Tables', 'Dresser', 'Study'],
        WholeHousePainting: ['Enter Carpet Area'],
        FalseCeilingElectrical: ['Fire pipe Boxing', 'Basic', 'peripheral', 'Custom Design']
    }
};

router.get('/options/:bhkType', (req, res) => {
    const bhkType = decodeURIComponent(req.params.bhkType);
    console.log("Requested BHK type:", bhkType);
    if (!options[bhkType]) {
        console.log("Invalid BHK type requested");
        return res.status(400).json({ error: 'Invalid BHK type' });
    }
    console.log("Sending options for", bhkType, ":", options[bhkType]);
    res.json(options[bhkType]);
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
    if (options[bhkType][category].includes(customOption)) {
        return res.status(400).json({ error: 'Option already exists' });
    }
    options[bhkType][category].push(customOption);
    res.json({ message: 'Custom option added successfully', updatedOptions: options[bhkType][category] });
});

module.exports = router;
