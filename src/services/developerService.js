import axios from 'axios';

// Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://itbackend-p8k1.onrender.com/api');

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
apiClient.interceptors.request.use(
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============================================
// DEVELOPER SERVICES
// ============================================

// Task Management Services
export const taskService = {
    // Get all tasks
    getAll: () => apiClient.get('/tasks'),

    // Get tasks by status
    getByStatus: (status) => apiClient.get(`/tasks?status=${status}`),

    // Get assigned tasks for current user
    getAssigned: () => apiClient.get('/tasks/assigned'),

    // Get task by ID
    getById: (id) => apiClient.get(`/tasks/${id}`),

    // Create new task
    create: (taskData) => apiClient.post('/tasks', taskData),

    // Update task
    update: (id, taskData) => apiClient.put(`/tasks/${id}`, taskData),

    // Delete task
    delete: (id) => apiClient.delete(`/tasks/${id}`),

    // Update task status
    updateStatus: (id, status) => apiClient.patch(`/tasks/${id}/status`, { status }),

    // Add comment to task
    addComment: (id, comment) => apiClient.post(`/tasks/${id}/comments`, { comment }),
};

// Sprint Management Services
export const sprintService = {
    // Get all sprints
    getAll: () => apiClient.get('/sprints'),

    // Get sprint by ID
    getById: (id) => apiClient.get(`/sprints/${id}`),

    // Create new sprint
    create: (sprintData) => apiClient.post('/sprints', sprintData),

    // Update sprint
    update: (id, sprintData) => apiClient.put(`/sprints/${id}`, sprintData),

    // Delete sprint
    delete: (id) => apiClient.delete(`/sprints/${id}`),

    // Get sprint tasks
    getTasks: (id) => apiClient.get(`/sprints/${id}/tasks`),

    // Add task to sprint
    addTask: (sprintId, taskId) => apiClient.post(`/sprints/${sprintId}/tasks`, { taskId }),

    // Get sprint statistics
    getStats: (id) => apiClient.get(`/sprints/${id}/stats`),
};

// Bug Management Services
export const bugService = {
    // Get all bugs
    getAll: () => apiClient.get('/bugs'),

    // Get bugs assigned to current user
    getAssigned: () => apiClient.get('/bugs/assigned'),

    // Get bug by ID
    getById: (id) => apiClient.get(`/bugs/${id}`),

    // Create new bug
    create: (bugData) => apiClient.post('/bugs', bugData),

    // Update bug
    update: (id, bugData) => apiClient.put(`/bugs/${id}`, bugData),

    // Delete bug
    delete: (id) => apiClient.delete(`/bugs/${id}`),

    // Update bug status
    updateStatus: (id, status) => apiClient.patch(`/bugs/${id}/status`, { status }),

    // Add comment to bug
    addComment: (id, commentData) => apiClient.post(`/bugs/${id}/comments`, commentData),

    // Get bug comments
    getComments: (id) => apiClient.get(`/bugs/${id}/comments`),
};

// Design Files Services (Wireframes, Mockups, Prototypes)
export const designService = {
    // Wireframes
    wireframes: {
        getAll: (params) => apiClient.get('/wireframes', { params }),
        getApproved: () => apiClient.get('/wireframes?status=approved'),
        getById: (id) => apiClient.get(`/wireframes/${id}`),
        create: (formData) => apiClient.post('/wireframes', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        update: (id, formData) => apiClient.put(`/wireframes/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        delete: (id) => apiClient.delete(`/wireframes/${id}`),
    },

    // Mockups
    mockups: {
        getAll: (params) => apiClient.get('/mockups', { params }),
        getApproved: () => apiClient.get('/mockups?status=approved'),
        getById: (id) => apiClient.get(`/mockups/${id}`),
        create: (formData) => apiClient.post('/mockups', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        update: (id, formData) => apiClient.put(`/mockups/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        delete: (id) => apiClient.delete(`/mockups/${id}`),
    },

    // Prototypes
    prototypes: {
        getAll: (params) => apiClient.get('/prototypes', { params }),
        getApproved: () => apiClient.get('/prototypes?status=approved'),
        getById: (id) => apiClient.get(`/prototypes/${id}`),
        create: (formData) => apiClient.post('/prototypes', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        update: (id, formData) => apiClient.put(`/prototypes/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        delete: (id) => apiClient.delete(`/prototypes/${id}`),
    },
};

// Time Tracking Services
export const timeTrackingService = {
    // Get all time logs
    getAll: () => apiClient.get('/time-tracking'),

    // Get time logs for current user
    getMy: () => apiClient.get('/time-tracking/my'),

    // Get time logs by date range
    getByDateRange: (startDate, endDate) =>
        apiClient.get(`/time-tracking?startDate=${startDate}&endDate=${endDate}`),

    // Create time log
    create: (logData) => apiClient.post('/time-tracking', logData),

    // Update time log
    update: (id, logData) => apiClient.put(`/time-tracking/${id}`, logData),

    // Delete time log
    delete: (id) => apiClient.delete(`/time-tracking/${id}`),

    // Get time statistics
    getStats: () => apiClient.get('/time-tracking/stats'),
};

// Deliverables Services
export const deliverableService = {
    // Get all deliverables
    getAll: () => apiClient.get('/deliverables'),

    // Get deliverable by ID
    getById: (id) => apiClient.get(`/deliverables/${id}`),

    // Create deliverable
    create: (formData) => apiClient.post('/deliverables', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Update deliverable
    update: (id, formData) => apiClient.put(`/deliverables/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Delete deliverable
    delete: (id) => apiClient.delete(`/deliverables/${id}`),

    // Submit for review
    submitForReview: (id) => apiClient.patch(`/deliverables/${id}/submit`),

    // Approve deliverable
    approve: (id, feedback) => apiClient.patch(`/deliverables/${id}/approve`, { feedback }),

    // Reject deliverable
    reject: (id, feedback) => apiClient.patch(`/deliverables/${id}/reject`, { feedback }),
};

// Task Checklist Services
export const checklistService = {
    // Get checklist for task
    getByTask: (taskId) => apiClient.get(`/task-checklists?taskId=${taskId}`),

    // Create checklist item
    create: (itemData) => apiClient.post('/task-checklists', itemData),

    // Update checklist item
    update: (id, itemData) => apiClient.put(`/task-checklists/${id}`, itemData),

    // Toggle checklist item
    toggle: (id) => apiClient.patch(`/task-checklists/${id}/toggle`),

    // Delete checklist item
    delete: (id) => apiClient.delete(`/task-checklists/${id}`),
};

// Code Repository Services (if backend supports)
export const codeService = {
    // Get repositories
    getRepositories: () => apiClient.get('/code/repositories'),

    // Get commits
    getCommits: (repoId) => apiClient.get(`/code/repositories/${repoId}/commits`),

    // Get pull requests
    getPullRequests: (repoId) => apiClient.get(`/code/repositories/${repoId}/pull-requests`),

    // Get branches
    getBranches: (repoId) => apiClient.get(`/code/repositories/${repoId}/branches`),
};

// Project Services
export const projectService = {
    // Get all projects
    getAll: () => apiClient.get('/projects'),

    // Get project by ID
    getById: (id) => apiClient.get(`/projects/${id}`),

    // Get projects by user
    getByUser: (userId) => apiClient.get(`/projects/user/${userId}`),

    // Create project
    create: (projectData) => apiClient.post('/projects', projectData),

    // Update project
    update: (id, projectData) => apiClient.put(`/projects/${id}`, projectData),

    // Delete project
    delete: (id) => apiClient.delete(`/projects/${id}`),

    // Get project statistics
    getStats: (id) => apiClient.get(`/projects/${id}/stats`),
};

// Collaboration Services
export const collaborationService = {
    // Get comments
    getComments: (entityType, entityId) =>
        apiClient.get(`/comments?entityType=${entityType}&entityId=${entityId}`),

    // Add comment
    addComment: (commentData) => apiClient.post('/comments', commentData),

    // Update comment
    updateComment: (id, commentData) => apiClient.put(`/comments/${id}`, commentData),

    // Delete comment
    deleteComment: (id) => apiClient.delete(`/comments/${id}`),

    // Get notifications
    getNotifications: () => apiClient.get('/notifications'),

    // Mark notification as read
    markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),

    // Get team members
    getTeamMembers: (projectId) => apiClient.get(`/team?projectId=${projectId}`),
};

// Dashboard Services
export const dashboardService = {
    // Get developer dashboard data
    getDeveloperDashboard: () => apiClient.get('/dashboard/developer'),

    // Get progress data
    getProgress: () => apiClient.get('/dashboard/progress'),

    // Get statistics
    getStats: () => apiClient.get('/dashboard/stats'),
};

export default {
    task: taskService,
    sprint: sprintService,
    bug: bugService,
    design: designService,
    timeTracking: timeTrackingService,
    deliverable: deliverableService,
    checklist: checklistService,
    code: codeService,
    project: projectService,
    collaboration: collaborationService,
    dashboard: dashboardService,
};
