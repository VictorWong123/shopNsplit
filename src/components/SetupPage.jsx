import React, { useState, useEffect } from 'react';

function SetupPage({ numPeople, setNumPeople, names, setNames, onNext }) {
    const [errors, setErrors] = useState({});

    const handleNumPeopleChange = (e) => {
        const value = e.target.value;
        setNumPeople(value);

        // Clear names if reducing number of people
        if (value < names.length) {
            setNames(names.slice(0, parseInt(value) || 0));
        }

        // Add empty names if increasing number of people
        if (value > names.length) {
            const newNames = [...names];
            for (let i = names.length; i < parseInt(value); i++) {
                newNames.push('');
            }
            setNames(newNames);
        }
    };

    const handleNameChange = (index, value) => {
        const newNames = [...names];
        newNames[index] = value;
        setNames(newNames);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!numPeople || parseInt(numPeople) < 2) {
            newErrors.numPeople = 'Please enter at least 2 people';
        }

        if (names.length > 0) {
            const emptyNames = names.filter(name => name.trim() === '');
            if (emptyNames.length > 0) {
                newErrors.names = 'Please fill in all names';
            }

            const duplicateNames = names.filter((name, index) =>
                names.indexOf(name) !== index && name.trim() !== ''
            );
            if (duplicateNames.length > 0) {
                newErrors.names = 'Names must be unique';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onNext();
        }
    };

    const canProceed = () => {
        return numPeople && parseInt(numPeople) >= 2 &&
            names.length === parseInt(numPeople) &&
            names.every(name => name.trim() !== '') &&
            names.length === new Set(names.map(n => n.trim())).size;
    };

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Let's get started
                </h1>
                <p className="text-lg text-gray-600">
                    Set up your grocery splitting session
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Number of People Section */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <label htmlFor="numPeople" className="block text-sm font-semibold text-gray-900">
                                        How many people are splitting?
                                    </label>
                                    <p className="text-sm text-gray-500">Enter the number of participants</p>
                                </div>
                            </div>

                            <div className="ml-13">
                                <input
                                    type="number"
                                    id="numPeople"
                                    min="2"
                                    max="20"
                                    value={numPeople}
                                    onChange={handleNumPeopleChange}
                                    className={`w-32 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${errors.numPeople ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                    placeholder="2"
                                />
                                {errors.numPeople && (
                                    <p className="mt-2 text-sm text-red-600">{errors.numPeople}</p>
                                )}
                            </div>
                        </div>

                        {/* Names Section */}
                        {numPeople && parseInt(numPeople) >= 2 && (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            Enter everyone's names
                                        </h3>
                                        <p className="text-sm text-gray-500">Each person will be able to split items</p>
                                    </div>
                                </div>

                                <div className="ml-13 space-y-3">
                                    {names.map((name, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                                                {index + 1}
                                            </div>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => handleNameChange(index, e.target.value)}
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                                                placeholder={`Person ${index + 1}`}
                                            />
                                        </div>
                                    ))}
                                    {errors.names && (
                                        <p className="text-sm text-red-600">{errors.names}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Action Button */}
                        <div className="pt-6 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={!canProceed()}
                                className={`w-full px-6 py-4 font-semibold text-white rounded-lg focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${canProceed()
                                        ? 'bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 focus:ring-teal-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {canProceed() ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <span>Continue to Items</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </div>
                                ) : (
                                    'Fill in all details to continue'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                    You can always go back and modify these details later
                </p>
            </div>
        </div>
    );
}

export default SetupPage; 