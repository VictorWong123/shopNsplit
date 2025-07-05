const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'All fields required.' });

    // Check if session is available
    if (!req.session) {
        return res.status(503).json({ message: 'Server is starting up, please try again in a moment.' });
    }

    try {
        const existing = await User.findOne({ username });
        if (existing) return res.status(400).json({ message: 'Username already exists.' });
        const hash = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hash });
        await user.save();
        req.login(user, err => {
            if (err) {
                console.error('Login after register error:', err);
                return res.status(500).json({ message: 'Login after register failed.' });
            }
            res.json({ user: { id: user._id, username: user.username } });
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// Login
router.post('/login', (req, res, next) => {
    // Check if session is available
    if (!req.session) {
        return res.status(503).json({ message: 'Server is starting up, please try again in a moment.' });
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Login authentication error:', err);
            return res.status(500).json({ message: 'Server error.' });
        }
        if (!user) {
            return res.status(400).json({ message: info.message });
        }
        req.login(user, err => {
            if (err) {
                console.error('Login session error:', err);
                return res.status(500).json({ message: 'Login failed.' });
            }
            res.json({ user: { id: user._id, username: user.username } });
        });
    })(req, res, next);
});

// Logout
router.post('/logout', (req, res) => {
    req.logout(() => {
        res.json({ message: 'Logged out.' });
    });
});

// Get current user
router.get('/me', (req, res) => {
    if (!req.user) return res.json({ user: null });
    res.json({ user: { id: req.user._id, username: req.user.username } });
});

module.exports = router; 