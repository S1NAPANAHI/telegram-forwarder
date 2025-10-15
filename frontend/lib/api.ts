import axios from 'axios';
import Router from 'next/router';
import type { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // send cookies
});

// If you decide to also keep an access token in memory (not localStorage), you can attach it here
let inMemoryAccessToken: string | null = null;
export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (inMemoryAccessToken) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${inMemoryAccessToken}` } as any;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<{ resolve: (v?: any) => void; reject: (e: any) => void; config: any }> = [];

function processQueue(error: any, token: string | null = null) {
  pendingQueue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  pendingQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject, config: originalRequest });
        }).then((token) => {
          if (token) setAccessToken(token as string);
          if (token) originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;
      try {
        const { data } = await api.post('/api/auth/refresh');
        if (data?.accessToken) {
          setAccessToken(data.accessToken);
          processQueue(null, data.accessToken);
          originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch (e) {
        processQueue(e, null);
        setAccessToken(null);
        if (typeof window !== 'undefined') {
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          Router.replace(`/login?next=${next}`);
        }
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
