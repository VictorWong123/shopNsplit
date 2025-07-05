import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

const supabaseUrl = SUPABASE_URL;
const supabaseAnonKey = SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    console.log('SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
    console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'NOT SET');
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
                }
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
    }
};

// Helper functions for receipts
export const receipts = {
    // Get user's receipts
    getUserReceipts: async (userId) => {
        const { data, error } = await supabase
            .from('receipts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        return { data, error };
    },

    // Save a receipt
    saveReceipt: async (receiptData, userId) => {
        // Check for duplicates first
        const existingReceipt = await supabase
            .from('receipts')
            .select('id')
            .eq('user_id', userId)
            .eq('data', JSON.stringify(receiptData))
            .single();

        if (existingReceipt.data) {
            return { data: existingReceipt.data, message: 'Already saved' };
        }

        const { data, error } = await supabase
            .from('receipts')
            .insert([
                {
                    user_id: userId,
                    data: receiptData,
                    name: receiptData.name || new Date().toLocaleString()
                }
            ])
            .select()
            .single();

        return { data, error };
    },

    // Get a specific receipt
    getReceipt: async (receiptId) => {
        const { data, error } = await supabase
            .from('receipts')
            .select('*')
            .eq('id', receiptId)
            .single();
        return { data, error };
    },

    // Delete a receipt
    deleteReceipt: async (receiptId, userId) => {
        const { data, error } = await supabase
            .from('receipts')
            .delete()
            .eq('id', receiptId)
            .eq('user_id', userId);
        return { data, error };
    },

    // Update receipt name
    updateReceiptName: async (receiptId, name, userId) => {
        const { data, error } = await supabase
            .from('receipts')
            .update({ name })
            .eq('id', receiptId)
            .eq('user_id', userId)
            .select()
            .single();
        return { data, error };
    }
};

// Helper functions for users
export const users = {
    // Create or update user profile
    upsertUser: async (userId, userData) => {
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
        return { data, error };
    },

    // Get user profile
    getUserProfile: async (userId) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        return { data, error };
    }
}; 