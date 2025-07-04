import React, { useRef, useState, useEffect } from 'react';
import GroceryItemForm from './GroceryItemForm';
import PageHeader from './PageHeader';
import ValidationMessage from './ValidationMessage';
import SummaryCard from './SummaryCard';
import PrimaryButton from './PrimaryButton';
import CardHeader from './CardHeader';
import ParticipantsCard from './ParticipantsCard';

function GroceryPage({ names, onBack, onNext, items, setItems }) {
    const formRef = useRef();
    const [nextButtonTooltip, setNextButtonTooltip] = useState('');

    const canProceed = () => {
        if (!formRef.current) {
            return false;
        }

        const validationStatus = formRef.current.getValidationStatus();
        return validationStatus.canProceed;
    };

    const getNextButtonTooltip = () => {
        if (!formRef.current) {
            return 'Loading...';
        }

        const validationStatus = formRef.current.getValidationStatus();

        if (validationStatus.hasIncompleteRows) {
            return 'Please fill in both name and price for each item, or leave both empty';
        }

        if (!validationStatus.hasValidItems) {
            return 'Add at least one item with both name and price to continue';
        }

        return 'Proceed to split groups';
    };

    // Update tooltip whenever items change
    useEffect(() => {
        setNextButtonTooltip(getNextButtonTooltip());
    }, [items]);

    const handleNext = () => {
        // Validate the form before proceeding
        if (formRef.current && !formRef.current.validateForm()) {
            // Form validation failed, error message is shown by the form
            return;
        }
        onNext();
    };

    const totalItems = items.filter(item => item.name.trim() !== '' && item.price.trim() !== '').length;
    const totalAmount = items.reduce((total, item) => total + (parseFloat(item.price) || 0), 0);
    const perPerson = totalAmount / names.length;

    const summaryIcon = (
        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
    );

    const groceryIcon = (
        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
        </svg>
    );

    const nextIcon = (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <PageHeader
                title="Everyone splits these items"
                description="Add items that everyone will split equally"
                onBack={onBack}
            />

            <ParticipantsCard participants={names} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <CardHeader
                            icon={groceryIcon}
                            title="Grocery Items"
                        />

                        <div className="p-6">
                            <GroceryItemForm
                                ref={formRef}
                                items={items}
                                setItems={setItems}
                                participants={names}
                            />
                        </div>
                    </div>

                    {/* Validation Feedback */}
                    {formRef.current && formRef.current.getValidationStatus().hasIncompleteRows && (
                        <ValidationMessage
                            type="warning"
                            message="Please fill in both name and price for each item, or leave both empty"
                            className="mt-4"
                        />
                    )}

                    {formRef.current && !formRef.current.getValidationStatus().hasValidItems && (
                        <ValidationMessage
                            type="warning"
                            message="Please add at least one item with both name and price to continue"
                            className="mt-4"
                        />
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8">
                        <SummaryCard title="Summary" icon={summaryIcon}>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-gray-600">Total Items</span>
                                    <span className="font-semibold text-gray-900">{totalItems}</span>
                                </div>

                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-gray-600">Total Amount</span>
                                    <span className="font-semibold text-gray-900">${totalAmount.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between items-center py-3">
                                    <span className="text-gray-600">Per Person</span>
                                    <span className="font-semibold text-teal-600">${perPerson.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <PrimaryButton
                                    onClick={handleNext}
                                    disabled={!canProceed()}
                                    size="lg"
                                    className="w-full"
                                    title={nextButtonTooltip}
                                    showIcon={canProceed()}
                                    icon={canProceed() ? nextIcon : null}
                                >
                                    {canProceed() ? 'Continue to Groups' : 'Add items to continue'}
                                </PrimaryButton>
                            </div>
                        </SummaryCard>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GroceryPage; 