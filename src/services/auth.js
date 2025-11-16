// Get authentication header with JWT token
export const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (user && user.token) {
    return { 'x-auth-token': user.token };
  } else {
    return {};
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem('user') !== null;
};

// Get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Set user data in local storage
export const setUser = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
};

// Remove user data from local storage
export const removeUser = () => {
  localStorage.removeItem('user');
};
