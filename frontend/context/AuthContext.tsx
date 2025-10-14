import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  telegramId?: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  loginWithTelegram: (initData: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isTelegramUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(user && token);
  const isTelegramUser = Boolean(user?.telegramId);

  // Set up axios interceptor for JWT tokens
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && token) {
          // Token expired or invalid, logout user
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('telegram_token');
        if (storedToken) {
          setToken(storedToken);
          await verifyToken(storedToken);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/telegram-webapp/verify`,
        {},
        {
          headers: {
            Authorization: `Bearer ${tokenToVerify}`
          }
        }
      );

      if (response.data.ok && response.data.user) {
        setUser(response.data.user);
        return true;
      } else {
        throw new Error('Invalid token response');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('telegram_token');
      setToken(null);
      setUser(null);
      return false;
    }
  };

  const login = (newToken: string) => {
    localStorage.setItem('telegram_token', newToken);
    setToken(newToken);
    verifyToken(newToken);
  };

  const loginWithTelegram = async (initData: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/telegram-webapp/session`,
        { initData }
      );

      if (response.data.ok && response.data.token) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('telegram_token', newToken);
        setToken(newToken);
        setUser(userData);
        return true;
      } else {
        throw new Error('Invalid Telegram authentication response');
      }
    } catch (error) {
      console.error('Telegram login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        // Call logout endpoint (optional, for logging purposes)
        await axios.post(`${API_BASE_URL}/api/auth/telegram-webapp/logout`);
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem('telegram_token');
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      loginWithTelegram,
      logout,
      loading,
      isAuthenticated,
      isTelegramUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for getting user profile display info
export function useUserProfile() {
  const { user, isTelegramUser } = useAuth();
  
  if (!user) return null;
  
  return {
    displayName: user.fullName || user.username || 'User',
    avatar: user.profilePicture,
    username: user.username,
    email: user.email,
    isTelegramUser,
    telegramId: user.telegramId
  };
}