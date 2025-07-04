import React from 'react';

class FormValidation {
    // Check if each row is either completely empty or completely filled
    static hasIncompleteRows(items) {
        return items.some(item => {
            const hasName = item.name.trim() !== '';
            const hasPrice = item.price.trim() !== '';
            // Return true if one field is filled but not the other
            return (hasName && !hasPrice) || (!hasName && hasPrice);
        });
    }

    // Check if there's at least one complete item
    static hasValidItems(items) {
        return items.some(item => item.name.trim() !== '' && item.price.trim() !== '');
    }

    // Check if all items are completely empty
    static allItemsEmpty(items) {
        return items.every(item => item.name.trim() === '' && item.price.trim() === '');
    }

    // Main validation function
    static validateForm(items) {
        // Check for incomplete rows (one field filled but not the other)
        if (this.hasIncompleteRows(items)) {
            return {
                isValid: false,
                message: 'Please fill in both name and price for each item, or leave both empty'
            };
        }

        // Check if there's at least one complete item
        if (!this.hasValidItems(items)) {
            return {
                isValid: false,
                message: 'Please add at least one item with both name and price'
            };
        }

        return {
            isValid: true,
            message: ''
        };
    }

    // Get validation status for UI feedback
    static getValidationStatus(items) {
        const hasIncomplete = this.hasIncompleteRows(items);
        const hasValid = this.hasValidItems(items);
        const allEmpty = this.allItemsEmpty(items);

        return {
            hasIncompleteRows: hasIncomplete,
            hasValidItems: hasValid,
            allItemsEmpty: allEmpty,
            canProceed: !hasIncomplete && hasValid,
            canSave: !hasIncomplete && hasValid
        };
    }
}

export default FormValidation; 