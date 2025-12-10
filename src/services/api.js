import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
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

// Dashboard APIs
export const dashboardAPI = {
  // Get enhanced dashboard metrics
  getMetrics: () => api.get('/dashboard/metrics'),

  // Get user-specific dashboard
  getMyDashboard: () => api.get('/dashboard/my-dashboard'),

  // Get stage-wise summary
  getStageSummary: () => api.get('/dashboard/stage-summary'),

  // Get pending approvals
  getPendingApprovals: () => api.get('/dashboard/pending-approvals'),

  // Get team workload
  getTeamWorkload: () => api.get('/dashboard/team-workload'),

  // Get bug statistics
  getBugStats: (projectId) => api.get('/dashboard/bug-stats', { params: { projectId } })
};

// Project Stages APIs
export const projectStagesAPI = {
  // Get all stages for a project
  getStages: (projectId) => api.get(`/projects/${projectId}/stages`),

  // Get stage details
  getStageDetails: (projectId, stageId) => api.get(`/projects/${projectId}/stages/${stageId}`),

  // Update stage
  updateStage: (projectId, stageId, data) => api.put(`/projects/${projectId}/stages/${stageId}`, data),

  // Get stages summary
  getStagesSummary: (projectId) => api.get(`/projects/${projectId}/stages/summary`),

  // Calculate stage progress
  calculateProgress: (projectId, stageId) => api.post(`/projects/${projectId}/stages/${stageId}/calculate-progress`)
};

// Stage Transitions APIs
export const stageTransitionsAPI = {
  // Get all transitions
  getTransitions: (projectId) => api.get(`/projects/${projectId}/stage-transitions`),

  // Create new transition
  transitionStage: (projectId, data) => api.post(`/projects/${projectId}/stage-transitions`, data),

  // Get transition history
  getHistory: (projectId) => api.get(`/projects/${projectId}/stage-transitions/history`),

  // Check if can transition
  canTransition: (projectId, toStage) => api.get(`/projects/${projectId}/stage-transitions/can-transition`, { params: { toStage } })
};

// Comments APIs
export const commentsAPI = {
  // Get comments
  getComments: (params) => api.get('/comments', { params }),

  // Get comment with replies
  getCommentWithReplies: (id) => api.get(`/comments/${id}`),

  // Create comment
  createComment: (data) => api.post('/comments', data),

  // Update comment
  updateComment: (id, data) => api.put(`/comments/${id}`, data),

  // Delete comment
  deleteComment: (id) => api.delete(`/comments/${id}`)
};

// Task Checklists APIs
export const taskChecklistsAPI = {
  // Get checklist
  getChecklist: (taskId) => api.get(`/tasks/${taskId}/checklist`),

  // Create checklist item
  createItem: (taskId, data) => api.post(`/tasks/${taskId}/checklist`, data),

  // Update checklist item
  updateItem: (taskId, itemId, data) => api.put(`/tasks/${taskId}/checklist/${itemId}`, data),

  // Delete checklist item
  deleteItem: (taskId, itemId) => api.delete(`/tasks/${taskId}/checklist/${itemId}`),

  // Toggle checklist item
  toggleItem: (taskId, itemId) => api.patch(`/tasks/${taskId}/checklist/${itemId}/toggle`),

  // Reorder checklist items
  reorderItems: (taskId, items) => api.put(`/tasks/${taskId}/checklist/reorder`, { items })
};

// Notifications APIs
export const notificationsAPI = {
  // Get notifications
  getNotifications: (params) => api.get('/notifications-enhanced', { params }),

  // Get unread count
  getUnreadCount: () => api.get('/notifications-enhanced/unread-count'),

  // Mark as read
  markAsRead: (id) => api.put(`/notifications-enhanced/${id}/read`),

  // Mark all as read
  markAllAsRead: () => api.put('/notifications-enhanced/mark-all-read'),

  // Delete notification
  deleteNotification: (id) => api.delete(`/notifications-enhanced/${id}`),

  // Create notification (admin only)
  createNotification: (data) => api.post('/notifications-enhanced', data),

  // Send bulk notifications (admin only)
  sendBulk: (data) => api.post('/notifications-enhanced/bulk', data)
};

// Approvals APIs
export const approvalsAPI = {
  // Get approvals
  getApprovals: (params) => api.get('/approvals-enhanced', { params }),

  // Get single approval
  getApproval: (id) => api.get(`/approvals-enhanced/${id}`),

  // Create approval
  createApproval: (data) => api.post('/approvals-enhanced', data),

  // Respond to approval
  respondToApproval: (id, data) => api.put(`/approvals-enhanced/${id}/respond`, data),

  // Cancel approval
  cancelApproval: (id) => api.put(`/approvals-enhanced/${id}/cancel`),

  // Get pending count
  getPendingCount: () => api.get('/approvals-enhanced/pending/count')
};

export default api;
