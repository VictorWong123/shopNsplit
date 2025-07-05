import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    console.log('REACT_APP_SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
    console.log('REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'NOT SET');
    throw new Error('Supabase environment variables are required. Please check your .env file or Vercel environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Helper functions for authentication
export const auth = {
    // Sign up
    signUp: async (email, password, username) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username
                },
                emailRedirectTo: window.location.origin
            }
        });
        return { data, error };
    },

    // Sign in
    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    },

    // Sign out
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    // Get current user
    getCurrentUser: async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        return { user, error };
    },

    // Listen to auth changes
    onAuthStateChange: (callback) => {
        return supabase.auth.onAuthStateChange(callback);
    },

    // Handle email confirmation
    handleEmailConfirmation: async () => {
        const { data, error } = await supabase.auth.getSession();
        return { data, error };
    },

    // Reset password
    resetPassword: async (email) => {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });
        return { data, error };
    }
};

// Helper functions for receipts
export const receipts = {
    // Get user's receipts
    getUserReceipts: async (userId) => {
        try {
            console.log('Fetching receipts for user:', userId);

            const response = await fetch('/api/receipts', {
                method: 'GET',
                credentials: 'include',
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('Error fetching receipts:', result);
                return { data: [], error: result };
            }

            console.log('Receipts fetched successfully:', result);
            return { data: result.receipts || [], error: null };
        } catch (error) {
            console.error('Exception in getUserReceipts:', error);
            return { data: [], error };
        }
    },

    // Save a receipt
    saveReceipt: async (receiptData, userId) => {
        try {
            console.log('Saving receipt for user:', userId);
            console.log('Receipt data:', receiptData);

            // Use the backend API instead of direct Supabase access
            const response = await fetch('/api/receipts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    title: receiptData.name || 'Receipt',
                    totalAmount: receiptData.totals?.grandTotal || 0,
                    items: receiptData.everyoneItems || [],
                    participants: receiptData.names || [],
                    splitGroups: receiptData.splitGroupsItems || []
                })
            });

            const result = await response.json();

            if (!response.ok) {
                console.error('Error saving receipt:', result);
                return { error: result };
            }

            if (result.message === 'Already saved') {
                console.log('Receipt already exists');
                return { data: null, message: 'Already saved' };
            }

            console.log('Receipt saved successfully:', result);
            return { data: result.receipt };
        } catch (error) {
            console.error('Exception in saveReceipt:', error);
            return { error };
        }
    },

    // Get a specific receipt
    getReceipt: async (receiptId) => {
        try {
            const response = await fetch(`/api/receipts/shared/${receiptId}`, {
                method: 'GET',
                credentials: 'include',
            });

            const result = await response.json();

            if (!response.ok) {
                return { data: null, error: result };
            }

            return { data: result.receipt, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Delete a receipt
    deleteReceipt: async (receiptId, userId) => {
        try {
            const response = await fetch(`/api/receipts/${receiptId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            const result = await response.json();

            if (!response.ok) {
                return { data: null, error: result };
            }

            return { data: result, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Update receipt title
    updateReceiptName: async (receiptId, title, userId) => {
        try {
            const response = await fetch(`/api/receipts/${receiptId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ title })
            });

            const result = await response.json();

            if (!response.ok) {
                return { data: null, error: result };
            }

            return { data: result.receipt, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }
};

// Helper functions for users
export const users = {
    // Create or update user profile
    upsertUser: async (userId, userData) => {
        try {
            console.log('Upserting user profile:', userId, userData);

            const { data, error } = await supabase
                .from('users')
                .upsert([
                    {
                        id: userId,
                        username: userData.username,
                        email: userData.email
                    }
                ])
                .select()
                .single();

            if (error) {
                console.error('Error upserting user:', error);
                return { data: null, error };
            }

            console.log('User profile upserted successfully:', data);
            return { data, error: null };
        } catch (error) {
            console.error('Exception in upsertUser:', error);
            return { data: null, error };
        }
    },

    // Get user profile
    getUserProfile: async (userId) => {
        try {
            console.log('Fetching user profile:', userId);

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching user profile:', error);
                return { data: null, error };
            }

            console.log('User profile fetched successfully:', data);
            return { data, error: null };
        } catch (error) {
            console.error('Exception in getUserProfile:', error);
            return { data: null, error };
        }
    }
}; 