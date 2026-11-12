import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lifeos_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('lifeos_token'));
  const [loading, setLoading] = useState(true);

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem('lifeos_token');
    localStorage.removeItem('lifeos_user');
    setToken(null);
    setUser(null);
  }, []);

  // Check auth validity on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('lifeos_token');
      if (storedToken) {
        try {
          const data = await authService.getMe();
          setUser(data.user);
          localStorage.setItem('lifeos_user', JSON.stringify(data.user));
        } catch (error) {
          console.warn('Session expired or invalid, logging out...');
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for 401 events dispatched from axios interceptor
    const handleAuthExpired = () => {
      logout();
    };
    window.addEventListener('lifeos_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('lifeos_auth_expired', handleAuthExpired);
  }, [logout]);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    localStorage.setItem('lifeos_token', data.token);
    localStorage.setItem('lifeos_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authService.register({ name, email, password });
    localStorage.setItem('lifeos_token', data.token);
    localStorage.setItem('lifeos_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('lifeos_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
