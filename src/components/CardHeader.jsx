import React from 'react';

function CardHeader({ icon, title, subtitle, action = null, className = '' }) {
    return (
        <div className={`px-6 py-6 border-b border-gray-100 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    {icon && (
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                    </div>
                </div>
                {action && (
                    <div>
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CardHeader; 