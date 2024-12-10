const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Import bcrypt
const User = require('../model/User');

const router = express.Router();

// Middleware to authenticate token
const authenticate = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Extract user ID and email from the token
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Could not retrieve user profile' });
    }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const updates = { name, email };
        if (password) updates.password = await bcrypt.hash(password, 10); // Hash the password

        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Could not update profile' });
    }
});

module.exports = router;
