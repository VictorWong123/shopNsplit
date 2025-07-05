import React, { useState, useEffect } from 'react';
import SetupPage from './components/SetupPage';
import GroceryPage from './components/GroceryPage';
import SplitGroupsPage from './components/SplitGroupsPage';
import PersonalItemsPage from './components/PersonalItemsPage';
import ReceiptPage from './components/ReceiptPage';
import ReceiptsPage from './components/ReceiptsPage';
import AuthModal from './components/AuthModal';
import UserMenu from './components/UserMenu';
import API_BASE_URL from './config';

function App() {
    const [numPeople, setNumPeople] = useState('');
    const [names, setNames] = useState([]);
    const [everyoneItems, setEveryoneItems] = useState([{ name: '', price: '' }]);
    const [splitGroupsItems, setSplitGroupsItems] = useState([]);
    const [personalItems, setPersonalItems] = useState([]);
    const [currentPage, setCurrentPage] = useState('setup'); // 'setup', 'grocery', 'splitgroups', 'personal', 'receipt', 'receipts'

    // Authentication state
    const [user, setUser] = useState(null);
    const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
    const [savingReceipt, setSavingReceipt] = useState(false);
    const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);

    // Track which pages have been visited
    const getVisitedPages = () => {
        const visited = ['setup'];
        if (names.length > 0) visited.push('grocery');
        if (splitGroupsItems.length > 0 || everyoneItems.some(item => item.name.trim() !== '')) visited.push('splitgroups');
        if (personalItems.length > 0 || splitGroupsItems.length > 0 || everyoneItems.some(item => item.name.trim() !== '')) visited.push('personal');
        if (personalItems.length > 0) visited.push('receipt');
        return visited;
    };

    const visitedPages = getVisitedPages();



    // Check authentication status on app load
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                credentials: 'include'
            });

            if (!response.ok) {
                // If not authenticated, that's fine - user will need to log in
                return;
            }

            const data = await response.json();
            if (data.user) {
                setUser(data.user);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            // Don't throw error - just log it and continue
        }
    };

    const handleAuthSuccess = (userData) => {
        setUser(userData);
        setAuthModal({ isOpen: false, mode: 'login' });
    };

    const handleSwitchAuthMode = (newMode) => {
        setAuthModal({ isOpen: true, mode: newMode });
    };

    const handleLogout = () => {
        setUser(null);
    };

    const handleSaveReceipt = async () => {
        if (!user) return;

        setSavingReceipt(true);
        try {
            // Calculate all totals like in ReceiptPage
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

            // Calculate per-person totals
            const personTotals = names.map(name => ({
                name,
                total: calculatePersonTotal(name)
            }));

            const receiptData = {
                names,
                everyoneItems,
                splitGroupsItems,
                personalItems,
                totals: {
                    everyoneTotal,
                    groupsTotal,
                    personalTotal,
                    grandTotal,
                    personTotals
                }
            };

            // Generate default name based on current date/time
            const defaultName = new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const response = await fetch(`${API_BASE_URL}/api/receipts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    data: receiptData,
                    name: defaultName
                })
            });

            if (response.ok) {
                alert('Receipt saved successfully!');
            } else {
                alert('Failed to save receipt');
            }
        } catch (error) {
            alert('Error saving receipt');
        } finally {
            setSavingReceipt(false);
        }
    };

    const handleNextPage = () => {
        setCurrentPage('grocery');
    };

    const handleBackToSetup = () => {
        setCurrentPage('setup');
    };

    const handleNextToSplitGroups = () => {
        setCurrentPage('splitgroups');
    };

    const handleNextToPersonalItems = (groups) => {
        setSplitGroupsItems(groups);
        setCurrentPage('personal');
    };

    const handleNextToReceipt = (personal) => {
        setPersonalItems(personal);
        setCurrentPage('receipt');
    };

    const handleBackToSplitGroups = () => {
        setCurrentPage('splitgroups');
    };

    const handleBackToPersonalItems = () => {
        setCurrentPage('personal');
    };

    const handleHeaderNavigation = (page) => {
        if (visitedPages.includes(page)) {
            setCurrentPage(page);
        }
    };

    const hasUnsavedChanges = () => {
        // Check if there are any items or data that would be lost
        const hasEveryoneItems = everyoneItems.some(item => item.name.trim() !== '' || parseFloat(item.price) > 0);
        const hasSplitGroups = splitGroupsItems.length > 0;
        const hasPersonalItems = personalItems.length > 0;
        const hasNames = names.length > 0;

        return hasEveryoneItems || hasSplitGroups || hasPersonalItems || hasNames;
    };

    const handleViewReceipts = () => {
        if (hasUnsavedChanges() && currentPage !== 'setup') {
            setPendingNavigation('receipts');
            setShowLeaveConfirmation(true);
        } else {
            setCurrentPage('receipts');
        }
    };

    const handleConfirmLeave = () => {
        setShowLeaveConfirmation(false);
        if (pendingNavigation) {
            setCurrentPage(pendingNavigation);
            setPendingNavigation(null);
        }
    };

    const handleCancelLeave = () => {
        setShowLeaveConfirmation(false);
        setPendingNavigation(null);
    };

    const renderHeader = () => (
        <header className="bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Logo and Brand */}
                    <div
                        className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setCurrentPage('setup')}
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-green-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">ShopNSplit</h1>
                            <p className="text-sm text-gray-500">Smart grocery splitting made simple</p>
                        </div>
                    </div>

                    {/* Center: Process Steps */}
                    {currentPage !== 'setup' && currentPage !== 'receipts' && (
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <div
                                className={`flex items-center space-x-1 cursor-pointer transition-colors ${visitedPages.includes('grocery') ? 'hover:text-teal-600' : 'cursor-not-allowed opacity-50'}`}
                                onClick={() => handleHeaderNavigation('grocery')}
                            >
                                <div className={`w-2 h-2 rounded-full ${currentPage === 'grocery' ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                                <span className={currentPage === 'grocery' ? 'text-teal-600 font-medium' : ''}>Setup</span>
                            </div>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <div
                                className={`flex items-center space-x-1 cursor-pointer transition-colors ${visitedPages.includes('grocery') ? 'hover:text-teal-600' : 'cursor-not-allowed opacity-50'}`}
                                onClick={() => handleHeaderNavigation('grocery')}
                            >
                                <div className={`w-2 h-2 rounded-full ${currentPage === 'grocery' ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                                <span className={currentPage === 'grocery' ? 'text-teal-600 font-medium' : ''}>Items</span>
                            </div>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <div
                                className={`flex items-center space-x-1 cursor-pointer transition-colors ${visitedPages.includes('splitgroups') ? 'hover:text-teal-600' : 'cursor-not-allowed opacity-50'}`}
                                onClick={() => handleHeaderNavigation('splitgroups')}
                            >
                                <div className={`w-2 h-2 rounded-full ${currentPage === 'splitgroups' ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                                <span className={currentPage === 'splitgroups' ? 'text-teal-600 font-medium' : ''}>Groups</span>
                            </div>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <div
                                className={`flex items-center space-x-1 cursor-pointer transition-colors ${visitedPages.includes('personal') ? 'hover:text-teal-600' : 'cursor-not-allowed opacity-50'}`}
                                onClick={() => handleHeaderNavigation('personal')}
                            >
                                <div className={`w-2 h-2 rounded-full ${currentPage === 'personal' ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                                <span className={currentPage === 'personal' ? 'text-teal-600 font-medium' : ''}>Personal</span>
                            </div>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <div
                                className={`flex items-center space-x-1 cursor-pointer transition-colors ${visitedPages.includes('receipt') ? 'hover:text-teal-600' : 'cursor-not-allowed opacity-50'}`}
                                onClick={() => handleHeaderNavigation('receipt')}
                            >
                                <div className={`w-2 h-2 rounded-full ${currentPage === 'receipt' ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                                <span className={currentPage === 'receipt' ? 'text-teal-600 font-medium' : ''}>Receipt</span>
                            </div>
                        </div>
                    )}

                    {/* Right: User Menu */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <UserMenu
                                user={user}
                                onLogout={handleLogout}
                                onViewReceipts={handleViewReceipts}
                            />
                        ) : (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                                    className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                                >
                                    Sign In
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                    onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                                    className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {renderHeader()}
            <main className="py-8">
                {currentPage === 'receipts' && (
                    <ReceiptsPage onBack={() => setCurrentPage('setup')} />
                )}
                {currentPage === 'receipt' && (
                    <ReceiptPage
                        names={names}
                        onBack={handleBackToPersonalItems}
                        everyoneItems={everyoneItems}
                        splitGroupsItems={splitGroupsItems}
                        personalItems={personalItems}
                        user={user}
                        onSaveReceipt={handleSaveReceipt}
                    />
                )}
                {currentPage === 'personal' && (
                    <PersonalItemsPage
                        names={names}
                        onBack={handleBackToSplitGroups}
                        everyoneItems={everyoneItems}
                        splitGroupsItems={splitGroupsItems}
                        personalItems={personalItems}
                        setPersonalItems={setPersonalItems}
                        onNext={handleNextToReceipt}
                    />
                )}
                {currentPage === 'splitgroups' && (
                    <SplitGroupsPage
                        names={names}
                        onBack={() => setCurrentPage('grocery')}
                        everyoneItems={everyoneItems}
                        groups={splitGroupsItems}
                        setGroups={setSplitGroupsItems}
                        onNext={handleNextToPersonalItems}
                    />
                )}
                {currentPage === 'grocery' && (
                    <GroceryPage names={names} onBack={handleBackToSetup} onNext={handleNextToSplitGroups} items={everyoneItems} setItems={setEveryoneItems} />
                )}
                {currentPage === 'setup' && (
                    <SetupPage
                        numPeople={numPeople}
                        setNumPeople={setNumPeople}
                        names={names}
                        setNames={setNames}
                        onNext={handleNextPage}
                    />
                )}
            </main>

            {/* Auth Modal */}
            <AuthModal
                isOpen={authModal.isOpen}
                mode={authModal.mode}
                onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
                onAuthSuccess={handleAuthSuccess}
                onSwitchMode={handleSwitchAuthMode}
            />

            {/* Leave Confirmation Modal */}
            {showLeaveConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leaving Form</h3>
                        <p className="text-gray-600 mb-6">
                            You have unsaved changes. Are you sure you want to leave? Your changes won't be saved.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleCancelLeave}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                No, Stay Here
                            </button>
                            <button
                                onClick={handleConfirmLeave}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Yes, Leave
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App; 