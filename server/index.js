require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://shopnsplit.onrender.com', 'https://shopnsplit.vercel.app']
        : 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Health check route (for Render.com health checks)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test route (always available)
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// --- Mongoose connection cache ---
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

function dbConnect() {
    if (cached.conn) {
        return Promise.resolve(cached.conn);
    }
    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }).then((mongoose) => mongoose);
    }
    return cached.promise.then((conn) => {
        cached.conn = conn;
        return conn;
    });
}

// --- Session store cache ---
let mongoStorePromise;
function getMongoStore() {
    if (!mongoStorePromise) {
        mongoStorePromise = dbConnect().then(() =>
            MongoStore.create({ mongoUrl: process.env.MONGODB_URI })
        );
    }
    return mongoStorePromise;
}

// Initialize session and routes
async function initializeApp() {
    try {
        const store = await getMongoStore();

        app.use(session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            store,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24, // 1 day
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
            },
        }));

        // Passport config
        require('./passportConfig')(passport);
        app.use(passport.initialize());
        app.use(passport.session());

        // Auth and receipts routes
        app.use('/api/auth', require('./routes/auth'));
        app.use('/api/receipts', require('./routes/receipts'));

        console.log('Session and routes initialized successfully');
    } catch (error) {
        console.error('Failed to initialize session and routes:', error);
        process.exit(1); // Exit if critical initialization fails
    }
}

// Initialize the app
initializeApp();

// Serve static files from React build (for single service deployment)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../build')));

    // Handle React Router - serve index.html for all non-API routes
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/')) {
            return next();
        }
        res.sendFile(path.join(__dirname, '../build', 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

// Start server (for both development and production)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; 