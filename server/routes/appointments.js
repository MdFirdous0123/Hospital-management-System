const router = require('express').Router();
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patient', 'name age phone')
            .populate('doctor', 'name specialization')
            .sort({ createdAt: -1 });
        res.json(appointments);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
    try {
        const appointment = await Appointment.create(req.body);
        const populated = await appointment.populate([
            { path: 'patient', select: 'name age phone' },
            { path: 'doctor', select: 'name specialization' }
        ]);
        res.status(201).json(populated);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('patient', 'name age phone')
            .populate('doctor', 'name specialization');
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        res.json(appointment);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        res.json({ message: 'Appointment deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
