import React from 'react';

function ValidationMessage({ type = 'error', message, className = '' }) {
    const styles = {
        error: {
            container: 'p-4 bg-red-50 border border-red-200 rounded-lg',
            icon: 'w-5 h-5 text-red-600',
            text: 'text-red-700 font-medium',
            iconPath: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        },
        warning: {
            container: 'p-4 bg-amber-50 border border-amber-200 rounded-lg',
            icon: 'w-5 h-5 text-amber-600',
            text: 'text-amber-700 font-medium',
            iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
        },
        info: {
            container: 'p-4 bg-blue-50 border border-blue-200 rounded-lg',
            icon: 'w-5 h-5 text-blue-600',
            text: 'text-blue-700 font-medium',
            iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        }
    };

    const style = styles[type];

    if (!message) return null;

    return (
        <div className={`${style.container} ${className}`}>
            <div className="flex items-center space-x-2">
                <svg className={style.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={style.iconPath} />
                </svg>
                <p className={style.text}>{message}</p>
            </div>
        </div>
    );
}

export default ValidationMessage; 