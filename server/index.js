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

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        routes: {
            auth: '/api/auth/*',
            receipts: '/api/receipts/*',
            test: '/api/test'
        }
    });
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Test route for auth
app.get('/api/auth-test', (req, res) => {
    res.json({ message: 'Auth route test - working!' });
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
        // Use a default MongoDB URI if none is provided
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopnsplit';
        cached.promise = mongoose.connect(mongoUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        }).then((mongoose) => {
            console.log('MongoDB connected successfully');
            return mongoose;
        }).catch((error) => {
            console.error('MongoDB connection failed:', error);
            // Don't throw error, just log it
            return null;
        });
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
        mongoStorePromise = dbConnect().then(() => {
            return MongoStore.create({ mongoUrl: process.env.MONGODB_URI });
        }).then((store) => {
            console.log('MongoStore created successfully');
            return store;
        }).catch((error) => {
            console.error('MongoStore creation failed:', error);
            throw error;
        });
    }
    return mongoStorePromise;
}

// Session and passport setup (synchronous for development)
if (process.env.NODE_ENV === 'production') {
    // Use MongoDB store for production
    getMongoStore().then(store => {
        app.use(session({
            secret: process.env.SESSION_SECRET || 'fallback-secret',
            resave: false,
            saveUninitialized: false,
            store,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24,
                secure: true,
                sameSite: 'none'
            },
        }));
        require('./passportConfig')(passport);
        app.use(passport.initialize());
        app.use(passport.session());
        console.log('Session and passport initialized successfully (production)');
    }).catch(err => {
        console.error('Session/passport setup failed:', err);
    });
} else {
    // Use memory store for development (immediate availability)
    app.use(session({
        secret: process.env.SESSION_SECRET || 'fallback-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            secure: false,
            sameSite: 'lax'
        },
    }));
    require('./passportConfig')(passport);
    app.use(passport.initialize());
    app.use(passport.session());
    console.log('Session and passport initialized successfully (development)');
}

// Register routes after session setup
app.use('/api/auth', require('./routes/auth'));
app.use('/api/receipts', require('./routes/receipts'));
console.log('Routes registered after session setup');

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; 