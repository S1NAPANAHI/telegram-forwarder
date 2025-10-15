import axios from 'axios';
import Router from 'next/router';
import type { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // send cookies
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// If you decide to also keep an access token in memory (not localStorage), you can attach it here
let inMemoryAccessToken: string | null = null;
export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
  console.log('Access token updated:', token ? `${token.substring(0, 20)}...` : 'cleared');
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (inMemoryAccessToken) {
    config.headers = { 
      ...(config.headers || {}), 
      Authorization: `Bearer ${inMemoryAccessToken}` 
    } as any;
  }
  
  // Log request for debugging
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
    hasAuth: !!inMemoryAccessToken,
    hasCookies: typeof document !== 'undefined' ? document.cookie.includes('refresh_token') : false
  });
  
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<{ resolve: (v?: any) => void; reject: (e: any) => void; config: any }> = [];

function processQueue(error: any, token: string | null = null) {
  pendingQueue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  pendingQueue = [];
}

api.interceptors.response.use(
  (res) => {
    console.log(`API Response: ${res.status} ${res.config.url}`);
    return res;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    
    console.log(`API Error: ${status} ${originalRequest?.url}`, {
      message: error.response?.data?.error || error.message,
      hasRefreshToken: typeof document !== 'undefined' ? document.cookie.includes('refresh_token') : false
    });

    // Only attempt refresh for 401 errors, not on auth endpoints, and not if already retried
    if (status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('/auth/refresh') &&
        !originalRequest.url?.includes('/auth/login') &&
        !originalRequest.url?.includes('/auth/logout')) {
      
      originalRequest._retry = true;

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject, config: originalRequest });
        }).then((token) => {
          if (token) {
            setAccessToken(token as string);
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
          }
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;
      
      try {
        console.log('Attempting token refresh...');
        const { data } = await api.post('/api/auth/refresh');
        
        if (data?.accessToken) {
          console.log('Token refresh successful');
          setAccessToken(data.accessToken);
          processQueue(null, data.accessToken);
          
          // Retry original request with new token
          originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } else {
          throw new Error('No access token in refresh response');
        }
      } catch (refreshError: any) {
        console.log('Token refresh failed:', refreshError.response?.data || refreshError.message);
        processQueue(refreshError, null);
        setAccessToken(null);
        
        // Only redirect to login if we're in the browser and not already on login page
        if (typeof window !== 'undefined' && 
            !window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/auth/')) {
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          Router.replace(`/login?next=${next}`);
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;