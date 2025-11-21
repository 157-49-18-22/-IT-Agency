// Get authentication header
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Store the authentication token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Get the authentication token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Set user data in local storage
export const setUser = (userData) => {
  if (userData) {
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.token) {
      setAuthToken(userData.token);
    }
  }
};

// Remove user data from local storage
export const removeUser = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};
