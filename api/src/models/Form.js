const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
    bhkType: {
        type: String,
        required: true,
        enum: ['1 BHK', '2 BHK', '3 BHK']
    },
    selectedOptions: {
        type: Map,
        of: [String],
        validate: {
            validator: function (v) {
                return Object.keys(v).length > 0;
            },
            message: 'At least one option must be selected for each category'
        }
    },
    carpetArea: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    propertyName: {
        type: String,
        trim: true,
        maxlength: 100
    }
}, { timestamps: true });

module.exports = mongoose.model('Form', formSchema);