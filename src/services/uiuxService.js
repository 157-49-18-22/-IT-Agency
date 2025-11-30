import axios from 'axios';
import authHeader from './auth-header';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000/api/uiux';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = authHeader();
    if (token) {
      config.headers.Authorization = token; // authHeader already includes 'Bearer ' prefix
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    let message = 'An error occurred';
    
    if (response) {
      // Handle different HTTP status codes
      switch (response.status) {
        case 401:
          message = 'Unauthorized access. Please login again.';
          // Redirect to login or refresh token
          break;
        case 403:
          message = 'You do not have permission to perform this action';
          break;
        case 404:
          message = 'The requested resource was not found';
          break;
        case 500:
          message = 'Internal server error. Please try again later.';
          break;
        default:
          message = response.data?.message || message;
      }
    } else if (error.request) {
      // The request was made but no response was received
      message = 'No response from server. Please check your connection.';
    }

    // Show error toast
    toast.error(message);
    return Promise.reject(error);
  }
);

// WebSocket service for real-time updates
class WebSocketService {
  constructor() {
    this.socket = null;
    this.subscribers = new Map();
  }

  connect(token) {
    if (this.socket) return;
    
    this.socket = new WebSocket(`ws://localhost:5000?token=${token}`);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const callbacks = this.subscribers.get(data.type) || [];
      callbacks.forEach(callback => callback(data.payload));
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after a delay
      setTimeout(() => this.connect(token), 5000);
    };
  }

  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    const callbacks = this.subscribers.get(eventType);
    callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const updatedCallbacks = callbacks.filter(cb => cb !== callback);
      if (updatedCallbacks.length === 0) {
        this.subscribers.delete(eventType);
      } else {
        this.subscribers.set(eventType, updatedCallbacks);
      }
    };
  }

  send(eventType, payload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: eventType, payload }));
    }
  }
}

const webSocketService = new WebSocketService();

class UIXUService {
  // Project operations
  // Initialize WebSocket connection
  initWebSocket() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.accessToken) {
      webSocketService.connect(user.accessToken);
    }
    return webSocketService;
  }

  // Subscribe to real-time updates
  subscribeToUpdates(eventType, callback) {
    return webSocketService.subscribe(eventType, callback);
  }

  // Project operations
  async getProjects() {
    const response = await api.get('/projects');
    return response.data;
  }

  // User operations
  async getUsers() {
    const response = await api.get('/users');
    return response.data;
  }

  // Team operations
  async getProjectTeam(projectId) {
    const response = await api.get(`/projects/${projectId}/team`);
    return response.data;
  }

  // Task operations
  async getProjectTasks(projectId, filters = {}) {
    const response = await api.get(`/projects/${projectId}/tasks`, { 
      params: filters,
      paramsSerializer: params => {
        return Object.entries(params)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return value.map(v => `${key}=${encodeURIComponent(v)}`).join('&');
            }
            return `${key}=${encodeURIComponent(value)}`;
          })
          .join('&');
      }
    });
    return response.data;
  }

  async createTask(projectId, taskData) {
    const response = await api.post(`/projects/${projectId}/tasks`, taskData);
    // Notify about the new task via WebSocket
    webSocketService.send('TASK_CREATED', response.data);
    return response.data;
  }

  async updateTaskStatus(taskId, status) {
    const response = await api.put(`/tasks/${taskId}/status`, { status });
    // Notify about the status update via WebSocket
    webSocketService.send('TASK_UPDATED', response.data);
    return response.data;
  }

  // File operations with progress tracking
  async uploadAttachment(taskId, file, onUploadProgress) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(
      `/tasks/${taskId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          if (onUploadProgress) {
            onUploadProgress(percentCompleted);
          }
        }
      }
    );
    
    // Notify about the new attachment via WebSocket
    webSocketService.send('ATTACHMENT_ADDED', {
      taskId,
      attachment: response.data
    });
    
    return response.data;
  }

  // Time tracking with validation
  async logWorkTime(taskId, timeData) {
    // Validate time data
    if (!timeData.hours || timeData.hours <= 0) {
      throw new Error('Please enter a valid number of hours');
    }
    
    const response = await api.post(
      `/tasks/${taskId}/time-entries`,
      timeData
    );
    
    // Notify about the time entry via WebSocket
    webSocketService.send('TIME_LOGGED', {
      taskId,
      timeEntry: response.data
    });
    
    return response.data;
  }

  // Comments with rich text support
  async addComment(taskId, content, parentId = null, attachments = []) {
    const formData = new FormData();
    formData.append('content', content);
    if (parentId) {
      formData.append('parentId', parentId);
    }
    
    // Add attachments if any
    attachments.forEach((file, index) => {
      formData.append(`attachments`, file);
    });
    
    const response = await api.post(
      `/tasks/${taskId}/comments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    // Notify about the new comment via WebSocket
    webSocketService.send('COMMENT_ADDED', {
      taskId,
      comment: response.data
    });
    
    return response.data;
  }

  // Analytics with caching
  async getTaskAnalytics(projectId, forceRefresh = false) {
    const cacheKey = `analytics_${projectId}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    // Return cached data if available and not forcing refresh
    if (cachedData && !forceRefresh) {
      try {
        return JSON.parse(cachedData);
      } catch (e) {
        console.error('Error parsing cached analytics data', e);
      }
    }
    
    // Fetch fresh data from the server
    const response = await api.get(`/projects/${projectId}/analytics/tasks`);
    
    // Cache the response
    try {
      localStorage.setItem(cacheKey, JSON.stringify(response.data));
    } catch (e) {
      console.error('Error caching analytics data', e);
    }
    
    return response.data;
  }

  // Get task attachments with caching
  async getTaskAttachments(taskId) {
    const cacheKey = `attachments_${taskId}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    // Return cached data if available
    if (cachedData) {
      try {
        const { timestamp, data } = JSON.parse(cachedData);
        // Use cached data if it's less than 5 minutes old
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return data;
        }
      } catch (e) {
        console.error('Error parsing cached attachments', e);
      }
    }
    
    // Fetch fresh data from the server
    const response = await api.get(`/tasks/${taskId}/attachments`);
    
    // Cache the response
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: response.data
      }));
    } catch (e) {
      console.error('Error caching attachments', e);
    }
    
    return response.data;
  }

  // Delete task attachment with cleanup
  async deleteAttachment(attachmentId) {
    const response = await api.delete(`/attachments/${attachmentId}`);
    
    // Clear attachment cache
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('attachments_')) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Notify about the deletion via WebSocket
    webSocketService.send('ATTACHMENT_DELETED', {
      attachmentId,
      taskId: response.data.taskId
    });
    
    return response.data;
  }

  // Update task details with validation
  async updateTask(taskId, taskData) {
    // Validate task data
    if (!taskData.title || !taskData.title.trim()) {
      throw new Error('Task title is required');
    }
    
    const response = await api.put(
      `/tasks/${taskId}`,
      taskData
    );
  }

  // Get task details
  getTaskDetails(taskId) {
    return axios.get(
      `${API_URL}/tasks/${taskId}`,
      { headers: authHeader() }
    );
  }

  // Delete task
  deleteTask(taskId) {
    return axios.delete(
      `${API_URL}/tasks/${taskId}`,
      { headers: authHeader() }
    );
  }
}

export default new UIXUService();
