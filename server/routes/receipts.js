const express = require('express');
const Receipt = require('../models/Receipt');
const User = require('../models/User');
const receiptStorage = require('../receiptStorage');

const router = express.Router();

function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: 'Not authenticated' });
}

// Save a receipt
router.post('/', ensureAuth, async (req, res) => {
    try {
        const receipt = receiptStorage.addReceipt({
            owner: req.user.id,
            data: req.body.data,
            name: req.body.name || '',
        });
        res.json({ receipt });
    } catch (err) {
        res.status(500).json({ message: 'Failed to save receipt.' });
    }
});

// Get all receipts for user
router.get('/', ensureAuth, async (req, res) => {
    try {
        const receipts = receiptStorage.getReceiptsByOwner(req.user.id);
        res.json({ receipts });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch receipts.' });
    }
});

// Update receipt name
router.put('/:id', ensureAuth, async (req, res) => {
    try {
        const receipt = receiptStorage.getReceipt(req.params.id);
        if (!receipt || receipt.owner !== req.user.id) {
            return res.status(404).json({ message: 'Receipt not found.' });
        }
        const updatedReceipt = receiptStorage.updateReceipt(req.params.id, { name: req.body.name });
        res.json({ receipt: updatedReceipt });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update receipt.' });
    }
});

// Delete receipt
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        const receipt = receiptStorage.getReceipt(req.params.id);
        if (!receipt || receipt.owner !== req.user.id) {
            return res.status(404).json({ message: 'Receipt not found.' });
        }
        receiptStorage.deleteReceipt(req.params.id);
        res.json({ message: 'Receipt deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete receipt.' });
    }
});

module.exports = router; 