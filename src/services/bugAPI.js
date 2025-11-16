import axios from 'axios';

const API_URL = 'http://localhost:5000/api/bugs';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Include cookies in requests
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API methods for bugs
const bugAPI = {
  // Get all bugs with optional filters
  getAll: async (filters = {}) => {
    try {
      const response = await api.get('', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get a single bug by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new bug
  create: async (bugData) => {
    try {
      const response = await api.post('', bugData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update a bug
  update: async (id, bugData) => {
    try {
      const response = await api.put(`/${id}`, bugData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete a bug
  delete: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add comment to a bug
  addComment: async (bugId, comment) => {
    try {
      const response = await api.post(`/${bugId}/comments`, { comment });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get bug statistics
  getStats: async () => {
    try {
      const response = await api.get('/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update bug status
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Assign bug to user
  assignTo: async (id, userId) => {
    try {
      const response = await api.patch(`/${id}/assign`, { userId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default bugAPI;
