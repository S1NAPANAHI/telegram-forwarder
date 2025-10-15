import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import api, { setAccessToken } from '../lib/api';

interface User {
  id: string;
  email?: string | null;
  username?: string | null;
  telegramId?: string | null;
  role?: string;
  language?: 'fa' | 'en';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
  loginWithEmail: async () => {}
});

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchMe = async () => {
    console.log('AuthContext: Fetching /api/auth/me...');
    const res = await api.get('/api/auth/me');
    console.log('AuthContext: /me success:', res.data);
    if (mountedRef.current) {
      setUser(res.data);
    }
  };

  const refresh = async () => {
    if (!mountedRef.current) return;

    setLoading(true);
    try {
      await fetchMe();
    } catch (e: any) {
      console.log('AuthContext: /me failed, user will be logged out:', e?.response?.data?.error || e.message);
      if (mountedRef.current) {
        setUser(null);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    console.log('AuthContext: Initial refresh on mount');
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    try { 
      await api.post('/api/auth/logout'); 
      console.log('AuthContext: Logout successful');
    } catch (e) {
      console.log('AuthContext: Logout error (ignoring):', e);
    }
    setAccessToken(null);
    if (mountedRef.current) {
      setUser(null);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    console.log('AuthContext: Login attempt for:', email);
    const res = await api.post('/api/auth/login-cookie', { email, password });
    console.log('AuthContext: Login response:', res.data);
    
    if (res.data?.accessToken) {
      console.log('AuthContext: Setting access token from login');
      setAccessToken(res.data.accessToken);
    }
    
    if (mountedRef.current) {
      console.log('AuthContext: Calling refresh after login...');
      setLoading(true);
      await refresh();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout, loginWithEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);