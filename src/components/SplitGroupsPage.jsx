import React, { useState, useEffect, useRef } from 'react';
import GroceryItemForm from './GroceryItemForm';
import FormValidation from './FormValidation';
import ParticipantSelector from './ParticipantSelector';

function SplitGroupsPage({ names, onBack, everyoneItems = [], onNext }) {
    const [groups, setGroups] = useState([]); // {participants: [], items: []}
    const [selecting, setSelecting] = useState(false);
    const [selectedPeople, setSelectedPeople] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [saveButtonTooltip, setSaveButtonTooltip] = useState('');

    // For adding items to the group being created
    const [tempItems, setTempItems] = useState([{ name: '', price: '' }]);
    const formRef = useRef();

    const handleStartGroup = () => {
        if (selecting) {
            setErrorMessage('Save group before adding new one');
            return;
        }
        setSelecting(true);
        setSelectedPeople([]);
        setTempItems([{ name: '', price: '' }]);
        setErrorMessage('');
        setSaveButtonTooltip('');
    };

    const isDuplicateGroup = (participants) => {
        return groups.some(group => {
            if (group.participants.length !== participants.length) return false;
            return group.participants.every(person => participants.includes(person));
        });
    };

    const getSaveButtonTooltip = () => {
        if (selectedPeople.length === 0) {
            return 'Select at least one person for the group';
        }

        if (isDuplicateGroup(selectedPeople)) {
            return 'This group already exists';
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

        return 'Save this group';
    };

    const canSaveGroup = () => {
        // Check if participants are selected
        if (selectedPeople.length === 0) return false;

        // Check if it's a duplicate group
        if (isDuplicateGroup(selectedPeople)) return false;

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
    }, [selectedPeople, tempItems, selecting]);

    const handleSaveGroup = () => {
        // Clear any previous error messages
        setErrorMessage('');

        // Check participant selection
        if (selectedPeople.length === 0) {
            setErrorMessage('Please select at least one person for the group');
            return;
        }

        // Check for duplicate group
        if (isDuplicateGroup(selectedPeople)) {
            setErrorMessage('This group already exists');
            return;
        }

        // Validate the form (checks for incomplete items and ensures at least one complete item)
        if (formRef.current && !formRef.current.validateForm()) {
            // Form validation failed, error message is shown by the form
            return;
        }

        // All validations passed, save the group
        setGroups([
            ...groups,
            { participants: [...selectedPeople], items: [...tempItems] },
        ]);
        setSelecting(false);
        setSelectedPeople([]);
        setTempItems([{ name: '', price: '' }]);
        setErrorMessage('');
        setSaveButtonTooltip('');
    };

    const handleCancelGroup = () => {
        setSelecting(false);
        setSelectedPeople([]);
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
        return groups.reduce((total, group) => {
            return total + group.items.reduce((groupTotal, item) => {
                const price = parseFloat(item.price) || 0;
                return groupTotal + price;
            }, 0);
        }, 0);
    };

    const calculatePersonTotal = (personName) => {
        let total = 0;

        // Add everyone split portion
        const everyoneTotal = calculateEveryoneTotal();
        total += everyoneTotal / names.length;

        // Add split group portions
        groups.forEach(group => {
            if (group.participants.includes(personName)) {
                const groupTotal = group.items.reduce((sum, item) => {
                    return sum + (parseFloat(item.price) || 0);
                }, 0);
                total += groupTotal / group.participants.length;
            }
        });

        return total;
    };

    const everyoneTotal = calculateEveryoneTotal();
    const groupsTotal = calculateGroupsTotal();
    const grandTotal = everyoneTotal + groupsTotal;

    // Color schemes for different groups
    const groupColors = [
        { border: 'border-blue-300', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
        { border: 'border-purple-300', bg: 'bg-purple-50', badge: 'bg-purple-100 text-purple-700' },
        { border: 'border-orange-300', bg: 'bg-orange-50', badge: 'bg-orange-100 text-orange-700' },
        { border: 'border-pink-300', bg: 'bg-pink-50', badge: 'bg-pink-100 text-pink-700' },
        { border: 'border-indigo-300', bg: 'bg-indigo-50', badge: 'bg-indigo-100 text-indigo-700' },
        { border: 'border-emerald-300', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Split Groups
                        </h1>
                        <p className="text-lg text-gray-600">
                            Create groups for items that only some people will split
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
                    {/* Add Group Button */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Create Split Group</h2>
                                    <p className="text-sm text-gray-500">Add items that only some people will split</p>
                                </div>
                            </div>
                            <button
                                onClick={handleStartGroup}
                                className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                                disabled={selecting}
                                title={selecting ? "Save group before adding new one" : "Add a new split group"}
                            >
                                {selecting ? 'Creating...' : 'Add Group'}
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

                    {/* Group Creation Form */}
                    {selecting && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-6 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900">New Split Group</h3>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Participant Selection */}
                                <ParticipantSelector
                                    participants={names}
                                    selectedParticipants={selectedPeople}
                                    onSelectionChange={setSelectedPeople}
                                    title="Select participants"
                                    subtitle="Choose who will be in this group"
                                />

                                {/* Duplicate Group Warning */}
                                {selectedPeople.length > 0 && isDuplicateGroup(selectedPeople) && (
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            <p className="text-amber-700 text-sm">This group already exists</p>
                                        </div>
                                    </div>
                                )}

                                {/* Items Form */}
                                {selectedPeople.length > 0 && (
                                    <div>
                                        <GroceryItemForm
                                            ref={formRef}
                                            items={tempItems}
                                            setItems={setTempItems}
                                            participants={selectedPeople}
                                        />
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {selectedPeople.length > 0 && (
                                    <div className="flex gap-4 pt-6 border-t border-gray-100">
                                        <button
                                            onClick={handleSaveGroup}
                                            disabled={!canSaveGroup()}
                                            className={`flex-1 px-6 py-3 font-semibold rounded-lg focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${canSaveGroup()
                                                ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white hover:from-teal-600 hover:to-green-600 focus:ring-teal-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                            title={saveButtonTooltip}
                                        >
                                            Save Group
                                        </button>
                                        <button
                                            onClick={handleCancelGroup}
                                            className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Existing Groups */}
                    {groups.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900">Split Groups</h2>
                            {groups.map((group, idx) => {
                                const colorScheme = groupColors[idx % groupColors.length];
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
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Group {idx + 1}
                                                </h3>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {group.participants.map((participant, pIdx) => (
                                                    <span key={pIdx} className={`px-3 py-1 rounded-full text-sm font-medium ${colorScheme.badge}`}>
                                                        {participant}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <GroceryItemForm
                                            items={group.items}
                                            setItems={(newItems) => {
                                                setGroups((prev) =>
                                                    prev.map((g, i) =>
                                                        i === idx ? { ...g, items: newItems } : g
                                                    )
                                                );
                                            }}
                                            participants={group.participants}
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

                                {groups.length > 0 && (
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

                                {/* Next Button */}
                                <div className="border-t border-gray-100 pt-4">
                                    <button
                                        onClick={() => onNext && onNext(groups)}
                                        className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-green-500 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-green-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        Next: Personal Items
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SplitGroupsPage; 