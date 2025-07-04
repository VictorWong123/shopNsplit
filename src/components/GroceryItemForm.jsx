import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import FormValidation from './FormValidation';

const GroceryItemForm = forwardRef(({ items, setItems, participants, showValidation = true }, ref) => {
    const [errorMessage, setErrorMessage] = useState('');

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);

        // Clear error message when user starts typing
        if (errorMessage) {
            setErrorMessage('');
        }
    };

    const addNewItem = () => {
        setItems([...items, { name: '', price: '' }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
        }
    };

    // Auto-add new line when current line is filled
    useEffect(() => {
        const lastItem = items[items.length - 1];
        if (lastItem && lastItem.name.trim() !== '' && lastItem.price.trim() !== '') {
            // Check if we need to add a new line
            const shouldAddNewLine = items.every((item, index) => {
                if (index === items.length - 1) return true; // Last item is filled
                return item.name.trim() !== '' && item.price.trim() !== '';
            });
            if (shouldAddNewLine) {
                setItems([...items, { name: '', price: '' }]);
            }
        }
    }, [items, setItems]);

    // Validation function that can be called from parent components
    const validateForm = () => {
        const validation = FormValidation.validateForm(items);

        if (!validation.isValid) {
            setErrorMessage(validation.message);
            return false;
        }

        setErrorMessage('');
        return true;
    };

    // Expose validation functions to parent
    useImperativeHandle(ref, () => ({
        validateForm,
        hasIncompleteRows: () => FormValidation.hasIncompleteRows(items),
        hasValidItems: () => FormValidation.hasValidItems(items),
        getValidationStatus: () => FormValidation.getValidationStatus(items)
    }), [items]);

    const calculateTotal = () => {
        return items.reduce((total, item) => {
            const price = parseFloat(item.price) || 0;
            return total + price;
        }, 0);
    };

    const calculateSplit = () => {
        const total = calculateTotal();
        return participants.length > 0 ? total / participants.length : 0;
    };

    const total = calculateTotal();
    const splitAmount = calculateSplit();

    return (
        <>
            {/* Error message */}
            {showValidation && errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-700 font-medium">{errorMessage}</p>
                    </div>
                </div>
            )}

            {/* Items List */}
            <div className="space-y-4 mb-6">
                {items.map((item, index) => {
                    const hasName = item.name.trim() !== '';
                    const hasPrice = item.price.trim() !== '';
                    const isIncomplete = (hasName && !hasPrice) || (!hasName && hasPrice);
                    const isValid = hasName && hasPrice;

                    return (
                        <div key={index} className={`p-4 border rounded-lg transition-all duration-200 ${isValid
                                ? 'bg-green-50 border-green-200'
                                : isIncomplete
                                    ? 'bg-red-50 border-red-200'
                                    : 'bg-gray-50 border-gray-200'
                            }`}>
                            <div className="flex items-center space-x-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isValid
                                        ? 'bg-green-100 text-green-700'
                                        : isIncomplete
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {index + 1}
                                </div>

                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${isIncomplete ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                        placeholder="Item name"
                                    />
                                </div>

                                <div className="w-32">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={item.price}
                                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${isIncomplete ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                        placeholder="0.00"
                                    />
                                </div>

                                {items.length > 1 && (
                                    <button
                                        onClick={() => removeItem(index)}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                        title="Remove item"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {isValid && (
                                <div className="mt-3 flex items-center space-x-2 text-sm text-green-700">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Item added successfully</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add Item Button */}
            <div className="mb-8">
                <button
                    onClick={addNewItem}
                    className="flex items-center space-x-2 px-6 py-3 bg-teal-50 text-teal-700 font-semibold rounded-lg hover:bg-teal-100 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 border border-teal-200"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add Another Item</span>
                </button>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-xl p-6 border border-teal-200">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Split Summary</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg border border-teal-100">
                        <div className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">Total Amount</div>
                    </div>

                    <div className="text-center p-4 bg-white rounded-lg border border-teal-100">
                        <div className="text-2xl font-bold text-teal-600">${splitAmount.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">Per Person</div>
                    </div>

                    <div className="text-center p-4 bg-white rounded-lg border border-teal-100">
                        <div className="text-2xl font-bold text-gray-900">{participants.length}</div>
                        <div className="text-sm text-gray-600">Participants</div>
                    </div>
                </div>
            </div>
        </>
    );
});

GroceryItemForm.displayName = 'GroceryItemForm';

export default GroceryItemForm; 