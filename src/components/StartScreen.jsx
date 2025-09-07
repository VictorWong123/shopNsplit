import React from 'react';
import PageHeader from './PageHeader';
import PrimaryButton from './PrimaryButton';

function StartScreen({ onManualMode, onAIMode }) {
    const manualIcon = (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    );

    const aiIcon = (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <PageHeader
                title="Welcome to ShopNSplit"
                description="Choose how you'd like to split your grocery bill"
                showBack={false}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                {/* Manual Mode */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
                            <div className="text-teal-600">
                                {manualIcon}
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Manual Entry</h3>
                        <p className="text-gray-600 mb-8">
                            Enter your grocery items manually. Perfect for when you have a list or want full control over the process.
                        </p>
                        <PrimaryButton
                            onClick={onManualMode}
                            className="w-full"
                        >
                            Start Manual Entry
                        </PrimaryButton>
                    </div>
                </div>

                {/* AI Mode */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
                            <div className="text-purple-600">
                                {aiIcon}
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered</h3>
                        <p className="text-gray-600 mb-8">
                            Upload a photo of your receipt and let AI automatically extract items, prices, and quantities.
                        </p>
                        <PrimaryButton
                            onClick={onAIMode}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                            Use AI Assistant
                        </PrimaryButton>
                    </div>
                </div>
            </div>

            {/* Feature highlights */}
            <div className="mt-16 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-8 border border-teal-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Why Choose AI?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2">Save Time</h4>
                        <p className="text-sm text-gray-600">No more manual typing - just snap and go</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2">Accurate</h4>
                        <p className="text-sm text-gray-600">AI-powered OCR ensures precise data extraction</p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2">Smart</h4>
                        <p className="text-sm text-gray-600">Automatically categorizes and organizes items</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StartScreen; 