import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  email: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Optionally, verify token with backend or decode it to get user info
      // For now, we'll assume a valid token means a logged-in user
      // A more robust solution would fetch user details from /api/auth
      axios.get('/api/auth', {
        headers: { 'x-auth-token': storedToken }
      })
      .then(res => {
        setUser(res.data);
        axios.defaults.headers.common['x-auth-token'] = storedToken;
      })
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    axios.defaults.headers.common['x-auth-token'] = newToken;
    // Fetch user details after login
    axios.get('/api/auth', {
      headers: { 'x-auth-token': newToken }
    })
    .then(res => setUser(res.data))
    .catch(err => console.error('Failed to fetch user after login', err));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['x-auth-token'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
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