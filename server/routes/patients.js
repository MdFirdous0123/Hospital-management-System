const router = require('express').Router();
const Patient = require('../models/Patient');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
    try { res.json(await Patient.find().sort({ createdAt: -1 })); }
    catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
    try { res.status(201).json(await Patient.create(req.body)); }
    catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
    try {
        const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.json(patient);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.json({ message: 'Patient deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
