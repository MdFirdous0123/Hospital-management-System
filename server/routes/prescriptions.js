const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Prescription = require('../models/Prescription');
const auth = require('../middleware/auth');

router.use(auth);

// Multer setup
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, WEBP, and PDF files are allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// GET all
router.get('/', async (req, res) => {
    try {
        const prescriptions = await Prescription.find()
            .populate('patient', 'name age gender phone')
            .populate('doctor', 'name specialization phone')
            .sort({ createdAt: -1 });
        res.json(prescriptions);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST written prescription
router.post('/', async (req, res) => {
    try {
        const prescription = await Prescription.create({ ...req.body, type: 'written' });
        const populated = await prescription.populate([
            { path: 'patient', select: 'name age gender phone' },
            { path: 'doctor', select: 'name specialization phone' }
        ]);
        res.status(201).json(populated);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// POST upload prescription image/PDF
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const { patient, doctor, notes } = req.body;
        if (!patient || !doctor) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Patient and Doctor are required' });
        }
        const prescription = await Prescription.create({
            patient, doctor,
            diagnosis: 'Uploaded Prescription — awaiting review',
            medicines: [{ name: 'See uploaded file', dosage: '—', duration: '—' }],
            notes: notes || '',
            type: 'uploaded',
            contactStatus: 'pending',
            uploadedFile: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimetype: req.file.mimetype,
                uploadedAt: new Date()
            }
        });
        const populated = await prescription.populate([
            { path: 'patient', select: 'name age gender phone' },
            { path: 'doctor', select: 'name specialization phone' }
        ]);
        res.status(201).json(populated);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// PATCH update status / doctor reply
router.patch('/:id/status', async (req, res) => {
    try {
        const { contactStatus, doctorReply } = req.body;
        const prescription = await Prescription.findByIdAndUpdate(
            req.params.id,
            { ...(contactStatus && { contactStatus }), ...(doctorReply !== undefined && { doctorReply }) },
            { new: true }
        ).populate([
            { path: 'patient', select: 'name age gender phone' },
            { path: 'doctor', select: 'name specialization phone' }
        ]);
        if (!prescription) return res.status(404).json({ message: 'Not found' });
        res.json(prescription);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const prescription = await Prescription.findByIdAndDelete(req.params.id);
        if (!prescription) return res.status(404).json({ message: 'Not found' });
        if (prescription.uploadedFile?.filename) {
            const filePath = path.join(uploadsDir, prescription.uploadedFile.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        res.json({ message: 'Prescription deleted' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
