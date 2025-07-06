import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import PrimaryButton from './PrimaryButton';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setMessage('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                setMessage('Failed to update password: ' + error.message);
            } else {
                setMessage('Password updated successfully! Redirecting...');
                setTimeout(() => window.location.href = '/', 2000);
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your new password below
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Enter new password"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Confirm new password"
                            required
                        />
                    </div>

                    {message && (
                        <div className={`p-3 rounded-md ${message.includes('successfully')
                            ? 'bg-green-50 border border-green-200 text-green-600'
                            : 'bg-red-50 border border-red-200 text-red-600'
                            }`}>
                            <p className="text-sm">{message}</p>
                        </div>
                    )}

                    <PrimaryButton
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? 'Updating...' : 'Update Password'}
                    </PrimaryButton>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword; 