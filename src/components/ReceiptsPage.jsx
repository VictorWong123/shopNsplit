import React, { useState, useEffect } from 'react';
import PrimaryButton from './PrimaryButton';
import PageHeader from './PageHeader';
import ShareButton from './ShareButton';
import { receipts as receiptsApi, auth } from '../supabaseClient';

const ReceiptsPage = ({ onBack }) => {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [editingName, setEditingName] = useState(null);
    const [editName, setEditName] = useState('');
    const [deletingReceipt, setDeletingReceipt] = useState(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [receiptToDelete, setReceiptToDelete] = useState(null);

    useEffect(() => {
        fetchReceipts();
    }, []);

    const fetchReceipts = async () => {
        try {
            const result = await auth.getCurrentUser();
            console.log('getCurrentUser result:', result);

            if (!result || !result.data || !result.data.user) {
                console.log('No authenticated user found');
                setError('Not authenticated. Please sign in again.');
                setLoading(false);
                return;
            }

            const user = result.data.user;
            console.log('Fetching receipts for user:', user.id);
            const { data, error } = await receiptsApi.getUserReceipts(user.id);

            if (error) {
                console.error('Error in fetchReceipts:', error);

                // Test database connection to help debug
                const testResult = await receiptsApi.testDatabaseConnection();
                console.log('Database test result:', testResult);

                setError(`Failed to fetch receipts: ${error.message || 'Unknown error'}`);
            } else {
                console.log('Receipts fetched successfully:', data);
                setReceipts(data || []);
            }
        } catch (error) {
            console.error('Exception in fetchReceipts:', error);
            setError(`Network error: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleEditName = (receipt) => {
        setEditingName(receipt.id);
        setEditName(receipt.title || '');
    };

    const handleSaveName = async (receiptId) => {
        try {
            const result = await auth.getCurrentUser();
            if (!result || !result.data || !result.data.user) {
                console.error('No authenticated user found for updating receipt name');
                return;
            }

            const user = result.data.user;
            const { data, error } = await receiptsApi.updateReceiptName(receiptId, editName, user.id);

            if (error) {
                console.error('Error updating receipt name:', error);
            } else {
                setReceipts(prev => prev.map(r =>
                    r.id === receiptId ? data : r
                ));
                setEditingName(null);
                setEditName('');
            }
        } catch (error) {
            console.error('Error updating receipt name:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingName(null);
        setEditName('');
    };

    const handleDeleteReceipt = (receipt) => {
        setReceiptToDelete(receipt);
        setShowDeleteConfirmation(true);
    };

    const confirmDelete = async () => {
        if (!receiptToDelete) return;

        setDeletingReceipt(receiptToDelete.id);
        try {
            const result = await auth.getCurrentUser();
            if (!result || !result.data || !result.data.user) {
                console.error('No authenticated user found for deleting receipt');
                alert('Authentication error. Please sign in again.');
                return;
            }

            const user = result.data.user;
            const { error } = await receiptsApi.deleteReceipt(receiptToDelete.id, user.id);

            if (error) {
                alert('Failed to delete receipt');
            } else {
                setReceipts(prev => prev.filter(r => r.id !== receiptToDelete.id));
                // Always clear selectedReceipt after delete
                setSelectedReceipt(null);
            }
        } catch (error) {
            alert('Error deleting receipt');
        } finally {
            setDeletingReceipt(null);
            setShowDeleteConfirmation(false);
            setReceiptToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirmation(false);
        setReceiptToDelete(null);
    };

    const calculateTotal = (receiptData) => {
        // Use saved totals if available, otherwise calculate
        if (receiptData.totals && receiptData.totals.grandTotal !== undefined) {
            return receiptData.totals.grandTotal.toFixed(2);
        }

        let total = 0;

        // Everyone items
        if (receiptData.everyoneItems && Array.isArray(receiptData.everyoneItems)) {
            total += receiptData.everyoneItems.reduce((sum, item) => {
                const price = parseFloat(item.price) || 0;
                return sum + price;
            }, 0);
        }

        // Split groups items
        if (receiptData.splitGroupsItems && Array.isArray(receiptData.splitGroupsItems)) {
            total += receiptData.splitGroupsItems.reduce((sum, group) => {
                if (group.items && Array.isArray(group.items)) {
                    return sum + group.items.reduce((groupSum, item) => {
                        const price = parseFloat(item.price) || 0;
                        return groupSum + price;
                    }, 0);
                }
                return sum;
            }, 0);
        }

        // Personal items
        if (receiptData.personalItems && Array.isArray(receiptData.personalItems)) {
            total += receiptData.personalItems.reduce((sum, personalItem) => {
                if (personalItem.items && Array.isArray(personalItem.items)) {
                    return sum + personalItem.items.reduce((itemSum, item) => {
                        const price = parseFloat(item.price) || 0;
                        return itemSum + price;
                    }, 0);
                }
                return sum;
            }, 0);
        }

        return total.toFixed(2);
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader title="My Receipts" onBack={onBack} />
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Loading receipts...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageHeader title="My Receipts" onBack={onBack} />
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    if (selectedReceipt) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => setSelectedReceipt(null)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back to Receipts</span>
                    </button>
                    <div className="flex space-x-2">
                        <ShareButton
                            receiptId={selectedReceipt.id}
                            receiptName={selectedReceipt.title || `Receipt from ${formatDate(selectedReceipt.created_at)}`}
                        />
                        <button
                            onClick={() => handleDeleteReceipt(selectedReceipt)}
                            disabled={deletingReceipt === selectedReceipt.id}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {deletingReceipt === selectedReceipt.id ? 'Deleting...' : 'Delete Receipt'}
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
                        >
                            Print Receipt
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 print:p-0">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {selectedReceipt.title || 'Receipt'}
                        </h1>
                        <p className="text-gray-500">{formatDate(selectedReceipt.created_at)}</p>
                    </div>

                    {/* Everyone Items */}
                    {selectedReceipt.everyone_items && selectedReceipt.everyone_items.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Everyone Splits</h2>
                            <div className="space-y-2">
                                {selectedReceipt.everyone_items
                                    .filter(item => (item.name && item.name.trim() !== '') || (parseFloat(item.price) || 0) > 0)
                                    .map((item, index) => (
                                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-700">{item.name || 'Unnamed Item'}</span>
                                            <span className="font-medium">${(parseFloat(item.price) || 0).toFixed(2)}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Split Groups */}
                    {selectedReceipt.split_groups_items && selectedReceipt.split_groups_items.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Split Groups</h2>
                            {selectedReceipt.split_groups_items.map((group, groupIndex) => (
                                <div key={groupIndex} className="mb-4 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-medium text-gray-800 mb-2">
                                        Split among: {group.participants?.join(', ') || 'Unknown'}
                                    </h3>
                                    <div className="space-y-2">
                                        {group.items
                                            ?.filter(item => (item.name && item.name.trim() !== '') || (parseFloat(item.price) || 0) > 0)
                                            .map((item, itemIndex) => (
                                                <div key={itemIndex} className="flex justify-between items-center py-1">
                                                    <span className="text-gray-700">{item.name || 'Unnamed Item'}</span>
                                                    <span className="font-medium">${(parseFloat(item.price) || 0).toFixed(2)}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Personal Items */}
                    {selectedReceipt.personal_items && selectedReceipt.personal_items.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Personal Items</h2>
                            {selectedReceipt.personal_items.map((personalItem, personalIndex) => (
                                <div key={personalIndex} className="mb-4 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-medium text-gray-800 mb-2">
                                        {personalItem.owner}'s Items
                                    </h3>
                                    <div className="space-y-2">
                                        {personalItem.items
                                            ?.filter(item => (item.name && item.name.trim() !== '') || (parseFloat(item.price) || 0) > 0)
                                            .map((item, itemIndex) => (
                                                <div key={itemIndex} className="flex justify-between items-center py-1">
                                                    <span className="text-gray-700">{item.name || 'Unnamed Item'}</span>
                                                    <span className="font-medium">${(parseFloat(item.price) || 0).toFixed(2)}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Participants */}
                    {selectedReceipt.participants && selectedReceipt.participants.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Participants</h2>
                            <div className="flex flex-wrap gap-2">
                                {selectedReceipt.participants.map((participant, index) => (
                                    <span key={index} className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm">
                                        {participant}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Total */}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center text-lg font-semibold">
                            <span>Total Amount</span>
                            <span>${(selectedReceipt.total_amount || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal (moved here so it works for single receipt view) */}
                {showDeleteConfirmation && receiptToDelete && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Delete Receipt</h3>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete "{receiptToDelete.title || `Receipt from ${formatDate(receiptToDelete.created_at)}`}"?
                                This action cannot be undone.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={cancelDelete}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    No, Keep It
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deletingReceipt === receiptToDelete.id}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {deletingReceipt === receiptToDelete.id ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <PageHeader title="My Receipts" onBack={onBack} />

            {receipts.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No receipts yet</h3>
                    <p className="text-gray-500">Your saved receipts will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {receipts.map((receipt) => (
                        <div
                            key={receipt.id}
                            onClick={() => setSelectedReceipt(receipt)}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    {editingName === receipt.id ? (
                                        <div
                                            className="flex items-center space-x-2"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="text-lg font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                placeholder="Enter receipt name"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSaveName(receipt.id);
                                                }}
                                                className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCancelEdit();
                                                }}
                                                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <h3
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditName(receipt);
                                                }}
                                                className="text-lg font-medium text-gray-900 cursor-pointer hover:text-teal-600 transition-colors"
                                            >
                                                {receipt.title || `Receipt from ${formatDate(receipt.created_at)}`}
                                            </h3>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditName(receipt);
                                                }}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                    <p className="text-gray-500 mt-1">
                                        Total: ${receipt.total_amount || 0}
                                    </p>
                                    {receipt.participants && receipt.participants.length > 0 && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Participants: {receipt.participants.join(', ')}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteReceipt(receipt);
                                    }}
                                    disabled={deletingReceipt === receipt.id}
                                    className="text-red-400 hover:text-red-600 disabled:opacity-50 p-1 rounded hover:bg-red-50 transition-colors"
                                    title="Delete Receipt"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Render the delete confirmation modal at the root so it works for both views */}
            {showDeleteConfirmation && receiptToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Delete Receipt</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{receiptToDelete.title || `Receipt from ${formatDate(receiptToDelete.created_at)}`}"?
                            This action cannot be undone.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={cancelDelete}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                No, Keep It
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deletingReceipt === receiptToDelete.id}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {deletingReceipt === receiptToDelete.id ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReceiptsPage; 