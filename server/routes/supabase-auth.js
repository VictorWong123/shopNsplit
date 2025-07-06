const express = require('express');
const { userOperations } = require('../supabase');

const router = express.Router();

// Test route to verify the router is loaded
router.get('/test', (req, res) => {
    res.json({ message: 'Supabase auth router is working!' });
});

// Middleware to verify Supabase JWT token
const verifySupabaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    console.log('Auth header received:', authHeader ? 'Yes' : 'No');
    console.log('Auth header starts with Bearer:', authHeader?.startsWith('Bearer '));

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header required' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('Token length:', token.length);

    try {
        // Verify the token with Supabase
        const { data: { user }, error } = await require('../supabase').supabase.auth.getUser(token);

        if (error || !user) {
            console.error('Token verification failed:', error);
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        console.log('Token verified for user:', user.id);
        req.user = user;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ message: 'Token verification failed' });
    }
};

// Delete user account
router.delete('/delete-account', verifySupabaseToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Delete the user and all associated data
        await userOperations.deleteUser(userId);

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            message: 'Failed to delete account',
            error: error.message
        });
    }
});

// Note: Profile updates are now handled directly by the client using Supabase
// This endpoint is kept for potential future use but not currently used

module.exports = router; 