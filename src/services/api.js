import axios from 'axios';

export const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getProfile: () => api.get('/auth/profile'),
};

// User APIs
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
};

// Project APIs
export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getStats: (id) => api.get(`/projects/${id}/stats`),
  updatePhase: (id, phase) => api.put(`/projects/${id}/phase`, { phase }),
};

// Task APIs
export const taskAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  updateStatus: (id, status) => api.put(`/tasks/${id}/status`, { status }),
  assignUser: (id, userId) => api.put(`/tasks/${id}/assign`, { userId }),
};

// Client APIs
export const clientAPI = {
  getAll: (params) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

// Team APIs
export const teamAPI = {
  getAll: (params) => api.get('/teams', { params }),
  getById: (id) => api.get(`/teams/${id}`),
  addMember: (data) => api.post('/teams', data),
  updateMember: (id, data) => api.put(`/teams/${id}`, data),
  removeMember: (id) => api.delete(`/teams/${id}`),
  updateRole: (id, role) => api.put(`/teams/${id}/role`, { role }),
};

// Approval APIs
export const approvalAPI = {
  getAll: (params) => api.get('/approvals', { params }),
  getById: (id) => api.get(`/approvals/${id}`),
  create: (data) => api.post('/approvals', data),
  approve: (id, data) => api.put(`/approvals/${id}/approve`, data),
  reject: (id, data) => api.put(`/approvals/${id}/reject`, data),
  getPending: () => api.get('/approvals/pending'),
};

// Deliverable APIs
export const deliverableAPI = {
  getAll: (params) => api.get('/deliverables', { params }),
  getById: (id) => api.get(`/deliverables/${id}`),
  create: (data) => api.post('/deliverables', data),
  update: (id, data) => api.put(`/deliverables/${id}`, data),
  delete: (id) => api.delete(`/deliverables/${id}`),
  approve: (id) => api.put(`/deliverables/${id}/approve`),
};

// Message APIs
export const messageAPI = {
  getAll: (params) => api.get('/messages', { params }),
  getById: (id) => api.get(`/messages/${id}`),
  send: (data) => api.post('/messages', data),
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  delete: (id) => api.delete(`/messages/${id}`),
  getThreads: () => api.get('/messages/threads'),
};

// Notification APIs
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// Activity APIs
export const activityAPI = {
  getAll: (params) => api.get('/activity', { params }),
  getByProject: (projectId) => api.get(`/activity/project/${projectId}`),
  getByUser: (userId) => api.get(`/activity/user/${userId}`),
};

// Calendar APIs
export const calendarAPI = {
  getAll: (params) => api.get('/calendar', { params }),
  getById: (id) => api.get(`/calendar/${id}`),
  create: (data) => api.post('/calendar', data),
  update: (id, data) => api.put(`/calendar/${id}`, data),
  delete: (id) => api.delete(`/calendar/${id}`),
};

// Time Tracking APIs
export const timeTrackingAPI = {
  getAll: async (params) => {
    try {
      console.log('Fetching all time entries with params:', params);
      const response = await api.get('/time-tracking', { params });
      console.log('Time entries fetched successfully');
      return response;
    } catch (error) {
      console.error('Error fetching time entries:', error.response?.data || error.message);
      throw error;
    }
  },
  start: async (data) => {
    try {
      console.log('Starting time tracking with data:', data);
      const response = await api.post('/time-tracking/start', data);
      console.log('Time tracking started successfully');
      return response;
    } catch (error) {
      console.error('Error starting time tracking:', error.response?.data || error.message);
      throw error;
    }
  },
  stop: async (id) => {
    try {
      console.log('Stopping time tracking for entry:', id);
      const response = await api.put(`/time-tracking/${id}/stop`);
      console.log('Time tracking stopped successfully');
      return response;
    } catch (error) {
      console.error('Error stopping time tracking:', error.response?.data || error.message);
      throw error;
    }
  },
  create: async (data) => {
    try {
      console.log('Creating time entry with data:', JSON.stringify(data, null, 2));
      const response = await api.post('/time-tracking', data);
      console.log('Time entry created successfully');
      return response;
    } catch (error) {
      console.error('Error creating time entry:', error.response?.data || error.message);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      console.log(`Updating time entry ${id} with data:`, data);
      const response = await api.put(`/time-tracking/${id}`, data);
      console.log('Time entry updated successfully');
      return response;
    } catch (error) {
      console.error('Error updating time entry:', error.response?.data || error.message);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      console.log('Deleting time entry:', id);
      const response = await api.delete(`/time-tracking/${id}`);
      console.log('Time entry deleted successfully');
      return response;
    } catch (error) {
      console.error('Error deleting time entry:', error.response?.data || error.message);
      throw error;
    }
  },
  getByProject: async (projectId) => {
    try {
      console.log('Fetching time entries for project:', projectId);
      const response = await api.get(`/time-tracking/project/${projectId}`);
      console.log('Project time entries fetched successfully');
      return response;
    } catch (error) {
      console.error('Error fetching project time entries:', error.response?.data || error.message);
      throw error;
    }
  },
};

// Report APIs
export const reportAPI = {
  getProjectProgress: (params) => api.get('/reports/project-progress', { params }),
  getTeamPerformance: (params) => api.get('/reports/team-performance', { params }),
  getFinancial: (params = {}) => {
    // Default to last 6 months if no date range provided
    const defaultParams = {
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      ...params
    };
    return api.get('/reports/financial', { params: defaultParams });
  },
  getFinancialSummary: (params = {}) => {
    return api.get('/reports/financial/summary', { params });
  },
  exportFinancials: (params) => {
    return api.get('/reports/financial/export', { 
      params,
      responseType: 'blob'
    });
  },
  getCustom: (params) => api.get('/reports/custom', { params }),
  export: (type, params) => api.get(`/reports/export/${type}`, { params, responseType: 'blob' }),
};

// Sprint APIs
export const sprintAPI = {
  getAll: (params) => api.get('/sprints', { params }),
  getById: (id) => api.get(`/sprints/${id}`),
  create: (data) => api.post('/sprints', data),
  update: (id, data) => api.put(`/sprints/${id}`, data),
  delete: (id) => api.delete(`/sprints/${id}`),
  start: (id) => api.put(`/sprints/${id}/start`),
  complete: (id, data) => api.put(`/sprints/${id}/complete`, data),
};

// Upload APIs
export const uploadAPI = {
  single: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    });
  },
  multiple: (files, onProgress) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    });
  },
  delete: (filename) => api.delete(`/upload/${filename}`),
};

