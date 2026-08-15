// Central API URL — reads from environment variable in production, falls back to Hostinger Backend URL
const API = import.meta.env.VITE_API_URL || 'https://khaki-swan-309051.hostingersite.com/api';

export default API;
