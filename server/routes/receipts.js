const express = require('express');
const { receiptOperations } = require('../supabase');

const router = express.Router();

function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: 'Not authenticated' });
}

// Save a receipt
router.post('/', ensureAuth, async (req, res) => {
    try {
        // Check for duplicate
        const alreadyExists = await receiptOperations.receiptExists(
            req.user.id,
            req.body
        );
        if (alreadyExists) {
            return res.status(200).json({ message: 'Already saved' });
        }
        const receipt = await receiptOperations.createReceipt(
            req.user.id,
            req.body
        );
        res.json({ receipt });
    } catch (err) {
        console.error('Save receipt error:', err);
        res.status(500).json({ message: 'Failed to save receipt.' });
    }
});

// Get all receipts for user
router.get('/', ensureAuth, async (req, res) => {
    try {
        const receipts = await receiptOperations.getReceiptsByUser(req.user.id);
        res.json({ receipts });
    } catch (err) {
        console.error('Get receipts error:', err);
        res.status(500).json({ message: 'Failed to fetch receipts.' });
    }
});

// Update receipt title
router.put('/:id', ensureAuth, async (req, res) => {
    try {
        const receipt = await receiptOperations.getReceiptById(req.params.id);
        if (!receipt) {
            console.warn(`Update: Receipt not found for id=${req.params.id}`);
            return res.status(404).json({ message: 'Receipt not found.' });
        }
        if (String(receipt.user_id) !== String(req.user.id)) {
            console.warn(`Update: User ${req.user.id} tried to update receipt owned by ${receipt.user_id}`);
            return res.status(403).json({ message: 'Forbidden.' });
        }
        if (!req.body.title || typeof req.body.title !== 'string') {
            return res.status(400).json({ message: 'Invalid title.' });
        }
        const updatedReceipt = await receiptOperations.updateReceipt(req.params.id, {
            title: req.body.title
        });
        res.json({ receipt: updatedReceipt });
    } catch (err) {
        console.error('Update receipt error:', err);
        res.status(500).json({ message: 'Failed to update receipt.' });
    }
});

// Delete receipt
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        const receipt = await receiptOperations.getReceiptById(req.params.id);
        if (!receipt) {
            console.warn(`Delete: Receipt not found for id=${req.params.id}`);
            return res.status(404).json({ message: 'Receipt not found.' });
        }
        if (String(receipt.user_id) !== String(req.user.id)) {
            console.warn(`Delete: User ${req.user.id} tried to delete receipt owned by ${receipt.user_id}`);
            return res.status(403).json({ message: 'Forbidden.' });
        }
        await receiptOperations.deleteReceipt(req.params.id);
        res.json({ message: 'Receipt deleted successfully.' });
    } catch (err) {
        console.error('Delete receipt error:', err);
        res.status(500).json({ message: 'Failed to delete receipt.' });
    }
});

// Get shared receipt (no auth required)
router.get('/shared/:id', async (req, res) => {
    try {
        const receipt = await receiptOperations.getReceiptById(req.params.id);
        if (!receipt) {
            console.warn(`Shared: Receipt not found for id=${req.params.id}`);
            return res.status(404).json({ message: 'Receipt not found.' });
        }
        res.json({ receipt });
    } catch (err) {
        console.error('Get shared receipt error:', err);
        res.status(500).json({ message: 'Failed to fetch receipt.' });
    }
});

module.exports = router; 