require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const cors = require('cors');
const path = require('path');

const app = express();

// Log environment variables for debugging
console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
    SESSION_SECRET: process.env.SESSION_SECRET ? 'SET' : 'NOT SET'
});

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
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 'not set',
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

// Simple test route for debugging
app.post('/api/test-register', (req, res) => {
    console.log('Test register endpoint hit');
    console.log('Request body:', req.body);
    console.log('Session available:', !!req.session);
    res.json({
        message: 'Test endpoint working',
        body: req.body,
        session: !!req.session,
        environment: process.env.NODE_ENV
    });
});

// MongoDB connection test route
app.get('/api/test-db', async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            const connection = await dbConnect();
            if (connection) {
                res.json({
                    message: 'MongoDB connection successful',
                    status: 'connected'
                });
            } else {
                res.status(500).json({
                    message: 'MongoDB connection failed',
                    status: 'failed'
                });
            }
        } else {
            res.json({
                message: 'Development mode - using in-memory storage',
                status: 'development'
            });
        }
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({
            message: 'Database test failed',
            error: error.message
        });
    }
});

// Test route for auth
app.get('/api/auth-test', (req, res) => {
    res.json({
        message: 'Auth route test - working!',
        sessionAvailable: !!req.session,
        user: req.user || null
    });
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
        console.log('Attempting MongoDB connection to:', mongoUri);
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
            return MongoStore.create({
                mongoUrl: process.env.MONGODB_URI,
                ttl: 24 * 60 * 60 // 1 day
            });
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

// Session and passport setup
if (process.env.NODE_ENV === 'production') {
    console.log('Setting up production session with MongoDB store...');
    // Use MongoDB store for production - synchronous setup with fallback
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not set');
        }

        const store = MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            ttl: 24 * 60 * 60 // 1 day
        });
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
    } catch (err) {
        console.error('Session/passport setup failed:', err);
        console.log('Falling back to memory store for production...');
        // Fallback to memory store if MongoDB store fails
        app.use(session({
            secret: process.env.SESSION_SECRET || 'fallback-secret',
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24,
                secure: true,
                sameSite: 'none'
            },
        }));
        require('./passportConfig')(passport);
        app.use(passport.initialize());
        app.use(passport.session());
        console.log('Session and passport initialized with fallback (production)');
    }
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
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

const PORT = process.env.PORT || 5001;
console.log(`Starting server on port ${PORT} (PORT env: ${process.env.PORT || 'not set'})`);
console.log('All environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
    SESSION_SECRET: process.env.SESSION_SECRET ? 'SET' : 'NOT SET'
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Server URL: http://localhost:${PORT}`);
});

module.exports = app; 