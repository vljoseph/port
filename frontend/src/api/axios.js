import axios from 'axios';

const api = axios.create({
  // Use the environment variable if it exists (for Production on Vercel)
  // Otherwise, fallback to the local development server
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Optionally, you can add interceptors here to automatically include the admin token in requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
