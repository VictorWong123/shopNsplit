import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthCallback = () => {
    const [message, setMessage] = useState('Processing...');

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Auth callback error:', error);
                    setMessage('Authentication failed. Please try again.');
                    setTimeout(() => window.location.href = '/', 3000);
                    return;
                }

                if (data.session) {
                    setMessage('Email confirmed successfully! Redirecting...');
                    setTimeout(() => window.location.href = '/', 2000);
                } else {
                    setMessage('No session found. Please try signing in again.');
                    setTimeout(() => window.location.href = '/', 3000);
                }
            } catch (error) {
                console.error('Auth callback exception:', error);
                setMessage('An error occurred. Please try again.');
                setTimeout(() => window.location.href = '/', 3000);
            }
        };

        handleAuthCallback();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Authentication
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthCallback; 