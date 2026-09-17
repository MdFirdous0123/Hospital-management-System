const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    medicalHistory: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
