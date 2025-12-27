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

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

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

// Tasks APIs
export const tasksAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`)
};

// Projects APIs
export const projectsAPI = {
  getProjects: (params) => api.get('/projects', { params }),
  getProject: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  getClientProjects: (clientId) => api.get(`/clients/${clientId}/projects`),
  getProjectsByUser: (userId) => api.get('/projects', { params: { userId } })
};

// Deliverables APIs
export const deliverablesAPI = {
  getDeliverables: (params) => api.get('/deliverables', { params }),
  getDeliverable: (id) => api.get(`/deliverables/${id}`),
  upload: (formData, config) => api.post('/deliverables/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config
  }),
  createDeliverable: (data) => api.post('/deliverables', data),
  updateDeliverable: (id, data) => api.put(`/deliverables/${id}`, data),
  deleteDeliverable: (id) => api.delete(`/deliverables/${id}`)
};

// Bugs APIs
export const bugsAPI = {
  getBugs: (params) => api.get('/bugs', { params }),
  getBug: (id) => api.get(`/bugs/${id}`),
  createBug: (data) => api.post('/bugs', data),
  updateBug: (id, data) => api.put(`/bugs/${id}`, data),
  deleteBug: (id) => api.delete(`/bugs/${id}`)
};

// Time Tracking APIs
export const timeTrackingAPI = {
  getLogs: (params) => api.get('/time-logs', { params }),
  logTime: (data) => api.post('/time-logs', data),
  updateLog: (id, data) => api.put(`/time-logs/${id}`, data),
  deleteLog: (id) => api.delete(`/time-logs/${id}`)
};

// Client APIs
export const clientAPI = {
  getAll: () => api.get('/clients'),
  getDashboard: () => api.get('/client/dashboard'),
  getStats: (clientId) => api.get(`/client/${clientId}/stats`)
};

// Team APIs
export const teamAPI = {
  getAll: () => api.get('/teams'),
  getTeamMember: (id) => api.get(`/teams/${id}`),
  createTeamMember: (data) => api.post('/teams', data),
  addMember: (data) => api.post('/teams', data), // Alias for createTeamMember
  updateTeamMember: (id, data) => api.put(`/teams/${id}`, data),
  deleteTeamMember: (id) => api.delete(`/teams/${id}`),
  removeMember: (id) => api.delete(`/teams/${id}`) // Alias for deleteTeamMember
};

// Code/Repository APIs
// Code/Repository APIs

export const codeAPI = {
  getRepositories: (params) => api.get('/repositories', { params }),
  getRepository: (id) => api.get(`/repositories/${id}`),
  getCommits: (repoId) => api.get(`/repositories/${repoId}/commits`),
  getBranches: (repoId) => api.get(`/repositories/${repoId}/branches`),
  getPullRequests: (repoId) => api.get(`/repositories/${repoId}/pull-requests`),
  // File management methods
  getByProject: (projectId) => api.get(`/code/project/${projectId}`),
  create: (data) => api.post('/code', data),
  update: (id, data) => api.put(`/code/${id}`, data),
  delete: (id) => api.delete(`/code/${id}`)
};

// Deployment APIs
export const deploymentAPI = {
  getDeployments: (params) => api.get('/deployments', { params }),
  getDeployment: (id) => api.get(`/deployments/${id}`),
  createDeployment: (data) => api.post('/deployments', data),
  updateDeployment: (id, data) => api.put(`/deployments/${id}`, data),
  getDeploymentLogs: (id) => api.get(`/deployments/${id}/logs`)
};

// User/Team Management APIs
export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`)
};

