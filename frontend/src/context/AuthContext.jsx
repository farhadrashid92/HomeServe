import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, logout as authServiceLogout } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const loginUser = (userData) => {
    setCurrentUser(userData);
  };

  const logoutUser = () => {
    authServiceLogout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loginUser,
    logoutUser,
    logout: logoutUser,
    isAuthenticated: !!currentUser,
    isCustomer: currentUser?.role === 'customer',
    isProvider: currentUser?.role === 'provider',
    isAdmin: currentUser?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
