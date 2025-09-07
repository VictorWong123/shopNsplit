
import React, { useState } from 'react';
import PageHeader from './PageHeader';
import PrimaryButton from './PrimaryButton';
import ValidationMessage from './ValidationMessage';

function AIConfirmItems({ items, total, onBack, onConfirm, onTryAgain, onSwitchToManual }) {
    const [editedItems, setEditedItems] = useState(items);
    const [errors, setErrors] = useState({});

    const handleItemChange = (index, field, value) => {
        const newItems = [...editedItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setEditedItems(newItems);

        // Clear error for this item
        if (errors[index]) {
            const newErrors = { ...errors };
            delete newErrors[index];
            setErrors(newErrors);
        }
    };

    const handleAddItem = () => {
        setEditedItems([...editedItems, { name: '', price: '', quantity: 1 }]);
    };

    const handleRemoveItem = (index) => {
        const newItems = editedItems.filter((_, i) => i !== index);
        setEditedItems(newItems);

        // Clear error for this item
        if (errors[index]) {
            const newErrors = { ...errors };
            delete newErrors[index];
            setErrors(newErrors);
        }
    };

    const validateItems = () => {
        const newErrors = {};
        let hasValidItems = false;

        editedItems.forEach((item, index) => {
            if (item.name.trim() === '' && item.price.trim() !== '') {
                newErrors[index] = 'Item name is required';
            } else if (item.name.trim() !== '' && item.price.trim() === '') {
                newErrors[index] = 'Price is required';
            } else if (item.name.trim() !== '' && item.price.trim() !== '') {
                hasValidItems = true;
                const price = parseFloat(item.price);
                if (isNaN(price) || price <= 0) {
                    newErrors[index] = 'Price must be a positive number';
                }
            }
        });

        if (!hasValidItems) {
            newErrors.general = 'At least one item with name and price is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleConfirm = () => {
        if (validateItems()) {
            // Filter out empty items and format for the app
            const validItems = editedItems
                .filter(item => item.name.trim() !== '' && item.price.trim() !== '')
                .map(item => ({
                    name: item.name.trim(),
                    price: parseFloat(item.price).toFixed(2),
                    quantity: parseInt(item.quantity) || 1
                }));

            onConfirm(validItems);
        }
    };

    const canProceed = () => {
        return editedItems.some(item =>
            item.name.trim() !== '' && item.price.trim() !== '' &&
            !isNaN(parseFloat(item.price)) && parseFloat(item.price) > 0
        );
    };

    const totalAmount = editedItems
        .filter(item => item.name.trim() !== '' && item.price.trim() !== '')
        .reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1), 0);

    const aiIcon = (
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <PageHeader
                title="Confirm Parsed Items"
                description="Review and edit the items extracted from your receipt"
                onBack={onBack}
            />

            {/* AI Success Message */}
            <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            {aiIcon}
                        </div>
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-medium text-purple-900">
                            AI Successfully Parsed Your Receipt!
                        </h3>
                        <p className="text-purple-700">
                            Found {items.length} items with a total of ${total ? total.toFixed(2) : totalAmount.toFixed(2)}.
                            Review and edit as needed before proceeding.
                        </p>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Receipt Items</h3>
                        <button
                            onClick={handleAddItem}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Item
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-gray-200">
                    {editedItems.map((item, index) => (
                        <div key={index} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                {/* Item Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Item Name
                                    </label>
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors[index] ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter item name"
                                    />
                                </div>

                                {/* Quantity */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Qty
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity || 1}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                </div>

                                {/* Price */}
                                <div className="flex items-end space-x-2">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Price
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={item.price}
                                                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${errors[index] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleRemoveItem(index)}
                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                                        title="Remove item"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Error message for this item */}
                            {errors[index] && (
                                <p className="mt-2 text-sm text-red-600">{errors[index]}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Total: <span className="font-medium text-gray-900">${totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            {editedItems.filter(item => item.name.trim() !== '' && item.price.trim() !== '').length} items
                        </div>
                    </div>
                </div>
            </div>

            {/* General Error */}
            {errors.general && (
                <div className="mt-4">
                    <ValidationMessage message={errors.general} type="error" />
                </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <PrimaryButton
                    onClick={handleConfirm}
                    disabled={!canProceed()}
                    className="bg-purple-600 hover:bg-purple-700"
                >
                    Confirm Items
                </PrimaryButton>

                <button
                    onClick={onTryAgain}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                    Try Again
                </button>

                <button
                    onClick={onSwitchToManual}
                    className="px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                    Switch to Manual
                </button>
            </div>
        </div>
    );
}

export default AIConfirmItems; 