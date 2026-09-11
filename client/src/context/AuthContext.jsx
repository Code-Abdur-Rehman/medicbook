import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('medibook_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('medibook_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('medibook_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('medibook_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session check error:', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('medibook_token', newToken);
        localStorage.setItem('medibook_user', JSON.stringify(newUser));
        return { success: true, user: newUser };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.',
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('medibook_token', newToken);
        localStorage.setItem('medibook_user', JSON.stringify(newUser));
        return { success: true, user: newUser };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.',
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('medibook_token');
    localStorage.removeItem('medibook_user');
  };

  const demoLogin = async (role) => {
    const credentials = {
      super_admin: { email: 'admin@medibook.com', password: 'Admin@123' },
      hospital_admin: { email: 'admin.citygen@medibook.com', password: 'Hospital@123' },
      doctor: { email: 'dr.ahmed@medibook.com', password: 'Doctor@123' },
      patient: { email: 'patient.hamza@medibook.com', password: 'Patient@123' },
    };

    const creds = credentials[role];
    if (!creds) return { success: false, message: 'Invalid demo role' };
    return await login(creds.email, creds.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        demoLogin,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
