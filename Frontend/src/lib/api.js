import axios from 'axios';

const api = axios.create({
  // VITE_ prefix is required for Vite environment variables
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  withCredentials: true,
});

export default api;