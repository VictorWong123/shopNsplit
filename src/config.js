// Supabase configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// API configuration for different environments
const API_BASE_URL = process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'production'
        ? 'https://shop-nsplit.vercel.app'  // Vercel frontend URL
        : 'http://localhost:3000');

export { SUPABASE_URL, SUPABASE_ANON_KEY };
export default API_BASE_URL; 