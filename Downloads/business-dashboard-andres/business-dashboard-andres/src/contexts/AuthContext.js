"use client"

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';
import socketService from '../lib/socket';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
        
        // Connect to Socket.IO
        socketService.connect(token);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        logout();
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      
      const { token, company } = response.data;
      
      // Save to localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(company));
      
      // Update state
      setUser(company);
      setIsAuthenticated(true);
      
      // Connect to Socket.IO
      socketService.connect(token);
      
      toast.success('Login successful!');
      return { success: true };
      
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      const { token, company } = response.data;
      
      // Save to localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(company));
      
      // Update state
      setUser(company);
      setIsAuthenticated(true);
      
      // Connect to Socket.IO
      socketService.connect(token);
      
      toast.success('Registration successful!');
      return { success: true };
      
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Update state
    setUser(null);
    setIsAuthenticated(false);
    
    // Disconnect Socket.IO
    socketService.disconnect();
    
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(profileData);
      
      const updatedUser = response.data.company;
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      
      toast.success('Profile updated successfully!');
      return { success: true };
      
    } catch (error) {
      console.error('Profile update error:', error);
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      await authAPI.changePassword({ currentPassword, newPassword });
      
      toast.success('Password changed successfully!');
      return { success: true };
      
    } catch (error) {
      console.error('Password change error:', error);
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      const updatedUser = response.data;
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      
    } catch (error) {
      console.error('Error refreshing user:', error);
      // If refresh fails, logout the user
      logout();
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 