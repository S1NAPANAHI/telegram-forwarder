// Centralized API client for frontend
import axios from 'axios';
import Router from 'next/router';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: false,
});

// Attach token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRedirecting = false;
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && typeof window !== 'undefined' && !isRedirecting) {
      isRedirecting = true;
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      localStorage.removeItem('token');
      Router.replace(`/login?next=${next}`);
    }
    return Promise.reject(error);
  }
);

export default api;
