import React, { useState } from 'react';
import ValidationMessage from './ValidationMessage';
import PrimaryButton from './PrimaryButton';
import { auth, users } from '../supabaseClient';

const AuthModal = ({ isOpen, onClose, onAuthSuccess, mode = 'login', onSwitchMode }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const getPasswordStrength = (password) => {
        if (!password) return { score: 0, label: '', color: '' };

        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

        if (score <= 1) return { score, label: 'Very Weak', color: 'text-red-500' };
        if (score <= 2) return { score, label: 'Weak', color: 'text-orange-500' };
        if (score <= 3) return { score, label: 'Fair', color: 'text-yellow-500' };
        if (score <= 4) return { score, label: 'Good', color: 'text-blue-500' };
        return { score, label: 'Strong', color: 'text-green-500' };
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (mode === 'register') {
            // Strong password validation for registration
            const password = formData.password;
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            const isLongEnough = password.length >= 8;

            const errors = [];
            if (!isLongEnough) {
                errors.push('at least 8 characters long');
            }
            if (!hasUpperCase) {
                errors.push('one uppercase letter');
            }
            if (!hasLowerCase) {
                errors.push('one lowercase letter');
            }
            if (!hasNumbers) {
                errors.push('one number');
            }
            if (!hasSpecialChar) {
                errors.push('one special character (!@#$%^&*(),.?":{}|<>)');
            }

            if (errors.length > 0) {
                newErrors.password = `Password must contain: ${errors.join(', ')}`;
            }
        } else if (formData.password.length < 6) {
            // Simpler validation for login
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (mode === 'register' && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            if (mode === 'login') {
                // Sign in with email (using username as email for now)
                const { data, error } = await auth.signIn(formData.username, formData.password);

                if (error) {
                    if (error.message.includes('Invalid login credentials')) {
                        setMessage('Incorrect username or password');
                    } else {
                        setMessage(error.message);
                    }
                } else if (data.user) {
                    // Get user profile
                    const { data: userProfile } = await users.getUserProfile(data.user.id);
                    const user = {
                        id: data.user.id,
                        email: data.user.email,
                        username: userProfile?.username || data.user.user_metadata?.username || data.user.email.split('@')[0]
                    };
                    onAuthSuccess(user);
                    onClose();
                }
            } else {
                // Register new user
                const { data, error } = await auth.signUp(formData.username, formData.password, formData.username);

                if (error) {
                    setMessage(error.message);
                } else if (data.user) {
                    // Create user profile
                    await users.upsertUser(data.user.id, {
                        username: formData.username,
                        email: formData.username // Using username as email
                    });

                    const user = {
                        id: data.user.id,
                        email: data.user.email,
                        username: formData.username
                    };
                    onAuthSuccess(user);
                    onClose();
                }
            }
        } catch (error) {
            setMessage('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = () => {
        setFormData({ username: '', password: '', confirmPassword: '' });
        setErrors({});
        setMessage('');
        // This will be handled by the parent component
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.username ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter your username"
                            autoComplete="username"
                        />
                        {errors.username && <ValidationMessage message={errors.username} />}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter your password"
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        />
                        {mode === 'register' && formData.password && (
                            <div className="mt-1">
                                <div className="flex items-center space-x-2">
                                    <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((level) => {
                                            const strength = getPasswordStrength(formData.password);
                                            const isActive = level <= strength.score;
                                            return (
                                                <div
                                                    key={level}
                                                    className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'
                                                        }`}
                                                />
                                            );
                                        })}
                                    </div>
                                    <span className={`text-xs ${getPasswordStrength(formData.password).color}`}>
                                        {getPasswordStrength(formData.password).label}
                                    </span>
                                </div>
                            </div>
                        )}
                        {errors.password && <ValidationMessage message={errors.password} />}
                    </div>

                    {mode === 'register' && (
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                            />
                            {errors.confirmPassword && <ValidationMessage message={errors.confirmPassword} />}
                        </div>
                    )}

                    {message && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-sm text-red-600">{message}</p>
                        </div>
                    )}

                    <PrimaryButton
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? 'Loading...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                    </PrimaryButton>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => {
                                onSwitchMode(mode === 'login' ? 'register' : 'login');
                            }}
                            className="text-teal-600 hover:text-teal-700 font-medium"
                        >
                            {mode === 'login' ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal; 