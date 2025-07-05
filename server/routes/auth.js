const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { userOperations } = require('../supabase');

const router = express.Router();

// Middleware to ensure session is ready
const ensureSessionReady = (req, res, next) => {
    if (!req.session) {
        return res.status(503).json({ message: 'Server is starting up, please try again in a moment.' });
    }
    next();
};

// Register
router.post('/register', ensureSessionReady, async (req, res) => {
    console.log('Register request received:', {
        body: req.body,
        session: !!req.session,
        environment: process.env.NODE_ENV
    });

    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'All fields required.' });
    }

    try {
        // Check if user already exists
        const existingUser = await userOperations.findUserByUsername(username);
        if (existingUser) {
            console.log('Username already exists:', username);
            return res.status(400).json({ message: 'Username already exists.' });
        }

        // Hash password and create user
        const hash = await bcrypt.hash(password, 10);
        const user = await userOperations.createUser(username, hash);
        console.log('User created:', user.id);

        // Log in the user after registration
        req.login(user, err => {
            if (err) {
                console.error('Login after register error:', err);
                return res.status(500).json({ message: 'Login after register failed.' });
            }
            console.log('User logged in after registration');
            res.json({ user: { id: user.id, username: user.username } });
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// Login
router.post('/login', ensureSessionReady, (req, res, next) => {
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
            res.json({ user: { id: user.id, username: user.username } });
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
    res.json({ user: { id: req.user.id, username: req.user.username } });
});

module.exports = router; 