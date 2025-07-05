import React, { useState, useEffect, useRef, useCallback } from 'react';
import GroceryItemForm from './GroceryItemForm';
import ParticipantSelector from './ParticipantSelector';
import PageHeader from './PageHeader';
import ValidationMessage from './ValidationMessage';
import SummaryCard from './SummaryCard';
import PrimaryButton from './PrimaryButton';
import CardHeader from './CardHeader';
import { calculateEveryoneTotal, calculateGroupsTotalLegacy, calculatePersonTotalLegacy } from './PriceCalculator';

function SplitGroupsPage({ names, onBack, everyoneItems = [], groups, setGroups, onNext }) {
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

    const handleDeleteGroup = (index) => {
        const newGroups = groups.filter((_, i) => i !== index);
        setGroups(newGroups);
    };

    const isDuplicateGroup = (participants) => {
        return groups.some(group => {
            if (group.participants.length !== participants.length) return false;
            return group.participants.every(person => participants.includes(person));
        });
    };

    const getSaveButtonTooltip = useCallback(() => {
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
    }, [selectedPeople, isDuplicateGroup]);

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

    const hasUnsavedChanges = () => {
        // Check if there are any items with data in the temp form
        return tempItems.some(item => item.name.trim() !== '' || item.price.trim() !== '') || selectedPeople.length > 0;
    };

    const canProceedToNext = () => {
        // Can't proceed if there are unsaved changes
        if (selecting && hasUnsavedChanges()) {
            return false;
        }
        return true;
    };

    // Update tooltip whenever relevant state changes
    useEffect(() => {
        if (selecting) {
            setSaveButtonTooltip(getSaveButtonTooltip());
        }
    }, [selectedPeople, tempItems, selecting, getSaveButtonTooltip]);

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

    const handleNext = () => {
        if (!canProceedToNext()) {
            setErrorMessage('Please save or cancel the current group before proceeding');
            return;
        }
        onNext && onNext(groups);
    };

    // Calculate totals using utility functions
    const everyoneTotal = calculateEveryoneTotal(everyoneItems);
    const groupsTotal = calculateGroupsTotalLegacy(groups);
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

    const addGroupIcon = (
        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
    );

    const summaryIcon = (
        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
    );

    const nextIcon = (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
    );

    const deleteIcon = (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <PageHeader
                title="Split Groups"
                description="Create groups for items that only some people will split"
                onBack={onBack}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Add Group Button */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                    {addGroupIcon}
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Create Split Group</h2>
                                    <p className="text-sm text-gray-500">Add items that only some people will split</p>
                                </div>
                            </div>
                            <PrimaryButton
                                onClick={handleStartGroup}
                                disabled={selecting}
                                title={selecting ? "Save group before adding new one" : "Add a new split group"}
                            >
                                {selecting ? 'Creating...' : 'Add Group'}
                            </PrimaryButton>
                        </div>
                    </div>

                    {/* Error message */}
                    <ValidationMessage
                        type="error"
                        message={errorMessage}
                    />

                    {/* Group Creation Form */}
                    {selecting && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <CardHeader title="New Split Group" />

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
                                    <ValidationMessage
                                        type="warning"
                                        message="This group already exists"
                                    />
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
                                        <PrimaryButton
                                            onClick={handleSaveGroup}
                                            disabled={!canSaveGroup()}
                                            className="flex-1"
                                            title={saveButtonTooltip}
                                        >
                                            Save Group
                                        </PrimaryButton>
                                        <PrimaryButton
                                            onClick={handleCancelGroup}
                                            variant="secondary"
                                        >
                                            Cancel
                                        </PrimaryButton>
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
                                            <div className="flex items-center space-x-3">
                                                <div className="flex flex-wrap gap-2">
                                                    {group.participants.map((participant, pIdx) => (
                                                        <span key={pIdx} className={`px-3 py-1 rounded-full text-sm font-medium ${colorScheme.badge}`}>
                                                            {participant}
                                                        </span>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteGroup(idx)}
                                                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete this group"
                                                >
                                                    {deleteIcon}
                                                </button>
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
                        <SummaryCard title="Summary" icon={summaryIcon}>
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
                                                <span className="font-semibold text-teal-600">${calculatePersonTotalLegacy(person, names, everyoneItems, groups).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Next Button */}
                                <div className="border-t border-gray-100 pt-4">
                                    <PrimaryButton
                                        onClick={handleNext}
                                        disabled={!canProceedToNext()}
                                        className="w-full"
                                        showIcon={canProceedToNext()}
                                        icon={canProceedToNext() ? nextIcon : null}
                                        title={!canProceedToNext() ? "Please save or cancel the current group before proceeding" : "Continue to Personal Items"}
                                    >
                                        {canProceedToNext() ? 'Next: Personal Items' : 'Save group to continue'}
                                    </PrimaryButton>
                                </div>
                            </div>
                        </SummaryCard>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SplitGroupsPage; 