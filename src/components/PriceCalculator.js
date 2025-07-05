/**
 * Utility functions for calculating prices and totals in the ShopNSplit app
 */

/**
 * Calculate the total cost of items that everyone splits equally
 * @param {Array} everyoneItems - Array of items with name and price properties
 * @returns {number} Total cost
 */
export const calculateEveryoneTotal = (everyoneItems = []) => {
    return everyoneItems.reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        return total + price;
    }, 0);
};

/**
 * Calculate the total cost of items in split groups
 * @param {Array} splitGroupsItems - Array of groups, each with items array
 * @returns {number} Total cost across all groups
 */
export const calculateGroupsTotal = (splitGroupsItems = []) => {
    return splitGroupsItems.reduce((total, group) => {
        return total + group.items.reduce((groupTotal, item) => {
            const price = parseFloat(item.price) || 0;
            return groupTotal + price;
        }, 0);
    }, 0);
};

/**
 * Calculate the total cost of personal items
 * @param {Array} personalItems - Array of personal items, each with owner and items array
 * @returns {number} Total cost of all personal items
 */
export const calculatePersonalTotal = (personalItems = []) => {
    return personalItems.reduce((total, personalItem) => {
        return total + personalItem.items.reduce((itemTotal, item) => {
            const price = parseFloat(item.price) || 0;
            return itemTotal + price;
        }, 0);
    }, 0);
};

/**
 * Calculate the total amount a specific person owes
 * @param {string} personName - Name of the person
 * @param {Array} names - Array of all participant names
 * @param {Array} everyoneItems - Array of items everyone splits
 * @param {Array} splitGroupsItems - Array of split groups
 * @param {Array} personalItems - Array of personal items
 * @returns {number} Total amount the person owes
 */
export const calculatePersonTotal = (personName, names = [], everyoneItems = [], splitGroupsItems = [], personalItems = []) => {
    let total = 0;

    // Add everyone split portion
    const everyoneTotal = calculateEveryoneTotal(everyoneItems);
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

/**
 * Calculate all totals and return them in a structured object
 * @param {Array} names - Array of all participant names
 * @param {Array} everyoneItems - Array of items everyone splits
 * @param {Array} splitGroupsItems - Array of split groups
 * @param {Array} personalItems - Array of personal items
 * @returns {Object} Object containing all calculated totals
 */
export const calculateAllTotals = (names = [], everyoneItems = [], splitGroupsItems = [], personalItems = []) => {
    const everyoneTotal = calculateEveryoneTotal(everyoneItems);
    const groupsTotal = calculateGroupsTotal(splitGroupsItems);
    const personalTotal = calculatePersonalTotal(personalItems);
    const grandTotal = everyoneTotal + groupsTotal + personalTotal;

    // Calculate per-person totals
    const personTotals = names.map(name => ({
        name,
        total: calculatePersonTotal(name, names, everyoneItems, splitGroupsItems, personalItems)
    }));

    return {
        everyoneTotal,
        groupsTotal,
        personalTotal,
        grandTotal,
        personTotals
    };
};

/**
 * Legacy function for SplitGroupsPage compatibility
 * Uses 'groups' instead of 'splitGroupsItems' parameter name
 * @param {Array} groups - Array of groups, each with items array
 * @returns {number} Total cost across all groups
 */
export const calculateGroupsTotalLegacy = (groups = []) => {
    return calculateGroupsTotal(groups);
};

/**
 * Legacy function for SplitGroupsPage compatibility
 * Uses 'groups' instead of 'splitGroupsItems' parameter name and doesn't include personal items
 * @param {string} personName - Name of the person
 * @param {Array} names - Array of all participant names
 * @param {Array} everyoneItems - Array of items everyone splits
 * @param {Array} groups - Array of split groups
 * @returns {number} Total amount the person owes
 */
export const calculatePersonTotalLegacy = (personName, names = [], everyoneItems = [], groups = []) => {
    return calculatePersonTotal(personName, names, everyoneItems, groups, []);
}; 