const mongoose = require('mongoose');


const adminSchema = new mongoose.Schema({
    role: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    email: {
        type: String,
        min: 6,
        max: 255
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 2048
    },
    role: {
        type: Number,
        required: true
    },
    create_date: {
        type: Date,
        default: Date.now
    }
}, { collection: "admin" }
);

module.exports = mongoose.model('Admin', adminSchema);