// Audit Log APIs
export const auditLogAPI = {
  getAll: (params) => api.get('/audit-logs', { params }),
  getByEntity: (entityType, entityId) => api.get(`/audit-logs/entity/${entityType}/${entityId}`),
  export: () => api.get('/audit-logs/export', { responseType: 'blob' }),
};

// Deployment APIs
export const deploymentAPI = {
  getAll: (params) => api.get('/deployments', { params }),
  getById: (id) => api.get(`/deployments/${id}`),
  create: (data) => api.post('/deployments', data),
  update: (id, data) => api.put(`/deployments/${id}`, data),
  delete: (id) => api.delete(`/deployments/${id}`),
  getProjectDeployments: (projectId) => api.get(`/deployments/project/${projectId}`),
  getEnvironmentDeployments: (environment) => api.get(`/deployments/environment/${environment}`),
  getStatus: (id) => api.get(`/deployments/${id}/status`),
  redeploy: (id) => api.post(`/deployments/${id}/redeploy`),
  cancel: (id) => api.post(`/deployments/${id}/cancel`),
  getLogs: (id) => api.get(`/deployments/${id}/logs`)
};

// Code Repository APIs
export const codeAPI = {
  getAll: (params) => api.get('/code', { params }),
  getById: (id) => api.get(`/code/${id}`),
  create: (data) => api.post('/code', data),
  update: (id, data) => api.put(`/code/${id}`, data),
  delete: (id) => api.delete(`/code/${id}`),
  getByProject: (projectId) => api.get(`/code/project/${projectId}`),
  getByUser: (userId) => api.get(`/code/user/${userId}`),
  search: (query) => api.get('/code/search', { params: { q: query } }),
  getFileContent: (id, path) => api.get(`/code/${id}/file`, { params: { path } }),
  updateFile: (id, path, content) => api.put(`/code/${id}/file`, { path, content }),
  createFile: (id, path, content) => api.post(`/code/${id}/file`, { path, content }),
  deleteFile: (id, path) => api.delete(`/code/${id}/file`, { data: { path } })
};

// Add token to requests
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivities: (params) => api.get('/dashboard/activities', { params }),
  getProjectStatus: () => api.get('/dashboard/project-status'),
  getUpcomingDeliverables: () => api.get('/dashboard/upcoming-deliverables'),
  getMessages: () => api.get('/dashboard/messages')
};

// Stage Transition APIs
export const stageTransitionAPI = {
  getAll: (params) => api.get('/stage-transitions', { params }),
  getById: (id) => api.get(`/stage-transitions/${id}`),
  create: (data) => api.post('/stage-transitions', data),
  update: (id, data) => api.put(`/stage-transitions/${id}`, data),
  delete: (id) => api.delete(`/stage-transitions/${id}`),
  getByProject: (projectId) => api.get(`/stage-transitions/project/${projectId}`),
  approve: (id, data) => api.post(`/stage-transitions/${id}/approve`, data),
  reject: (id, data) => api.post(`/stage-transitions/${id}/reject`, data),
};

// Test Case APIs
export const testCaseAPI = {
  // Get all test cases with optional filters
  getAll: (params = {}) => api.get('/test-cases', { params }),
  
  // Get a single test case by ID
  getById: (id) => api.get(`/test-cases/${id}`),
  
  // Create a new test case
  create: (data) => api.post('/test-cases', data),
  
  // Update an existing test case
  update: (id, data) => api.patch(`/test-cases/${id}`, data),
  
  // Delete a test case
  delete: (id) => api.delete(`/test-cases/${id}`),
  
  // Add test result to a test case
  addTestResult: (id, data) => api.post(`/test-cases/${id}/results`, data),
  
  // Get test cases by project ID
  getByProject: (projectId) => api.get(`/test-cases?project=${projectId}`),
  
  // Get test cases by status
  getByStatus: (status) => api.get(`/test-cases?status=${status}`),
  
  // Get test cases by type
  getByType: (type) => api.get(`/test-cases?type=${type}`)
};

export default api;
