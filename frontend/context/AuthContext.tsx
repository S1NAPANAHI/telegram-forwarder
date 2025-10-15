import React, { createContext, useContext, useEffect, useState } from 'react';
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

  const fetchMe = async () => {
    const res = await api.get('/api/auth/me');
    setUser(res.data);
  };

  const tryRefresh = async () => {
    const res = await api.post('/api/auth/refresh');
    if (res.data?.accessToken) setAccessToken(res.data.accessToken);
  };

  const refresh = async () => {
    try {
      await fetchMe();
    } catch (e: any) {
      if (e?.response?.status === 401) {
        try {
          await tryRefresh();
          await fetchMe();
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    try { await api.post('/api/auth/logout'); } catch {}
    setAccessToken(null);
    setUser(null);
  };

  const loginWithEmail = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login-cookie', { email, password });
    if (res.data?.accessToken) setAccessToken(res.data.accessToken);
    await refresh();
  };

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout, loginWithEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
