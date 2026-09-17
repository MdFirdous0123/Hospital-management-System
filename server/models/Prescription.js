const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    diagnosis: { type: String, required: true },
    medicines: [{
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        duration: { type: String, required: true }
    }],
    notes: { type: String, default: '' },
    followUpDate: { type: String },
    uploadedFile: {
        filename: { type: String },
        originalName: { type: String },
        mimetype: { type: String },
        uploadedAt: { type: Date }
    },
    type: { type: String, enum: ['written', 'uploaded'], default: 'written' },
    contactStatus: { type: String, enum: ['pending', 'contacted', 'resolved'], default: 'pending' },
    doctorReply: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
