import React, { useState, useEffect } from 'react';
import SetupPage from './components/SetupPage';
import GroceryPage from './components/GroceryPage';
import SplitGroupsPage from './components/SplitGroupsPage';
import PersonalItemsPage from './components/PersonalItemsPage';
import ReceiptPage from './components/ReceiptPage';
import ReceiptsPage from './components/ReceiptsPage';
import SharedReceiptPage from './components/SharedReceiptPage';
import AuthModal from './components/AuthModal';
import UserMenu from './components/UserMenu';
import Notification from './components/Notification';
import AuthCallback from './components/AuthCallback';
import ResetPassword from './components/ResetPassword';
import SettingsPage from './components/SettingsPage';
import { auth, receipts, users, supabase } from './supabaseClient';
import { calculateAllTotals } from './components/PriceCalculator';

function App() {
    const [numPeople, setNumPeople] = useState('');
    const [names, setNames] = useState([]);
    const [everyoneItems, setEveryoneItems] = useState([{ name: '', price: '' }]);
    const [splitGroupsItems, setSplitGroupsItems] = useState([]);
    const [personalItems, setPersonalItems] = useState([]);
    const [currentPage, setCurrentPage] = useState('setup'); // 'setup', 'grocery', 'splitgroups', 'personal', 'receipt', 'receipts', 'shared', 'auth-callback', 'reset-password', 'settings'
    const [sharedReceiptId, setSharedReceiptId] = useState(null);

    // Authentication state
    const [user, setUser] = useState(null);
    const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
    const [savingReceipt, setSavingReceipt] = useState(false);
    const [receiptSaved, setReceiptSaved] = useState(false);
    const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);

    // Notification state
    const [notification, setNotification] = useState(null);

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



    // Check authentication status on app load and handle shared receipts
    useEffect(() => {
        checkAuthStatus();
        checkForSharedReceipt();

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event, session?.user?.email);

                if (event === 'SIGNED_IN' && session?.user) {
                    console.log('User signed in, updating state...');
                    // User signed in
                    const { data: userProfile } = await users.getUserProfile(session.user.id);
                    const userData = {
                        id: session.user.id,
                        email: session.user.email,
                        username: userProfile?.username || session.user.email.split('@')[0]
                    };
                    console.log('Setting user from SIGNED_IN:', userData);
                    setUser(userData);
                } else if (event === 'SIGNED_OUT') {
                    console.log('User signed out, clearing state...');
                    // User signed out
                    setUser(null);
                } else if (event === 'TOKEN_REFRESHED' && session?.user) {
                    console.log('Token refreshed, updating state...');
                    // Token refreshed, update user state
                    const { data: userProfile } = await users.getUserProfile(session.user.id);
                    const userData = {
                        id: session.user.id,
                        email: session.user.email,
                        username: userProfile?.username || session.user.email.split('@')[0]
                    };
                    console.log('Setting user from TOKEN_REFRESHED:', userData);
                    setUser(userData);
                }
            }
        );

        // Cleanup subscription on unmount
        return () => subscription.unsubscribe();
    }, []);

    const checkForSharedReceipt = () => {
        const path = window.location.pathname;

        // Check for shared receipt
        const sharedMatch = path.match(/^\/shared\/(.+)$/);
        if (sharedMatch) {
            setSharedReceiptId(sharedMatch[1]);
            setCurrentPage('shared');
            return;
        }

        // Check for auth callback
        if (path === '/auth/callback') {
            setCurrentPage('auth-callback');
            return;
        }

        // Check for reset password
        if (path === '/auth/reset-password') {
            setCurrentPage('reset-password');
            return;
        }
    };

    const checkAuthStatus = async () => {
        try {
            console.log('Checking auth status...');

            // First check if there's an active session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error('Session check error:', sessionError);
                return;
            }

            console.log('Session found:', !!session);
            console.log('User in session:', !!session?.user);

            if (session && session.user) {
                console.log('User email:', session.user.email);

                // Get user profile from our users table
                const { data: userProfile, error: profileError } = await users.getUserProfile(session.user.id);

                if (profileError) {
                    console.log('Profile error, creating profile...');
                    // Try to create user profile if it doesn't exist
                    const { error: createError } = await users.upsertUser(session.user.id, {
                        username: session.user.email.split('@')[0],
                        email: session.user.email
                    });

                    if (createError) {
                        console.error('Profile creation error:', createError);
                    }
                }

                const userData = {
                    id: session.user.id,
                    email: session.user.email,
                    username: userProfile?.username || session.user.email.split('@')[0]
                };

                console.log('Setting user:', userData);
                setUser(userData);
            } else {
                console.log('No active session, setting user to null');
                // No active session, ensure user is null
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
        }
    };

    const handleAuthSuccess = (userData) => {
        setUser(userData);
        setAuthModal({ isOpen: false, mode: 'login' });
    };

    const handleSwitchAuthMode = (newMode) => {
        setAuthModal({ isOpen: true, mode: newMode });
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            setUser(null);
            // Reset to setup page after logout
            setCurrentPage('setup');
        } catch (error) {
            // Silently handle logout errors
        }
    };

    const handleUserUpdate = (updatedUser) => {
        setUser(updatedUser);
    };

    const handleOpenSettings = () => {
        setCurrentPage('settings');
    };

    const handleSaveReceipt = async () => {
        if (!user) {
            setNotification({ message: 'Please sign in to save receipts', type: 'error' });
            return;
        }

        setSavingReceipt(true);

        try {
            // Ensure user profile exists before saving receipt
            const { error: profileError } = await users.getUserProfile(user.id);

            if (profileError) {
                // Try to create user profile if it doesn't exist
                const { error: createError } = await users.upsertUser(user.id, {
                    username: user.email.split('@')[0],
                    email: user.email
                });

                if (createError) {
                    setNotification({
                        message: `Failed to create user profile: ${createError.message || 'Unknown error'}`,
                        type: 'error'
                    });
                    return;
                }
            }

            // Calculate all totals using utility functions
            const { everyoneTotal, groupsTotal, personalTotal, grandTotal, personTotals } = calculateAllTotals(names, everyoneItems, splitGroupsItems, personalItems);

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
                },
                name: new Date().toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };

            const result = await receipts.saveReceipt(receiptData, user.id);

            if (result.error) {
                setNotification({
                    message: `Failed to save receipt: ${result.error.message || 'Unknown error'}`,
                    type: 'error'
                });
            } else if (result.message === 'Already saved') {
                setNotification({ message: 'Already saved', type: 'info' });
                setReceiptSaved(true);
            } else {
                setNotification({ message: 'Receipt saved successfully!', type: 'success' });
                setReceiptSaved(true);
            }
        } catch (error) {
            setNotification({
                message: `Error saving receipt: ${error.message || 'Unknown error'}`,
                type: 'error'
            });
        } finally {
            setSavingReceipt(false);
        }
    };

    const handleNextPage = () => {
        setCurrentPage('grocery');
    };

    const handleBackToSetup = () => {
        setCurrentPage('setup');
        setReceiptSaved(false); // Reset saved state when starting over
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
        setReceiptSaved(false); // Reset saved state for new receipt
    };

    const handleBackToSplitGroups = () => {
        setCurrentPage('splitgroups');
    };

    const handleBackToPersonalItems = () => {
        setCurrentPage('personal');
    };

    const handleStartNewReceipt = () => {
        setCurrentPage('setup');
        setReceiptSaved(false);
        setNames([]);
        setEveryoneItems([{ name: '', price: '' }]);
        setSplitGroupsItems([]);
        setPersonalItems([]);
        setNumPeople('');
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
                                onOpenSettings={handleOpenSettings}
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
            {currentPage !== 'shared' && renderHeader()}
            <main className="py-8">
                {currentPage === 'auth-callback' && (
                    <AuthCallback />
                )}
                {currentPage === 'reset-password' && (
                    <ResetPassword />
                )}
                {currentPage === 'settings' && (
                    <SettingsPage
                        user={user}
                        onBack={() => setCurrentPage('setup')}
                        onUserUpdate={handleUserUpdate}
                        onLogout={handleLogout}
                    />
                )}
                {currentPage === 'shared' && sharedReceiptId && (
                    <SharedReceiptPage receiptId={sharedReceiptId} />
                )}
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
                        receiptSaved={receiptSaved}
                        savingReceipt={savingReceipt}
                        onStartNewReceipt={handleStartNewReceipt}
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

            {/* Notification */}
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
}

export default App; 