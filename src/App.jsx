import React, { useState } from 'react';
import SetupPage from './components/SetupPage';
import GroceryPage from './components/GroceryPage';
import SplitGroupsPage from './components/SplitGroupsPage';
import PersonalItemsPage from './components/PersonalItemsPage';
import ReceiptPage from './components/ReceiptPage';

function App() {
    const [numPeople, setNumPeople] = useState('');
    const [names, setNames] = useState([]);
    const [everyoneItems, setEveryoneItems] = useState([{ name: '', price: '' }]);
    const [splitGroupsItems, setSplitGroupsItems] = useState([]);
    const [personalItems, setPersonalItems] = useState([]);
    const [currentPage, setCurrentPage] = useState('setup'); // 'setup', 'grocery', 'splitgroups', 'personal', 'receipt'

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

    const renderHeader = () => (
        <header className="bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
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
                    {currentPage !== 'setup' && (
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <div
                                className={`flex items-center space-x-1 cursor-pointer transition-colors ${visitedPages.includes('grocery') ? 'hover:text-teal-600' : 'cursor-not-allowed opacity-50'
                                    }`}
                                onClick={() => handleHeaderNavigation('grocery')}
                            >
                                <div className={`w-2 h-2 rounded-full ${currentPage === 'grocery' ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                                <span className={currentPage === 'grocery' ? 'text-teal-600 font-medium' : ''}>Setup</span>
                            </div>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <div
                                className={`flex items-center space-x-1 cursor-pointer transition-colors ${visitedPages.includes('grocery') ? 'hover:text-teal-600' : 'cursor-not-allowed opacity-50'
                                    }`}
                                onClick={() => handleHeaderNavigation('grocery')}
                            >
                                <div className={`w-2 h-2 rounded-full ${currentPage === 'grocery' ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                                <span className={currentPage === 'grocery' ? 'text-teal-600 font-medium' : ''}>Items</span>
                            </div>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <div
                                className={`flex items-center space-x-1 cursor-pointer transition-colors ${visitedPages.includes('splitgroups') ? 'hover:text-teal-600' : 'cursor-not-allowed opacity-50'
                                    }`}
                                onClick={() => handleHeaderNavigation('splitgroups')}
                            >
                                <div className={`w-2 h-2 rounded-full ${currentPage === 'splitgroups' ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                                <span className={currentPage === 'splitgroups' ? 'text-teal-600 font-medium' : ''}>Groups</span>
                            </div>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <div
                                className={`flex items-center space-x-1 cursor-pointer transition-colors ${visitedPages.includes('personal') ? 'hover:text-teal-600' : 'cursor-not-allowed opacity-50'
                                    }`}
                                onClick={() => handleHeaderNavigation('personal')}
                            >
                                <div className={`w-2 h-2 rounded-full ${currentPage === 'personal' ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                                <span className={currentPage === 'personal' ? 'text-teal-600 font-medium' : ''}>Personal</span>
                            </div>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <div
                                className={`flex items-center space-x-1 cursor-pointer transition-colors ${visitedPages.includes('receipt') ? 'hover:text-teal-600' : 'cursor-not-allowed opacity-50'
                                    }`}
                                onClick={() => handleHeaderNavigation('receipt')}
                            >
                                <div className={`w-2 h-2 rounded-full ${currentPage === 'receipt' ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                                <span className={currentPage === 'receipt' ? 'text-teal-600 font-medium' : ''}>Receipt</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {renderHeader()}
            <main className="py-8">
                {currentPage === 'receipt' && (
                    <ReceiptPage
                        names={names}
                        onBack={handleBackToPersonalItems}
                        everyoneItems={everyoneItems}
                        splitGroupsItems={splitGroupsItems}
                        personalItems={personalItems}
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
        </div>
    );
}

export default App; 