import React, { useState, useEffect, useCallback } from 'react';
import { calculateEveryoneTotal, calculateGroupsTotal, calculatePersonalTotal, calculatePersonTotal } from './PriceCalculator';
import { receipts } from '../supabaseClient';

function SharedReceiptPage({ receiptId }) {
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchSharedReceipt = useCallback(async () => {
        try {
            const { data, error } = await receipts.getReceipt(receiptId);

            if (error) {
                setError('Receipt not found or no longer available');
            } else {
                setReceipt(data);
            }
        } catch (error) {
            setError('Failed to load receipt');
        } finally {
            setLoading(false);
        }
    }, [receiptId]);

    useEffect(() => {
        fetchSharedReceipt();
    }, [fetchSharedReceipt]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading receipt...</p>
                </div>
            </div>
        );
    }

    if (error || !receipt) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Receipt Not Found</h2>
                    <p className="text-gray-600 mb-4">{error || 'This receipt is no longer available'}</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
                    >
                        Go to ShopNSplit
                    </button>
                </div>
            </div>
        );
    }

    const { participants: names = [], everyone_items: everyoneItems = [], split_groups_items: splitGroupsItems = [], personal_items: personalItems = [] } = receipt;

    // Calculate totals using utility functions
    const everyoneTotal = calculateEveryoneTotal(everyoneItems);
    const groupsTotal = calculateGroupsTotal(splitGroupsItems);
    const personalTotal = calculatePersonalTotal(personalItems);
    const grandTotal = everyoneTotal + groupsTotal + personalTotal;

    // Color schemes for different sections
    const sectionColors = {
        everyone: { border: 'border-blue-300', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
        groups: { border: 'border-purple-300', bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700' },
        personal: { border: 'border-teal-300', bg: 'bg-teal-50', badge: 'bg-teal-100 text-teal-700' }
    };

    const groupColors = [
        { border: 'border-blue-300', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
        { border: 'border-purple-300', bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700' },
        { border: 'border-orange-300', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700' },
        { border: 'border-pink-300', bg: 'bg-pink-50', badge: 'bg-pink-100 text-pink-700' },
        { border: 'border-indigo-300', bg: 'bg-indigo-50', badge: 'bg-indigo-100 text-indigo-700' },
        { border: 'border-emerald-300', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
    ];

    const personalItemColors = [
        { border: 'border-teal-300', bg: 'bg-teal-50', badge: 'bg-teal-100 text-teal-700' },
        { border: 'border-green-300', bg: 'bg-green-50', badge: 'bg-green-100 text-green-700' },
        { border: 'border-emerald-300', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
        { border: 'border-cyan-300', bg: 'bg-cyan-50', badge: 'bg-cyan-100 text-cyan-700' },
        { border: 'border-blue-300', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
        { border: 'border-indigo-300', bg: 'bg-indigo-50', badge: 'bg-indigo-100 text-indigo-700' },
    ];

    const receiptIcon = (
        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );

    const summaryIcon = (
        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
    );

    const printIcon = (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
    );

    const handlePrint = () => {
        window.print();
    };

    // Helper to filter out empty/partial items
    const filterValidItems = (items) => {
        return items.filter(item => {
            const price = parseFloat(item.price || '');
            return (item.name && item.name.trim() !== '') || (!isNaN(price) && price > 0);
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-green-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">ShopNSplit</h1>
                                <p className="text-sm text-gray-500">Shared Receipt</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                            >
                                Create Your Own
                            </button>
                            <button
                                onClick={handlePrint}
                                className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors flex items-center space-x-2"
                            >
                                {printIcon}
                                <span>Print</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Receipt Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                {receiptIcon}
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {receipt.title || 'Shared Receipt'}
                                </h2>
                                <p className="text-sm text-gray-500">Complete breakdown for {names.length} people</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Shared via link</div>
                            <div className="text-xs text-gray-400">
                                {new Date(receipt.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Receipt Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Everyone Splits Section */}
                        {everyoneItems.length > 0 && (
                            <div className={`border-2 rounded-xl bg-white ${sectionColors.everyone.border} overflow-hidden`}>
                                <div className={`${sectionColors.everyone.bg} px-6 py-4 border-b ${sectionColors.everyone.border}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-6 h-6 ${sectionColors.everyone.bg} rounded-lg flex items-center justify-center`}>
                                                <span className="text-sm font-bold text-blue-700">E</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Everyone Splits</h3>
                                                <p className="text-sm text-gray-600">Items split equally among all {names.length} people</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-blue-700">${everyoneTotal.toFixed(2)}</div>
                                            <div className="text-sm text-gray-500">
                                                {names.length > 0 ? `$${(everyoneTotal / names.length).toFixed(2)} each` : '$0.00 each'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {filterValidItems(everyoneItems).map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">{item.name}</div>
                                                    {item.name && (
                                                        <div className="text-sm text-gray-500">
                                                            Split among: {names.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-gray-900">${parseFloat(item.price || 0).toFixed(2)}</div>
                                                    {names.length > 0 && (parseFloat(item.price || 0) > 0 || (item.name && parseFloat(item.price || 0) === 0)) && (
                                                        <div className="text-sm text-blue-600">
                                                            {`$${(parseFloat(item.price || 0) / names.length).toFixed(2)} each`}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Split Groups Section */}
                        {splitGroupsItems.length > 0 && (
                            <div className={`border-2 rounded-xl bg-white ${sectionColors.groups.border} overflow-hidden`}>
                                <div className={`${sectionColors.groups.bg} px-6 py-4 border-b ${sectionColors.groups.border}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-6 h-6 ${sectionColors.groups.bg} rounded-lg flex items-center justify-center`}>
                                                <span className="text-sm font-bold text-purple-700">G</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Split Groups</h3>
                                                <p className="text-sm text-gray-600">Items split among specific groups</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-purple-700">${groupsTotal.toFixed(2)}</div>
                                            <div className="text-sm text-gray-500">Total across all groups</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 space-y-6">
                                    {splitGroupsItems.map((group, groupIdx) => {
                                        const colorScheme = groupColors[groupIdx % groupColors.length];
                                        const groupTotal = group.items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
                                        const perPerson = group.participants.length > 0 ? groupTotal / group.participants.length : 0;
                                        const validItems = filterValidItems(group.items);
                                        return (
                                            <div key={groupIdx} className={`border-2 rounded-lg ${colorScheme.border} overflow-hidden`}>
                                                <div className={`${colorScheme.bg} px-4 py-3 border-b ${colorScheme.border}`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-5 h-5 ${colorScheme.bg} rounded-lg flex items-center justify-center`}>
                                                                <span className="text-xs font-bold text-gray-700">{groupIdx + 1}</span>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">Group {groupIdx + 1}</h4>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {group.participants.map((participant, pIdx) => (
                                                                        <span key={pIdx} className={`px-2 py-1 rounded-full text-xs font-medium ${colorScheme.badge}`}>
                                                                            {participant}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-gray-900">${groupTotal.toFixed(2)}</div>
                                                            <div className="text-sm text-gray-500">${perPerson.toFixed(2)} each</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <div className="space-y-2">
                                                        {validItems.map((item, itemIdx) => (
                                                            <div key={itemIdx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-gray-900">{item.name}</div>
                                                                    {item.name && (
                                                                        <div className="text-sm text-gray-500">
                                                                            Split among: {group.participants.join(', ')}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-semibold text-gray-900">${parseFloat(item.price || 0).toFixed(2)}</div>
                                                                    {group.participants.length > 0 && (parseFloat(item.price || 0) > 0 || (item.name && parseFloat(item.price || 0) === 0)) && (
                                                                        <div className="text-sm text-purple-600">
                                                                            {`$${(parseFloat(item.price || 0) / group.participants.length).toFixed(2)} each`}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Personal Items Section */}
                        {personalItems.length > 0 && (
                            <div className={`border-2 rounded-xl bg-white ${sectionColors.personal.border} overflow-hidden`}>
                                <div className={`${sectionColors.personal.bg} px-6 py-4 border-b ${sectionColors.personal.border}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-6 h-6 ${sectionColors.personal.bg} rounded-lg flex items-center justify-center`}>
                                                <span className="text-sm font-bold text-teal-700">P</span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Personal Items</h3>
                                                <p className="text-sm text-gray-600">Items bought for themselves only</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-teal-700">${personalTotal.toFixed(2)}</div>
                                            <div className="text-sm text-gray-500">Paid individually</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 space-y-6">
                                    {personalItems.map((personalItem, idx) => {
                                        const colorScheme = personalItemColors[idx % personalItemColors.length];
                                        const personalTotal = personalItem.items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
                                        const validItems = filterValidItems(personalItem.items);
                                        return (
                                            <div key={idx} className={`border-2 rounded-lg ${colorScheme.border} overflow-hidden`}>
                                                <div className={`${colorScheme.bg} px-4 py-3 border-b ${colorScheme.border}`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-5 h-5 ${colorScheme.bg} rounded-lg flex items-center justify-center`}>
                                                                <span className="text-xs font-bold text-gray-700">{idx + 1}</span>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">{personalItem.owner}'s Items</h4>
                                                                <p className="text-sm text-gray-500">Personal items only</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-gray-900">${personalTotal.toFixed(2)}</div>
                                                            <div className="text-sm text-gray-500">Paid by {personalItem.owner}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <div className="space-y-2">
                                                        {validItems.map((item, itemIdx) => (
                                                            <div key={itemIdx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                                                <div className="flex-1">
                                                                    <div className="font-medium text-gray-900">{item.name}</div>
                                                                    {item.name && (
                                                                        <div className="text-sm text-gray-500">
                                                                            Paid by: {personalItem.owner}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="font-semibold text-gray-900">${parseFloat(item.price || 0).toFixed(2)}</div>
                                                                    {(parseFloat(item.price || 0) > 0 || (item.name && parseFloat(item.price || 0) === 0)) && (
                                                                        <div className="text-sm text-teal-600">
                                                                            Full amount
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                        {summaryIcon}
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Final Summary</h3>
                                </div>
                                <div className="space-y-4">
                                    {everyoneItems.length > 0 && (
                                        <div className="border-b border-gray-100 pb-4">
                                            <h4 className="font-medium text-gray-700 mb-3">Everyone Splits</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Total:</span>
                                                    <span className="font-semibold">${everyoneTotal.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Per person:</span>
                                                    <span className="font-semibold text-blue-600">
                                                        {names.length > 0 ? `$${(everyoneTotal / names.length).toFixed(2)}` : '$0.00'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {splitGroupsItems.length > 0 && (
                                        <div className="border-b border-gray-100 pb-4">
                                            <h4 className="font-medium text-gray-700 mb-3">Split Groups</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Total:</span>
                                                    <span className="font-semibold">${groupsTotal.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {personalItems.length > 0 && (
                                        <div className="border-b border-gray-100 pb-4">
                                            <h4 className="font-medium text-gray-700 mb-3">Personal Items</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Total:</span>
                                                    <span className="font-semibold">${personalTotal.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-100 pt-4">
                                        <div className="flex justify-between">
                                            <span className="text-lg font-semibold text-gray-900">Grand Total:</span>
                                            <span className="text-lg font-bold text-teal-600">${grandTotal.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-4">
                                        <h4 className="font-medium text-gray-700 mb-3">Final Amounts Owed</h4>
                                        <div className="space-y-2">
                                            {names.map((person) => (
                                                <div key={person} className="flex justify-between">
                                                    <span className="text-gray-600">{person}:</span>
                                                    <span className="font-semibold text-teal-600">${calculatePersonTotal(person, names, everyoneItems, splitGroupsItems, personalItems).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SharedReceiptPage; 