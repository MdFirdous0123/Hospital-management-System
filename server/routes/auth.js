const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already registered' });
        const user = await User.create({ name, email, password });
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role }, token });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });
        const match = await user.comparePassword(password);
        if (!match) return res.status(400).json({ message: 'Invalid email or password' });
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role }, token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
