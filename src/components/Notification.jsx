import React, { useEffect, useState } from 'react';

const Notification = ({ message, type = 'success', onClose, autoClose = true, duration = 5000 }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => onClose && onClose(), 300); // Wait for fade out animation
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose && onClose(), 300); // Wait for fade out animation
    };

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    text: 'text-green-800',
                    icon: 'text-green-400',
                    closeButton: 'text-green-400 hover:text-green-600'
                };
            case 'error':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    text: 'text-red-800',
                    icon: 'text-red-400',
                    closeButton: 'text-red-400 hover:text-red-600'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    text: 'text-yellow-800',
                    icon: 'text-yellow-400',
                    closeButton: 'text-yellow-400 hover:text-yellow-600'
                };
            default:
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    text: 'text-blue-800',
                    icon: 'text-blue-400',
                    closeButton: 'text-blue-400 hover:text-blue-600'
                };
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const styles = getTypeStyles();

    return (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
            <div className={`max-w-sm w-full ${styles.bg} border ${styles.border} rounded-lg shadow-lg p-4`}>
                <div className="flex items-start">
                    <div className={`flex-shrink-0 ${styles.icon}`}>
                        {getIcon()}
                    </div>
                    <div className="ml-3 flex-1">
                        <p className={`text-sm font-medium ${styles.text}`}>
                            {message}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <button
                            onClick={handleClose}
                            className={`inline-flex ${styles.closeButton} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-500`}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notification; 