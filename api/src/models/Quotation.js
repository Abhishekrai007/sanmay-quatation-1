const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
    formId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Form',
        required: true
    },
    details: [{
        room: String,
        item: String,
        size: String,
        price: Number,
        description: String
    }],
    totalCost: Number,
    bhkType: String,
    finishType: String,
    coreType: String,
    carpetArea: String,
    validUntil: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Quotation', quotationSchema);