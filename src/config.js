// API configuration for different environments
const API_BASE_URL = process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'production'
        ? 'https://shopnsplit.onrender.com'  // Render.com backend URL
        : 'http://localhost:5001');

export default API_BASE_URL; 