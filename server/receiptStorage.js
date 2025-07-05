// Shared in-memory receipt storage for development
const inMemoryReceipts = new Map();

module.exports = {
    addReceipt: (receipt) => {
        const id = Date.now().toString();
        receipt._id = id;
        receipt.createdAt = new Date();
        inMemoryReceipts.set(id, receipt);
        return receipt;
    },
    getReceipt: (id) => {
        return inMemoryReceipts.get(id);
    },
    getReceiptsByOwner: (ownerId) => {
        return Array.from(inMemoryReceipts.values())
            .filter(receipt => receipt.owner === ownerId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    updateReceipt: (id, updates) => {
        const receipt = inMemoryReceipts.get(id);
        if (receipt) {
            Object.assign(receipt, updates);
            inMemoryReceipts.set(id, receipt);
            return receipt;
        }
        return null;
    },
    deleteReceipt: (id) => {
        return inMemoryReceipts.delete(id);
    }
}; 