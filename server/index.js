require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { setupDatabase } = require('./supabase');

const app = express();

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? [
            'https://shop-nsplit.vercel.app',
            process.env.FRONTEND_URL
        ].filter(Boolean)
        : ['http://localhost:3000', 'http://localhost:3001'],
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
            'supabase-auth': '/api/supabase-auth/*',
            receipts: '/api/receipts/*',
            'parse-receipt': '/api/parse-receipt',
            test: '/api/test'
        }
    });
});

// AI Receipt Parsing endpoint
app.post('/api/parse-receipt', upload.single('receipt'), async (req, res) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No receipt image provided' });
        }

        // Validate file
        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({ error: 'Invalid file type. Only images are allowed.' });
        }

        if (req.file.size > 10 * 1024 * 1024) {
            return res.status(400).json({ error: 'File size too large. Maximum size is 10MB.' });
        }

        // Convert image to base64 for Gemini
        const base64Image = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;

        // Initialize Gemini model
        const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

        // Create prompt for receipt parsing
        const prompt = `
        You are an expert at reading and parsing grocery receipts. Please analyze this receipt image and extract the following information:

        For each item found on the receipt:
        - Item name (clean, readable text)
        - Price (numerical value only, no currency symbols)
        - Quantity (if specified, default to 1 if not mentioned)

        Please return the data in this exact JSON format:
        {
            "items": [
                {
                    "name": "Item Name",
                    "price": 0.00,
                    "quantity": 1
                }
            ],
            "total": 0.00
        }

        Important:
        - Only include actual grocery items, not taxes, fees, or totals
        - Ensure prices are accurate numerical values
        - If quantity is not specified, use 1
        - Return valid JSON that can be parsed
        - Do not include any explanatory text, only the JSON response
        `;

        // Generate content with image
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Image
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        let jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to extract JSON from AI response');
        }

        let parsedData;
        try {
            parsedData = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            throw new Error('Failed to parse AI response as JSON');
        }

        // Validate parsed data structure
        if (!parsedData.items || !Array.isArray(parsedData.items)) {
            throw new Error('Invalid data structure from AI response');
        }

        // Clean and validate items
        const cleanedItems = parsedData.items
            .filter(item => item.name && item.price && item.name.trim() !== '')
            .map(item => ({
                name: item.name.trim(),
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 1
            }))
            .filter(item => item.price > 0);

        if (cleanedItems.length === 0) {
            throw new Error('No valid items found in the receipt');
        }

        // Calculate total
        const total = cleanedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        res.json({
            success: true,
            items: cleanedItems,
            total: total,
            message: `Successfully parsed ${cleanedItems.length} items`
        });

    } catch (error) {
        console.error('Receipt parsing error:', error);

        // Handle specific error types
        if (error.message.includes('API key')) {
            return res.status(500).json({
                error: 'AI service configuration error. Please contact support.'
            });
        }

        if (error.message.includes('quota')) {
            return res.status(429).json({
                error: 'AI service quota exceeded. Please try again later.'
            });
        }

        res.status(500).json({
            error: error.message || 'Failed to parse receipt. Please try again.'
        });
    }
});

// Error handling middleware for multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ error: 'File upload error: ' + error.message });
    }

    if (error.message === 'Only image files are allowed') {
        return res.status(400).json({ error: 'Only image files are allowed.' });
    }

    next(error);
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// Simple test route for debugging
app.post('/api/test-register', (req, res) => {
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

// Register routes after session setup
app.use('/api/auth', require('./routes/auth'));
app.use('/api/supabase-auth', require('./routes/supabase-auth'));
app.use('/api/receipts', require('./routes/receipts'));

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

// Initialize database and start server
// Temporarily skip database setup for OCR testing
console.log('Starting server for OCR testing...');
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🔍 OCR endpoint: http://localhost:${PORT}/api/parse-receipt`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// TODO: Re-enable database setup once Supabase keys are configured
/*
setupDatabase()
    .then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to setup database:', error);
        process.exit(1);
    });
*/

module.exports = app; 