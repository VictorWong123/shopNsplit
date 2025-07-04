import React from 'react';
import PageHeader from './PageHeader';
import SummaryCard from './SummaryCard';
import PrimaryButton from './PrimaryButton';

function ReceiptPage({ names, everyoneItems = [], splitGroupsItems = [], personalItems = [], onBack }) {
    // Calculate totals
    const calculateEveryoneTotal = () => {
        return everyoneItems.reduce((total, item) => {
            const price = parseFloat(item.price) || 0;
            return total + price;
        }, 0);
    };

    const calculateGroupsTotal = () => {
        return splitGroupsItems.reduce((total, group) => {
            return total + group.items.reduce((groupTotal, item) => {
                const price = parseFloat(item.price) || 0;
                return groupTotal + price;
            }, 0);
        }, 0);
    };

    const calculatePersonalTotal = () => {
        return personalItems.reduce((total, personalItem) => {
            return total + personalItem.items.reduce((itemTotal, item) => {
                const price = parseFloat(item.price) || 0;
                return itemTotal + price;
            }, 0);
        }, 0);
    };

    const calculatePersonTotal = (personName) => {
        let total = 0;

        // Add everyone split portion
        const everyoneTotal = calculateEveryoneTotal();
        if (names.length > 0) {
            total += everyoneTotal / names.length;
        }

        // Add split group portions
        splitGroupsItems.forEach(group => {
            if (group.participants.includes(personName) && group.participants.length > 0) {
                const groupTotal = group.items.reduce((sum, item) => {
                    return sum + (parseFloat(item.price) || 0);
                }, 0);
                total += groupTotal / group.participants.length;
            }
        });

        // Add personal items (person pays for their own items)
        personalItems.forEach(personalItem => {
            if (personalItem.owner === personName) {
                const personalTotal = personalItem.items.reduce((sum, item) => {
                    return sum + (parseFloat(item.price) || 0);
                }, 0);
                total += personalTotal; // Full amount, not split
            }
        });

        return total;
    };

    const everyoneTotal = calculateEveryoneTotal();
    const groupsTotal = calculateGroupsTotal();
    const personalTotal = calculatePersonalTotal();
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <PageHeader
                title="Receipt"
                description="Complete breakdown of all items and costs"
                onBack={onBack}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Receipt Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Receipt Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                    {receiptIcon}
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Shopping Receipt</h2>
                                    <p className="text-sm text-gray-500">Complete breakdown for {names.length} people</p>
                                </div>
                            </div>
                            <PrimaryButton
                                onClick={handlePrint}
                                showIcon
                                icon={printIcon}
                            >
                                Print Receipt
                            </PrimaryButton>
                        </div>
                    </div>

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
                        <SummaryCard title="Final Summary" icon={summaryIcon}>
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
                                                <span className="font-semibold text-teal-600">${calculatePersonTotal(person).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SummaryCard>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReceiptPage; 