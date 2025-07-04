const express = require('express');
const Receipt = require('../models/Receipt');
const User = require('../models/User');

const router = express.Router();

function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: 'Not authenticated' });
}

// Save a receipt
router.post('/', ensureAuth, async (req, res) => {
    try {
        const receipt = new Receipt({
            owner: req.user._id,
            data: req.body.data,
            name: req.body.name || '',
        });
        await receipt.save();
        req.user.receipts.push(receipt._id);
        await req.user.save();
        res.json({ receipt });
    } catch (err) {
        res.status(500).json({ message: 'Failed to save receipt.' });
    }
});

// Get all receipts for user
router.get('/', ensureAuth, async (req, res) => {
    try {
        const receipts = await Receipt.find({ owner: req.user._id }).sort({ createdAt: -1 });
        res.json({ receipts });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch receipts.' });
    }
});

// Update receipt name
router.put('/:id', ensureAuth, async (req, res) => {
    try {
        const receipt = await Receipt.findOneAndUpdate(
            { _id: req.params.id, owner: req.user._id },
            { name: req.body.name },
            { new: true }
        );
        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found.' });
        }
        res.json({ receipt });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update receipt.' });
    }
});

// Delete receipt
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        const receipt = await Receipt.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found.' });
        }

        // Remove from user's receipts array
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { receipts: req.params.id }
        });

        res.json({ message: 'Receipt deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete receipt.' });
    }
});

module.exports = router; 