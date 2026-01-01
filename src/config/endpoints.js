// Base API URL - update the port if your backend runs on a different port
const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://itbackend-p8k1.onrender.com/api');

export { API_URL };
