import React, { useState } from 'react';
import ValidationMessage from './ValidationMessage';
import PrimaryButton from './PrimaryButton';
import { auth, users, supabase } from '../supabaseClient';

const AuthModal = ({ isOpen, onClose, onAuthSuccess, mode = 'login', onSwitchMode }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isForgotPassword, setIsForgotPassword] = useState(false);
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

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (isForgotPassword) {
            // Only validate email for forgot password
        } else if (!formData.password) {
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
            if (isForgotPassword) {
                // Determine the correct redirect URL based on environment
                const redirectUrl = process.env.NODE_ENV === 'production'
                    ? 'https://shop-nsplit.vercel.app/auth/reset-password'  // Vercel production URL
                    : `${window.location.origin}/auth/reset-password`;       // Local development

                const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
                    redirectTo: redirectUrl
                });
                if (error) {
                    setMessage(error.message);
                } else {
                    setMessage('Password reset link sent! Please check your email.');
                }
            } else if (mode === 'login') {
                // Sign in with email
                const { data, error } = await auth.signIn(formData.email, formData.password);

                if (error) {
                    if (error.message.includes('Invalid login credentials')) {
                        setMessage('Incorrect email or password');
                    } else {
                        setMessage(error.message);
                    }
                } else if (data.user) {
                    // Get user profile
                    const { data: userProfile } = await users.getUserProfile(data.user.id);
                    const user = {
                        id: data.user.id,
                        email: data.user.email,
                        username: userProfile?.username || data.user.email.split('@')[0]
                    };
                    onAuthSuccess(user);
                    onClose();
                }
            } else if (mode === 'register') {
                // Register new user
                const { data, error } = await auth.signUp(formData.email, formData.password, formData.email.split('@')[0]);

                if (error) {
                    // Provide more specific error messages
                    if (error.message.includes('User already registered') || error.message.includes('already been registered')) {
                        setMessage('Account already exists. Please sign in instead.');
                    } else if (error.message.includes('Password')) {
                        setMessage('Password error: ' + error.message);
                    } else if (error.message.includes('Email')) {
                        setMessage('Email error: ' + error.message);
                    } else {
                        setMessage('Registration failed: ' + error.message);
                    }
                } else if (data.user) {
                    // The user profile is automatically created by the database trigger
                    // We don't need to manually upsert it

                    // Auto-login the user after successful registration
                    const user = {
                        id: data.user.id,
                        email: data.user.email,
                        username: formData.email.split('@')[0]
                    };

                    // Ensure user profile exists in the users table
                    try {
                        const { error: profileError } = await users.upsertUser(data.user.id, {
                            username: formData.email.split('@')[0],
                            email: data.user.email
                        });

                        if (profileError) {
                            console.error('Profile creation error:', profileError);
                            // Don't fail registration, but log the error
                        }
                    } catch (profileError) {
                        // Silently handle profile creation errors
                    }

                    onAuthSuccess(user);
                    onClose();
                } else {
                    setMessage('Registration failed: No user data returned');
                }
            } else {
                // This should never happen, but just in case
                setMessage('Invalid form mode');
            }
        } catch (error) {
            setMessage('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Note: switchMode is handled by the parent component via onSwitchMode prop

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isForgotPassword ? 'Reset Password' : (mode === 'login' ? 'Sign In' : 'Create Account')}
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
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter your email"
                            autoComplete="email"
                        />
                        {errors.email && <ValidationMessage message={errors.email} />}
                    </div>

                    {!isForgotPassword && (
                        <>
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
                        </>
                    )}

                    {!isForgotPassword && mode === 'register' && formData.password && (
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

                    {mode === 'login' && !isForgotPassword && (
                        <div className="text-right">
                            <button
                                type="button"
                                onClick={() => setIsForgotPassword(true)}
                                className="text-sm text-teal-600 hover:text-teal-700"
                            >
                                Forgot password?
                            </button>
                        </div>
                    )}

                    {isForgotPassword && (
                        <div className="text-left">
                            <button
                                type="button"
                                onClick={() => setIsForgotPassword(false)}
                                className="text-sm text-teal-600 hover:text-teal-700"
                            >
                                ← Back to sign in
                            </button>
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
                        {isLoading ? 'Loading...' : (isForgotPassword ? 'Send Reset Link' : (mode === 'login' ? 'Sign In' : 'Create Account'))}
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