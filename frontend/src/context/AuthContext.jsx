import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [manufacturerDetails, setManufacturerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Apply theme class/attribute on load and theme change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Verify token on initial app boot
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
        if (response.data.manufacturerDetails) {
          setManufacturerDetails(response.data.manufacturerDetails);
        }
      } catch (error) {
        console.error('Session restoration failed:', error.response?.data?.message || error.message);
        // Token was invalid or expired, clear local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        setManufacturerDetails(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Login handler
  const login = async (loginIdentifier, password) => {
    try {
      const response = await api.post('/auth/login', { loginIdentifier, password });
      const { token, user: userData, manufacturerDetails: mDetails } = response.data;

      localStorage.setItem('authToken', token);
      setUser(userData);
      if (mDetails) {
        setManufacturerDetails(mDetails);
      } else {
        setManufacturerDetails(null);
      }

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Authentication failed. Please check credentials.'
      };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user: newUser, manufacturerDetails: mDetails } = response.data;

      // Automatically log in on successful registration
      localStorage.setItem('authToken', token);
      setUser(newUser);
      if (mDetails) {
        setManufacturerDetails(mDetails);
      } else {
        setManufacturerDetails(null);
      }

      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please check inputs.',
        errors: error.response?.data?.errors || null
      };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setManufacturerDetails(null);
  };

  // Update profile details
  const updateProfile = async (username, email) => {
    try {
      const response = await api.put('/auth/profile', { username, email });
      setUser(response.data.user);
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile.'
      };
    }
  };

  // Update password details
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      return { success: true, message: 'Password updated successfully.' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update password.'
      };
    }
  };

  const value = {
    user,
    manufacturerDetails,
    loading,
    theme,
    toggleTheme,
    login,
    register,
    logout,
    updateProfile,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
