import React from 'react';

function ParticipantsCard({ participants, title = "Participants", className = '' }) {
    return (
        <div className={`mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
            <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
                {participants.map((participant, index) => (
                    <div key={index} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
                        {participant}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ParticipantsCard; 