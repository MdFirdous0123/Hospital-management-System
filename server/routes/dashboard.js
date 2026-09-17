const router = require('express').Router();
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/stats', async (req, res) => {
    try {
        const [totalPatients, totalDoctors, totalAppointments, totalPrescriptions,
            scheduledCount, completedCount, cancelledCount, patients, recentAppointments] = await Promise.all([
            Patient.countDocuments(),
            Doctor.countDocuments(),
            Appointment.countDocuments(),
            Prescription.countDocuments(),
            Appointment.countDocuments({ status: 'Scheduled' }),
            Appointment.countDocuments({ status: 'Completed' }),
            Appointment.countDocuments({ status: 'Cancelled' }),
            Patient.find({}, 'gender'),
            Appointment.find().sort({ createdAt: -1 }).limit(5)
                .populate('patient', 'name')
                .populate('doctor', 'name specialization')
        ]);

        const genderBreakdown = {
            male: patients.filter(p => p.gender === 'Male').length,
            female: patients.filter(p => p.gender === 'Female').length,
            other: patients.filter(p => p.gender === 'Other').length,
        };

        res.json({
            totalPatients, totalDoctors, totalAppointments, totalPrescriptions,
            scheduledCount, completedCount, cancelledCount, genderBreakdown, recentAppointments
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
