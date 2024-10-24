const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['LivingRoom', 'Kitchen', 'MasterBedroom', 'CommonBedroom', 'MasterBedroom2']
    },
    itemName: {
        type: String,
        required: true
    },
    size: String,
    price: {
        type: Number,
        required: true
    },
    description: String
});

module.exports = mongoose.model('Pricing', pricingSchema);