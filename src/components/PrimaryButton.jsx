import React from 'react';

function PrimaryButton({
    children,
    onClick,
    disabled = false,
    type = 'button',
    variant = 'primary',
    size = 'md',
    className = '',
    title = '',
    showIcon = false,
    icon = null
}) {
    const baseClasses = 'font-semibold rounded-lg focus:ring-2 focus:ring-offset-2 transition-all duration-200';

    const variants = {
        primary: disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-teal-500 to-green-500 text-white hover:from-teal-600 hover:to-green-600 focus:ring-teal-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
        secondary: disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gray-300 text-gray-800 hover:bg-gray-400 focus:ring-gray-400',
        danger: disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3',
        lg: 'px-6 py-4 text-lg'
    };

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={classes}
            title={title}
        >
            {showIcon && icon ? (
                <div className="flex items-center justify-center space-x-2">
                    <span>{children}</span>
                    {icon}
                </div>
            ) : (
                children
            )}
        </button>
    );
}

export default PrimaryButton; 