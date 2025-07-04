require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://shopnsplit.onrender.com', 'https://shopnsplit.vercel.app']
        : 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// --- Mongoose connection cache for Vercel serverless ---
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
            useNewUrlParser: true,
            useUnifiedTopology: true,
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

// Session middleware (registers synchronously, but store is a promise)
getMongoStore().then(store => {
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
});

// Test route (always available)
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Serve static files from React build (for single service deployment)
if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    app.use(express.static(path.join(__dirname, '../build')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../build', 'index.html'));
    });
}

// Start server (for both development and production)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; 