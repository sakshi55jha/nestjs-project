// apps/web/lib/api.ts
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api',
});

API.interceptors.request.use((cfg) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && cfg.headers) {
      cfg.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {}
  return cfg;
});

export default API;
