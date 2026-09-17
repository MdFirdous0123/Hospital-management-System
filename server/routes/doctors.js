const router = require('express').Router();
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
    try { res.json(await Doctor.find().sort({ createdAt: -1 })); }
    catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
    try { res.status(201).json(await Doctor.create(req.body)); }
    catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        res.json(doctor);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        res.json({ message: 'Doctor deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
