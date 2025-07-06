import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;



if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    console.error('REACT_APP_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.error('REACT_APP_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
    throw new Error('Supabase environment variables are required. Please check your .env file or Vercel environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'shopnsplit-auth-token'
    }
});

// Helper functions for authentication
export const auth = {
    // Sign up
    signUp: async (email, password, username) => {
        // Determine the correct redirect URL based on environment
        const redirectUrl = process.env.NODE_ENV === 'production'
            ? 'https://shop-nsplit.vercel.app/auth/callback'  // Vercel production URL
            : 'http://localhost:3000/auth/callback';           // Local development

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username
                },
                emailRedirectTo: redirectUrl,
                emailConfirm: true  // Enable email confirmation
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
        try {
            const { data, error } = await supabase.auth.getUser();

            if (error) {
                return { data: { user: null }, error };
            }

            if (!data || !data.user) {
                return { data: { user: null }, error: null };
            }

            return { data: { user: data.user }, error: null };
        } catch (error) {
            return { data: { user: null }, error };
        }
    },

    // Listen to auth changes
    onAuthStateChange: (callback) => {
        return supabase.auth.onAuthStateChange(callback);
    },

    // Reset password
    resetPassword: async (email) => {
        // Determine the correct redirect URL based on environment
        const redirectUrl = process.env.NODE_ENV === 'production'
            ? 'https://shop-nsplit.vercel.app/auth/reset-password'  // Vercel production URL
            : 'http://localhost:3000/auth/reset-password';           // Local development

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl
        });
        return { data, error };
    },

    // Update email
    updateEmail: async (newEmail) => {
        const { data, error } = await supabase.auth.updateUser({
            email: newEmail
        });
        return { data, error };
    },

    // Update password
    updatePassword: async (currentPassword, newPassword) => {
        // First, re-authenticate with current password
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: (await supabase.auth.getUser()).data.user.email,
            password: currentPassword
        });

        if (authError) {
            return { error: authError };
        }

        // Then update the password
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });
        return { data, error };
    },

    // Delete account
    deleteAccount: async (password) => {
        try {
            // First, re-authenticate with password
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: (await supabase.auth.getUser()).data.user.email,
                password: password
            });

            if (authError) {
                return { error: authError };
            }

            // Get the current user
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                return { error: { message: 'No active session found' } };
            }

            const userId = user.id;

            // Delete user data from all tables
            // Delete receipts first
            const { error: receiptsError } = await supabase
                .from('receipts')
                .delete()
                .eq('owner_id', userId);

            if (receiptsError) {
                return { error: { message: 'Failed to delete receipts' } };
            }

            // Delete user profile
            const { error: profileError } = await supabase
                .from('users')
                .delete()
                .eq('id', userId);

            if (profileError) {
                return { error: { message: 'Failed to delete user profile' } };
            }

            // Sign out the user
            await supabase.auth.signOut();

            return { data: { message: 'Account data deleted successfully' }, error: null };
        } catch (error) {
            return { error: { message: 'Failed to delete account. Please try again.' } };
        }
    }
};

// Helper functions for receipts
export const receipts = {
    // Test function to check database structure
    testDatabaseConnection: async () => {
        try {
            // Try to select from receipts table
            const { data, error } = await supabase
                .from('receipts')
                .select('id, owner_id, title, total_amount, created_at')
                .limit(1);

            if (error) {
                return { success: false, error };
            }

            return { success: true, data };
        } catch (error) {
            return { success: false, error };
        }
    },

    // Get user's receipts
    getUserReceipts: async (userId) => {
        try {
            const { data, error } = await supabase
                .from('receipts')
                .select('*')
                .eq('owner_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                return { data: [], error };
            }

            return { data: data || [], error: null };
        } catch (error) {
            return { data: [], error };
        }
    },

    // Save a receipt
    saveReceipt: async (receiptData, userId) => {
        try {
            // Check if receipt already exists (based on content hash)
            const contentHash = JSON.stringify({
                names: receiptData.names,
                everyoneItems: receiptData.everyoneItems,
                splitGroupsItems: receiptData.splitGroupsItems,
                personalItems: receiptData.personalItems,
                totals: receiptData.totals
            });

            // Check for existing receipt with same content
            const { data: existingReceipts, error: checkError } = await supabase
                .from('receipts')
                .select('id')
                .eq('owner_id', userId)
                .eq('content_hash', contentHash)
                .limit(1);

            if (checkError) {
                return { error: checkError };
            }

            if (existingReceipts && existingReceipts.length > 0) {
                return { data: null, message: 'Already saved' };
            }

            // Insert new receipt
            const { data, error } = await supabase
                .from('receipts')
                .insert([
                    {
                        owner_id: userId,
                        title: receiptData.name || 'Receipt',
                        total_amount: receiptData.totals?.grandTotal || 0,
                        participants: receiptData.names || [],
                        everyone_items: receiptData.everyoneItems || [],
                        split_groups_items: receiptData.splitGroupsItems || [],
                        personal_items: receiptData.personalItems || [],
                        content_hash: contentHash,
                        created_at: new Date().toISOString()
                    }
                ])
                .select()
                .single();

            if (error) {
                return { error };
            }

            return { data };
        } catch (error) {
            return { error };
        }
    },

    // Get a specific receipt
    getReceipt: async (receiptId) => {
        try {
            const { data, error } = await supabase
                .from('receipts')
                .select('*')
                .eq('id', receiptId)
                .single();

            if (error) {
                return { data: null, error };
            }

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Delete a receipt
    deleteReceipt: async (receiptId, userId) => {
        try {
            const { data, error } = await supabase
                .from('receipts')
                .delete()
                .eq('id', receiptId)
                .eq('owner_id', userId)
                .select()
                .single();

            if (error) {
                return { data: null, error };
            }

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Update receipt title
    updateReceiptName: async (receiptId, title, userId) => {
        try {
            const { data, error } = await supabase
                .from('receipts')
                .update({ title })
                .eq('id', receiptId)
                .eq('owner_id', userId)
                .select()
                .single();

            if (error) {
                return { data: null, error };
            }

            return { data, error: null };
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
                return { data: null, error };
            }

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Get user profile
    getUserProfile: async (userId) => {
        try {
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Profile fetch timeout')), 5000);
            });

            const fetchPromise = supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

            if (error) {
                return { data: null, error };
            }

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }
}; 