require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const path = require('path');
const { setupDatabase } = require('./supabase');

const app = express();

// Log environment variables for debugging
console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
    SESSION_SECRET: process.env.SESSION_SECRET ? 'SET' : 'NOT SET'
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? [
            'https://shopnsplit.vercel.app',
            'https://shopnsplit-git-main.vercel.app',
            'https://shopnsplit-git-develop.vercel.app',
            'https://shopnsplit-backend.onrender.com',
            process.env.FRONTEND_URL
        ].filter(Boolean)
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

// Database test route
app.get('/api/test-db', async (req, res) => {
    try {
        await setupDatabase();
        res.json({
            message: 'Supabase connection successful',
            status: 'connected'
        });
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

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    },
}));

// Passport setup
require('./passportConfig')(passport);
app.use(passport.initialize());
app.use(passport.session());
console.log('Session and passport initialized successfully');

// Register routes after session setup
app.use('/api/auth', require('./routes/auth'));
app.use('/api/receipts', require('./routes/receipts'));
console.log('Routes registered after session setup');

// Handle shared receipt URLs (both development and production)
app.get('/shared/:id', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        // In production, serve the React app which will handle the route
        res.sendFile(path.join(__dirname, '../build', 'index.html'));
    } else {
        // In development, redirect to the React dev server
        res.redirect(`http://localhost:3000/shared/${req.params.id}`);
    }
});

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
    SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
    SESSION_SECRET: process.env.SESSION_SECRET ? 'SET' : 'NOT SET'
});

// Initialize database and start server
setupDatabase()
    .then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Server URL: http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to setup database:', error);
        process.exit(1);
    });

module.exports = app; 