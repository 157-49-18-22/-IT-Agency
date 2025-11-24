import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Helper function to get user from localStorage with consistent role handling
const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    if (!user) return null;
    
    const parsedUser = JSON.parse(user);
    // Ensure role is always lowercase
    if (parsedUser.role) {
      parsedUser.role = parsedUser.role.toLowerCase();
    }
    return parsedUser;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    // Initialize with user from localStorage during initial render
    const user = getStoredUser();
    console.log('Initial user from storage:', user);
    return user;
  });
  const [isLoading, setIsLoading] = useState(!currentUser);

  useEffect(() => {
    // Only set loading to false after initial render
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  const login = async (userData) => {
    console.log('Login called with:', userData);
    try {
      if (!userData) {
        throw new Error('No user data provided');
      }

      const userToStore = {
        ...userData,
        // Ensure we have default values for required fields
        role: (userData.role || 'user').toLowerCase(),
        id: userData.id || Date.now().toString()
      };
      
      console.log('Storing user data:', userToStore);
      localStorage.setItem('user', JSON.stringify(userToStore));
      
      // Update the current user in state
      setCurrentUser(userToStore);
      
      console.log('User logged in and stored:', userToStore);
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      // Clear any partial data on error
      localStorage.removeItem('user');
      setCurrentUser(null);
      return false;
    }
  };

  const logout = () => {
    console.log('Logging out user');
    // Clear all auth-related data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    // Force a full page reload to reset all state
    window.location.href = '/';
  };

  // Check if user is authenticated
  const isAuthenticated = !!currentUser;

  // Check if user has admin role (case-insensitive)
  const isAdmin = String(currentUser?.role || '').toLowerCase() === 'admin';

  // Check if user has developer role (case-insensitive)
  const isDeveloper = String(currentUser?.role || '').toLowerCase() === 'developer';

  const value = {
    currentUser,
    isLoading,
    isAuthenticated,
    isAdmin,
    isDeveloper,
    login,
    logout,
    setCurrentUser
  };

  // Log state changes for debugging
  useEffect(() => {
    console.log('Auth state updated - isAuthenticated:', isAuthenticated, 'User:', currentUser, 'isLoading:', isLoading);
  }, [currentUser, isAuthenticated, isLoading]);

  return (
    <AuthContext.Provider value={value}>
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

export { AuthContext };
export default AuthContext;