// Task APIs
export const taskAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`)
};

// Sprint APIs
export const sprintAPI = {
  getSprints: (params) => api.get('/sprints', { params }),
  getSprint: (id) => api.get(`/sprints/${id}`),
  createSprint: (data) => api.post('/sprints', data),
  updateSprint: (id, data) => api.put(`/sprints/${id}`, data),
  deleteSprint: (id) => api.delete(`/sprints/${id}`)
};

// UAT APIs
export const uatAPI = {
  getUATs: (params) => api.get('/uat', { params }),
  getUAT: (id) => api.get(`/uat/${id}`),
  createUAT: (data) => api.post('/uat', data),
  updateUAT: (id, data) => api.put(`/uat/${id}`, data),
  deleteUAT: (id) => api.delete(`/uat/${id}`)
};

// Report APIs
export const reportAPI = {
  getReports: (params) => api.get('/reports', { params }),
  getReport: (id) => api.get(`/reports/${id}`),
  generateReport: (data) => api.post('/reports/generate', data),
  exportReport: (id, format) => api.get(`/reports/${id}/export/${format}`),
  getCustom: () => api.get('/reports/custom')
};

// Message APIs
export const messageAPI = {
  getMessages: (params) => api.get('/messages', { params }),
  getMessage: (id) => api.get(`/messages/${id}`),
  sendMessage: (data) => api.post('/messages', data),
  deleteMessage: (id) => api.delete(`/messages/${id}`)
};

// Notification APIs (legacy)
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  deleteNotification: (id) => api.delete(`/notifications/${id}`)
};

// Calendar APIs
export const calendarAPI = {
  getEvents: (params) => api.get('/calendar/events', { params }),
  getEvent: (id) => api.get(`/calendar/events/${id}`),
  createEvent: (data) => api.post('/calendar/events', data),
  updateEvent: (id, data) => api.put(`/calendar/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/calendar/events/${id}`)
};

// Approval APIs (legacy)
// Approval APIs (legacy - for UI/UX)
export const approvalAPI = {
  getAll: (params) => api.get('/approvals', { params }),
  getApprovals: (params) => api.get('/approvals', { params }),
  getApproval: (id) => api.get(`/approvals/${id}`),
  createApproval: (data) => api.post('/approvals', data),
  approve: (id, data) => api.put(`/approvals/${id}/approve`, data),
  reject: (id, data) => api.put(`/approvals/${id}/reject`, data),
  respondToApproval: (id, data) => api.put(`/approvals/${id}/respond`, data)
};

// Activity APIs
export const activityAPI = {
  getActivities: (params) => api.get('/activities', { params }),
  getActivity: (id) => api.get(`/activities/${id}`),
  logActivity: (data) => api.post('/activities', data)
};

// Deliverable APIs (legacy)
export const deliverableAPI = {
  getDeliverables: (params) => api.get('/deliverables', { params }),
  getDeliverable: (id) => api.get(`/deliverables/${id}`),
  createDeliverable: (data) => api.post('/deliverables', data),
  updateDeliverable: (id, data) => api.put(`/deliverables/${id}`, data),
  deleteDeliverable: (id) => api.delete(`/deliverables/${id}`)
};

// Upload APIs
export const uploadAPI = {
  uploadFile: (formData, config) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config
  }),
  deleteFile: (id) => api.delete(`/upload/${id}`)
};

// Project API (legacy - for backward compatibility)
export const projectAPI = {
  getAll: (params) => api.get('/projects', { params }),
  get: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`)
};

// Blocker APIs
export const blockerAPI = {
  getBlockers: (params) => api.get('/blockers', { params }),
  getBlocker: (id) => api.get(`/blockers/${id}`),
  createBlocker: (data) => api.post('/blockers', data),
  updateBlockerStatus: (id, status) => api.patch(`/blockers/${id}/status`, { status }),
  deleteBlocker: (id) => api.delete(`/blockers/${id}`)
};

// Feedback APIs
export const feedbackAPI = {
  getFeedbacks: (params) => api.get('/feedbacks', { params }),
  getFeedback: (id) => api.get(`/feedbacks/${id}`),
  createFeedback: (data) => api.post('/feedbacks', data),
  markAsAddressed: (id) => api.patch(`/feedbacks/${id}/address`),
  deleteFeedback: (id) => api.delete(`/feedbacks/${id}`)
};

// Time Tracking APIs (enhanced)
export const timeLogsAPI = {
  getLogs: (params) => api.get('/time-tracking', { params }),
  createLog: (data) => api.post('/time-tracking', data),
  stopTimer: (id) => api.put(`/time-tracking/${id}/stop`),
  updateLog: (id, data) => api.put(`/time-tracking/${id}`, data),
  deleteLog: (id) => api.delete(`/time-tracking/${id}`)
};

// End of APIs

export default api;
