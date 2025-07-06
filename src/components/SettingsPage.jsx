import React, { useState } from 'react';
import { auth, users } from '../supabaseClient';

const SettingsPage = ({ user, onBack, onUserUpdate, onLogout }) => {
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const updateUsername = async () => {
        if (!formData.username.trim()) {
            setMessage({ text: 'Username cannot be empty', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await users.upsertUser(user.id, {
                username: formData.username.trim(),
                email: user.email
            });

            if (error) {
                setMessage({ text: `Failed to update username: ${error.message}`, type: 'error' });
            } else {
                setMessage({ text: 'Username updated successfully!', type: 'success' });
                onUserUpdate({ ...user, username: formData.username.trim() });
            }
        } catch (error) {
            setMessage({ text: 'An unexpected error occurred', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const updateEmail = async () => {
        if (!formData.email.trim() || !formData.email.includes('@')) {
            setMessage({ text: 'Please enter a valid email address', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const { error } = await auth.updateEmail(formData.email.trim());

            if (error) {
                setMessage({ text: `Failed to update email: ${error.message}`, type: 'error' });
            } else {
                setMessage({ text: 'Email update initiated. Please check your email to confirm the change.', type: 'success' });
                // Update local user state
                onUserUpdate({ ...user, email: formData.email.trim() });
            }
        } catch (error) {
            setMessage({ text: 'An unexpected error occurred', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async () => {
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            setMessage({ text: 'Please fill in all password fields', type: 'error' });
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ text: 'New passwords do not match', type: 'error' });
            return;
        }

        if (formData.newPassword.length < 6) {
            setMessage({ text: 'New password must be at least 6 characters long', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const { error } = await auth.updatePassword(formData.currentPassword, formData.newPassword);

            if (error) {
                setMessage({ text: `Failed to update password: ${error.message}`, type: 'error' });
            } else {
                setMessage({ text: 'Password updated successfully!', type: 'success' });
                // Clear password fields
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
            }
        } catch (error) {
            setMessage({ text: 'An unexpected error occurred', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const deleteAccount = async () => {
        if (!deletePassword) {
            setMessage({ text: 'Please enter your password to confirm account deletion', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const { error } = await auth.deleteAccount(deletePassword);

            if (error) {
                setMessage({ text: `Failed to delete account: ${error.message}`, type: 'error' });
            } else {
                setMessage({ text: 'Account deleted successfully. You will be signed out.', type: 'success' });
                setTimeout(() => {
                    onLogout();
                }, 2000);
            }
        } catch (error) {
            setMessage({ text: 'An unexpected error occurred', type: 'error' });
        } finally {
            setLoading(false);
            setShowDeleteConfirmation(false);
            setDeletePassword('');
        }
    };

    const clearMessage = () => {
        setMessage({ text: '', type: '' });
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                        <button
                            onClick={onBack}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`px-6 py-3 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <div className="flex items-center justify-between">
                            <span>{message.text}</span>
                            <button onClick={clearMessage} className="text-gray-500 hover:text-gray-700">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                <div className="p-6 space-y-8">
                    {/* Username Section */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Display Name</h2>
                        <div className="flex space-x-3">
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="Enter your display name"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            <button
                                onClick={updateUsername}
                                disabled={loading}
                                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </div>

                    {/* Email Section */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Address</h2>
                        <div className="flex space-x-3">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email address"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            <button
                                onClick={updateEmail}
                                disabled={loading}
                                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </div>

                    {/* Password Section */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
                        <div className="space-y-3">
                            <input
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                placeholder="Current password"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                placeholder="New password"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm new password"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            />
                            <button
                                onClick={updatePassword}
                                disabled={loading}
                                className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border-t border-gray-200 pt-8">
                        <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <h3 className="text-md font-medium text-red-800 mb-2">Delete Account</h3>
                            <p className="text-red-700 text-sm mb-4">
                                This action cannot be undone. This will permanently delete your account and all associated data.
                            </p>
                            <button
                                onClick={() => setShowDeleteConfirmation(true)}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-red-600 mb-4">Confirm Account Deletion</h3>
                        <p className="text-gray-600 mb-4">
                            This action cannot be undone. Please enter your password to confirm.
                        </p>
                        <input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                        />
                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirmation(false);
                                    setDeletePassword('');
                                }}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteAccount}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage; 