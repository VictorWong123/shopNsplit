import React from 'react';

function PageHeader({ title, description, onBack, showBack = true }) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {title}
                    </h1>
                    <p className="text-lg text-gray-600">
                        {description}
                    </p>
                </div>
                {showBack && onBack && (
                    <button
                        onClick={onBack}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Back</span>
                    </button>
                )}
            </div>
        </div>
    );
}

export default PageHeader; 