import React, { useState } from 'react';
import PageHeader from './PageHeader';
import SummaryCard from './SummaryCard';
import PrimaryButton from './PrimaryButton';

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
        if (!numPeople || parseInt(numPeople) < 2) return false;
        if (names.length === 0) return false;
        if (names.some(name => name.trim() === '')) return false;
        if (names.filter((name, index) => names.indexOf(name) !== index && name.trim() !== '').length > 0) return false;
        return true;
    };

    const nextIcon = (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
    );

    const setupIcon = (
        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <PageHeader
                title="Setup Your Split"
                description="Enter the number of people and their names to get started"
                showBack={false}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    <SummaryCard title="Setup Details" icon={setupIcon}>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Number of People */}
                            <div>
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-3 h-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Number of People</h3>
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
                            {names.length > 0 && (
                                <div>
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-3 h-3 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Names</h3>
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
                                <PrimaryButton
                                    type="submit"
                                    disabled={!canProceed()}
                                    size="lg"
                                    className="w-full"
                                    showIcon={canProceed()}
                                    icon={canProceed() ? nextIcon : null}
                                >
                                    {canProceed() ? 'Continue to Items' : 'Fill in all details to continue'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </SummaryCard>
                </div>

                {/* Help Text */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Tips</h3>
                            </div>
                            <div className="space-y-3 text-sm text-gray-600">
                                <p>• Enter at least 2 people to split groceries</p>
                                <p>• Each person needs a unique name</p>
                                <p>• You can modify these details later</p>
                                <p>• Maximum of 20 people supported</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SetupPage; 