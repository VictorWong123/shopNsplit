import React, { useState, useEffect, useRef } from 'react';
import GroceryItemForm from './GroceryItemForm';
import FormValidation from './FormValidation';

function PersonalItemsPage({ names, onBack, everyoneItems = [], splitGroupsItems = [] }) {
    const [personalItems, setPersonalItems] = useState([]); // {owner: '', items: []}
    const [selecting, setSelecting] = useState(false);
    const [selectedOwner, setSelectedOwner] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [saveButtonTooltip, setSaveButtonTooltip] = useState('');

    // For adding items to the personal item being created
    const [tempItems, setTempItems] = useState([{ name: '', price: '' }]);
    const formRef = useRef();

    const handleStartPersonalItem = () => {
        if (selecting) {
            setErrorMessage('Save personal item before adding new one');
            return;
        }
        setSelecting(true);
        setSelectedOwner('');
        setTempItems([{ name: '', price: '' }]);
        setErrorMessage('');
        setSaveButtonTooltip('');
    };

    const isDuplicatePersonalItem = (owner) => {
        return personalItems.some(item => item.owner === owner);
    };

    const getSaveButtonTooltip = () => {
        if (!selectedOwner) {
            return 'Select who is buying items for themselves';
        }

        if (isDuplicatePersonalItem(selectedOwner)) {
            return 'This person already has personal items';
        }

        if (formRef.current) {
            const validationStatus = formRef.current.getValidationStatus();

            if (validationStatus.hasIncompleteRows) {
                return 'Please fill in both name and price for each item, or leave both empty';
            }

            if (!validationStatus.hasValidItems) {
                return 'Add at least one item with name and price';
            }
        }

        return 'Save personal items for this person';
    };

    const canSavePersonalItem = () => {
        // Check if owner is selected
        if (!selectedOwner) return false;

        // Check if it's a duplicate
        if (isDuplicatePersonalItem(selectedOwner)) return false;

        // Check form validation
        if (formRef.current) {
            const validationStatus = formRef.current.getValidationStatus();
            if (!validationStatus.canSave) return false;
        }

        return true;
    };

    // Update tooltip whenever relevant state changes
    useEffect(() => {
        if (selecting) {
            setSaveButtonTooltip(getSaveButtonTooltip());
        }
    }, [selectedOwner, tempItems, selecting]);

    const handleSavePersonalItem = () => {
        // Clear any previous error messages
        setErrorMessage('');

        // Check owner selection
        if (!selectedOwner) {
            setErrorMessage('Please select who is buying items for themselves');
            return;
        }

        // Check for duplicate
        if (isDuplicatePersonalItem(selectedOwner)) {
            setErrorMessage('This person already has personal items');
            return;
        }

        // Validate the form
        if (formRef.current && !formRef.current.validateForm()) {
            return;
        }

        // All validations passed, save the personal item
        setPersonalItems([
            ...personalItems,
            {
                owner: selectedOwner,
                items: [...tempItems]
            },
        ]);
        setSelecting(false);
        setSelectedOwner('');
        setTempItems([{ name: '', price: '' }]);
        setErrorMessage('');
        setSaveButtonTooltip('');
    };

    const handleCancelPersonalItem = () => {
        setSelecting(false);
        setSelectedOwner('');
        setTempItems([{ name: '', price: '' }]);
        setErrorMessage('');
        setSaveButtonTooltip('');
    };

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
        total += everyoneTotal / names.length;

        // Add split group portions
        splitGroupsItems.forEach(group => {
            if (group.participants.includes(personName)) {
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

    // Color schemes for different personal items
    const personalItemColors = [
        { border: 'border-teal-300', bg: 'bg-teal-50', badge: 'bg-teal-100 text-teal-700' },
        { border: 'border-green-300', bg: 'bg-green-50', badge: 'bg-green-100 text-green-700' },
        { border: 'border-emerald-300', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
        { border: 'border-cyan-300', bg: 'bg-cyan-50', badge: 'bg-cyan-100 text-cyan-700' },
        { border: 'border-blue-300', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
        { border: 'border-indigo-300', bg: 'bg-indigo-50', badge: 'bg-indigo-100 text-indigo-700' },
    ];

    // Get available people (those who haven't been selected yet)
    const availablePeople = names.filter(name => !personalItems.some(item => item.owner === name));

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Personal Items
                        </h1>
                        <p className="text-lg text-gray-600">
                            Add items that people bought for themselves only
                        </p>
                    </div>
                    <button
                        onClick={onBack}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Add Personal Item Button */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Add Personal Items</h2>
                                    <p className="text-sm text-gray-500">Items someone bought for themselves only</p>
                                </div>
                            </div>
                            <button
                                onClick={handleStartPersonalItem}
                                className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                                disabled={selecting || availablePeople.length === 0}
                                title={selecting ? "Save personal item before adding new one" : availablePeople.length === 0 ? "Everyone has personal items" : "Add personal items for someone"}
                            >
                                {selecting ? 'Creating...' : 'Add Personal Items'}
                            </button>
                        </div>
                    </div>

                    {/* Error message */}
                    {errorMessage && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-700 font-medium">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Personal Item Creation Form */}
                    {selecting && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-6 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900">New Personal Items</h3>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Owner Selection */}
                                <div>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-3 h-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <h4 className="font-medium text-gray-900">Who is buying items for themselves?</h4>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {availablePeople.map((person) => (
                                            <button
                                                key={person}
                                                type="button"
                                                onClick={() => setSelectedOwner(person)}
                                                className={`px-4 py-3 rounded-lg border font-medium transition-all duration-200 ${selectedOwner === person
                                                        ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                                                        : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {person}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Duplicate Warning */}
                                {selectedOwner && isDuplicatePersonalItem(selectedOwner) && (
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            <p className="text-amber-700 text-sm">This person already has personal items</p>
                                        </div>
                                    </div>
                                )}

                                {/* Items Form */}
                                {selectedOwner && (
                                    <div>
                                        <GroceryItemForm
                                            ref={formRef}
                                            items={tempItems}
                                            setItems={setTempItems}
                                            participants={[selectedOwner]}
                                        />
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {selectedOwner && (
                                    <div className="flex gap-4 pt-6 border-t border-gray-100">
                                        <button
                                            onClick={handleSavePersonalItem}
                                            disabled={!canSavePersonalItem()}
                                            className={`flex-1 px-6 py-3 font-semibold rounded-lg focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${canSavePersonalItem()
                                                    ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white hover:from-teal-600 hover:to-green-600 focus:ring-teal-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                            title={saveButtonTooltip}
                                        >
                                            Save Personal Items
                                        </button>
                                        <button
                                            onClick={handleCancelPersonalItem}
                                            className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Existing Personal Items */}
                    {personalItems.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900">Personal Items</h2>
                            {personalItems.map((personalItem, idx) => {
                                const colorScheme = personalItemColors[idx % personalItemColors.length];
                                return (
                                    <div
                                        key={idx}
                                        className={`border-2 rounded-xl p-6 transition-all duration-200 bg-white ${colorScheme.border} hover:shadow-md`}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-8 h-8 ${colorScheme.bg} rounded-lg flex items-center justify-center`}>
                                                    <span className="text-sm font-bold text-gray-700">{idx + 1}</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {personalItem.owner}'s Personal Items
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        Items bought for themselves only
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorScheme.badge}`}>
                                                    {personalItem.owner}
                                                </span>
                                            </div>
                                        </div>
                                        <GroceryItemForm
                                            items={personalItem.items}
                                            setItems={(newItems) => {
                                                setPersonalItems((prev) =>
                                                    prev.map((item, i) =>
                                                        i === idx ? { ...item, items: newItems } : item
                                                    )
                                                );
                                            }}
                                            participants={[personalItem.owner]}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Summary Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="border-b border-gray-100 pb-4">
                                    <h4 className="font-medium text-gray-700 mb-3">Everyone Splits</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total:</span>
                                            <span className="font-semibold">${everyoneTotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Per person:</span>
                                            <span className="font-semibold text-teal-600">${(everyoneTotal / names.length).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

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
                                    <h4 className="font-medium text-gray-700 mb-3">Per Person Totals</h4>
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PersonalItemsPage; 