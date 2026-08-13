// Central API URL — reads from environment variable in production, falls back to localhost in development
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default API;
