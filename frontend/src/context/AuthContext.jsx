import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('fossclat_token');
    if (token) {
      authAPI.getMe()
        .then(data => {
          if (data && data.success) {
            setUser(data.data);
          } else {
            localStorage.removeItem('fossclat_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('fossclat_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password });
    if (data && data.success) {
      localStorage.setItem('fossclat_token', data.data.token);
      setUser(data.data.user);
      return { success: true };
    }
    return { success: false, message: data?.message || 'Login failed' };
  };

  const register = async (full_name, email, password, age) => {
    const data = await authAPI.register({ full_name, email, password, age });
    if (data && data.success) {
      localStorage.setItem('fossclat_token', data.data.token);
      setUser(data.data.user);
      return { success: true };
    }
    return { success: false, message: data?.message || 'Registration failed' };
  };

  const logout = () => {
    localStorage.removeItem('fossclat_token');
    localStorage.removeItem('fosselat_placement_v2');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
