// API configuration for different environments
const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://shopnsplit-backend.vercel.app'  // Your backend URL (you'll get this after deploying)
    : 'http://localhost:5001';

export default API_BASE_URL; 