import React, { useRef, useState, useEffect } from 'react';
import GroceryItemForm from './GroceryItemForm';
import FormValidation from './FormValidation';

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

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Everyone splits these items
                        </h1>
                        <p className="text-lg text-gray-600">
                            Add items that everyone will split equally
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

                {/* Participants Card */}
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Participants</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {names.map((name, index) => (
                            <div key={index} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
                                {name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-6 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                                    </svg>
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Grocery Items</h2>
                            </div>
                        </div>

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
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <p className="text-amber-700 font-medium">Please fill in both name and price for each item, or leave both empty</p>
                            </div>
                        </div>
                    )}

                    {formRef.current && !formRef.current.getValidationStatus().hasValidItems && (
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <p className="text-amber-700 font-medium">Please add at least one item with both name and price to continue</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
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
                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-gray-600">Total Items</span>
                                    <span className="font-semibold text-gray-900">
                                        {items.filter(item => item.name.trim() !== '' && item.price.trim() !== '').length}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                    <span className="text-gray-600">Total Amount</span>
                                    <span className="font-semibold text-gray-900">
                                        ${items.reduce((total, item) => total + (parseFloat(item.price) || 0), 0).toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center py-3">
                                    <span className="text-gray-600">Per Person</span>
                                    <span className="font-semibold text-teal-600">
                                        ${(items.reduce((total, item) => total + (parseFloat(item.price) || 0), 0) / names.length).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <button
                                    onClick={handleNext}
                                    disabled={!canProceed()}
                                    className={`w-full px-6 py-4 font-semibold text-white rounded-lg focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${canProceed()
                                            ? 'bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 focus:ring-teal-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    title={nextButtonTooltip}
                                >
                                    {canProceed() ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <span>Continue to Groups</span>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </div>
                                    ) : (
                                        'Add items to continue'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GroceryPage; 