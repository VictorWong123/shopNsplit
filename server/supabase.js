const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Database schema setup
const setupDatabase = async () => {
    try {
        // Test the connection by trying to access the users table
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);

        if (error) {
            console.error('Database connection test failed:', error);
            throw new Error('Failed to connect to Supabase database. Please ensure the database schema is set up correctly.');
        }

        console.log('Database connection successful');
        return true;
    } catch (error) {
        console.error('Database setup error:', error);
        throw error;
    }
};

// User operations
const userOperations = {
    async createUser(username, hashedPassword) {
        // Note: This function is for legacy backend compatibility
        // The frontend now uses Supabase Auth directly
        // This function creates a user profile in the users table
        const { data, error } = await supabase
            .from('users')
            .insert([{
                id: require('crypto').randomUUID(), // Generate a UUID for the user
                username,
                email: `${username}@legacy.local` // Placeholder email for legacy users
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async findUserByUsername(username) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
        return data;
    },

    async findUserById(id) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }
};

// Receipt operations
const receiptOperations = {
    async createReceipt(userId, receiptData) {
        const { data: receipt, error } = await supabase
            .from('receipts')
            .insert([{
                owner_id: userId, // Updated to match new schema
                title: receiptData.title || 'Receipt',
                total_amount: receiptData.totalAmount || 0,
                participants: receiptData.participants || [],
                everyone_items: receiptData.items || [], // Updated to match new schema
                split_groups_items: receiptData.splitGroups || null, // Updated to match new schema
                personal_items: null, // New field in schema
                content_hash: null // New field in schema
            }])
            .select()
            .single();

        if (error) throw error;
        return receipt;
    },

    async getReceiptsByUser(userId) {
        const { data, error } = await supabase
            .from('receipts')
            .select('*')
            .eq('owner_id', userId) // Updated to match new schema
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getReceiptById(id) {
        const { data, error } = await supabase
            .from('receipts')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async updateReceipt(id, updates) {
        const { data, error } = await supabase
            .from('receipts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteReceipt(id) {
        const { error } = await supabase
            .from('receipts')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async receiptExists(userId, receiptData) {
        // Compare by user and receipt data (as JSON string)
        const itemsString = JSON.stringify(receiptData.items || []);
        const participantsString = JSON.stringify(receiptData.participants || []);

        const { data: receipts, error } = await supabase
            .from('receipts')
            .select('id, everyone_items, participants, total_amount') // Updated to match new schema
            .eq('owner_id', userId); // Updated to match new schema

        if (error) throw error;
        if (!receipts) return false;

        return receipts.some(r =>
            JSON.stringify(r.everyone_items) === itemsString && // Updated to match new schema
            JSON.stringify(r.participants) === participantsString &&
            r.total_amount === (receiptData.totalAmount || 0)
        );
    }
};

module.exports = {
    supabase,
    setupDatabase,
    userOperations,
    receiptOperations
}; 