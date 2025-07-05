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
        try {
            const { data, error } = await supabase.auth.getUser();

            if (error) {
                console.error('Error getting current user:', error);
                return { data: { user: null }, error };
            }

            if (!data || !data.user) {
                console.log('No user found in session');
                return { data: { user: null }, error: null };
            }

            console.log('Current user retrieved:', data.user.id);
            return { data: { user: data.user }, error: null };
        } catch (error) {
            console.error('Exception getting current user:', error);
            return { data: { user: null }, error };
        }
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
    // Test function to check database structure
    testDatabaseConnection: async () => {
        try {
            console.log('Testing database connection...');

            // Try to select from receipts table
            const { data, error } = await supabase
                .from('receipts')
                .select('id, owner_id, title, total_amount, created_at')
                .limit(1);

            if (error) {
                console.error('Database connection test failed:', error);
                return { success: false, error };
            }

            console.log('Database connection test successful');
            return { success: true, data };
        } catch (error) {
            console.error('Database connection test exception:', error);
            return { success: false, error };
        }
    },

    // Get user's receipts
    getUserReceipts: async (userId) => {
        try {
            console.log('Fetching receipts for user:', userId);

            const { data, error } = await supabase
                .from('receipts')
                .select('*')
                .eq('owner_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching receipts:', error);
                console.error('Error details:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                });
                return { data: [], error };
            }

            console.log('Receipts fetched successfully:', data);
            return { data: data || [], error: null };
        } catch (error) {
            console.error('Exception in getUserReceipts:', error);
            console.error('Exception details:', error.message, error.stack);
            return { data: [], error };
        }
    },

    // Save a receipt
    saveReceipt: async (receiptData, userId) => {
        try {
            console.log('Saving receipt for user:', userId);
            console.log('Receipt data:', receiptData);

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
                console.error('Error checking for existing receipt:', checkError);
                return { error: checkError };
            }

            if (existingReceipts && existingReceipts.length > 0) {
                console.log('Receipt already exists');
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
                console.error('Error saving receipt:', error);
                return { error };
            }

            console.log('Receipt saved successfully:', data);
            return { data };
        } catch (error) {
            console.error('Exception in saveReceipt:', error);
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