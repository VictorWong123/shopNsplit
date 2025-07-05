const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const userStorage = require('../userStorage');

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
        environment: process.env.NODE_ENV,
        mongodbUri: process.env.MONGODB_URI ? 'Set' : 'Not set'
    });

    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'All fields required.' });

    try {
        if (process.env.NODE_ENV === 'production' && process.env.MONGODB_URI) {
            console.log('Using MongoDB for user registration...');
            // Use MongoDB in production
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                console.log('Username already exists:', username);
                return res.status(400).json({ message: 'Username already exists.' });
            }

            const hash = await bcrypt.hash(password, 10);
            const user = new User({ username, password: hash });
            await user.save();
            console.log('User saved to MongoDB:', user._id);

            console.log('About to login MongoDB user:', { userId: user._id, username: user.username });
            req.login(user, err => {
                if (err) {
                    console.error('Login after register error:', err);
                    console.error('Login error stack:', err.stack);
                    return res.status(500).json({ message: 'Login after register failed.' });
                }
                console.log('User logged in after registration');
                // Handle both MongoDB (_id) and in-memory (id) user objects
                const userId = user._id || user.id;
                res.json({ user: { id: userId, username: user.username } });
            });
        } else {
            console.log('Using in-memory storage for user registration...');
            // Use in-memory storage for development or production fallback
            if (userStorage.getUser(username)) {
                console.log('Username already exists in memory:', username);
                return res.status(400).json({ message: 'Username already exists.' });
            }

            const hash = await bcrypt.hash(password, 10);
            const user = { id: Date.now().toString(), username, password: hash };
            userStorage.addUser(username, user);
            console.log('User added to memory storage:', user.id);

            console.log('About to login memory user:', { userId: user.id, username: user.username });
            req.login(user, err => {
                if (err) {
                    console.error('Login after register error:', err);
                    console.error('Login error stack:', err.stack);
                    return res.status(500).json({ message: 'Login after register failed.' });
                }
                console.log('User logged in after registration');
                // Handle both MongoDB (_id) and in-memory (id) user objects
                const userId = user._id || user.id;
                res.json({ user: { id: userId, username: user.username } });
            });
        }
    } catch (err) {
        console.error('Register error:', err);
        console.error('Error stack:', err.stack);
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
            // Handle both MongoDB (_id) and in-memory (id) user objects
            const userId = user._id || user.id;
            res.json({ user: { id: userId, username: user.username } });
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
    // Handle both MongoDB (_id) and in-memory (id) user objects
    const userId = req.user._id || req.user.id;
    res.json({ user: { id: userId, username: req.user.username } });
});

module.exports = router; 