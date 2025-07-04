import React, { useState, useEffect } from 'react';

function ParticipantSelector({
    participants,
    selectedParticipants,
    onSelectionChange,
    title = "Select participants",
    subtitle = "Choose who will be in this group",
    maxSelections = null,
    showSearch = true
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredParticipants, setFilteredParticipants] = useState(participants);

    // Filter participants based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredParticipants(participants);
        } else {
            const filtered = participants.filter(participant =>
                participant.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredParticipants(filtered);
        }
    }, [searchTerm, participants]);

    const handleParticipantToggle = (participant) => {
        if (selectedParticipants.includes(participant)) {
            // Remove participant
            onSelectionChange(selectedParticipants.filter(p => p !== participant));
        } else {
            // Add participant (check max selections if set)
            if (maxSelections && selectedParticipants.length >= maxSelections) {
                return; // Don't add if at max
            }
            onSelectionChange([...selectedParticipants, participant]);
        }

        // Clear search term when a participant is selected/deselected
        setSearchTerm('');
    };

    const handleSelectAll = () => {
        onSelectionChange(participants);
        setSearchTerm('');
    };

    const handleClearAll = () => {
        onSelectionChange([]);
        setSearchTerm('');
    };

    const isAtMaxSelections = maxSelections && selectedParticipants.length >= maxSelections;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <div>
                    <h4 className="font-medium text-gray-900">{title}</h4>
                    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>
            </div>

            {/* Search Bar */}
            {showSearch && (
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                        placeholder="Search participants..."
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            )}

            {/* Selection Stats */}
            <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                    {selectedParticipants.length} of {participants.length} selected
                    {maxSelections && ` (max ${maxSelections})`}
                </span>
                <div className="flex space-x-2">
                    <button
                        onClick={handleSelectAll}
                        className="text-teal-600 hover:text-teal-700 font-medium"
                        disabled={selectedParticipants.length === participants.length}
                    >
                        Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                        onClick={handleClearAll}
                        className="text-gray-600 hover:text-gray-700 font-medium"
                        disabled={selectedParticipants.length === 0}
                    >
                        Clear All
                    </button>
                </div>
            </div>

            {/* Participants Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {filteredParticipants.length > 0 ? (
                    filteredParticipants.map((participant) => {
                        const isSelected = selectedParticipants.includes(participant);
                        const isDisabled = isAtMaxSelections && !isSelected;

                        return (
                            <button
                                key={participant}
                                type="button"
                                onClick={() => handleParticipantToggle(participant)}
                                disabled={isDisabled}
                                className={`px-4 py-3 rounded-lg border font-medium transition-all duration-200 text-left ${isSelected
                                        ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                                        : isDisabled
                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                            : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50 hover:border-teal-300'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{participant}</span>
                                    {isSelected && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </button>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p>No participants found</p>
                        {searchTerm && (
                            <p className="text-sm">Try adjusting your search terms</p>
                        )}
                    </div>
                )}
            </div>

            {/* Max Selection Warning */}
            {isAtMaxSelections && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-amber-700 text-sm">
                            Maximum of {maxSelections} participants reached. Remove someone to add another.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ParticipantSelector; 