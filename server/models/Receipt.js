const mongoose = require('mongoose');

const ReceiptSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    data: { type: Object, required: true }, // Store the entire receipt object
    name: { type: String, default: '' }, // Custom name for the receipt
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Receipt', ReceiptSchema); 