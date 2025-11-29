import api from './api';

// Workflow Phase APIs
export const workflowAPI = {
  // Get workflow status for a project
  getWorkflowStatus: (projectId) => api.get(`/workflow/${projectId}/status`),
  
  // Update workflow phase
  updatePhase: (projectId, phase, data = {}) => 
    api.put(`/workflow/${projectId}/phase/${phase}`, data),
  
  // Complete a phase
  completePhase: (projectId, phase, data = {}) =>
    api.post(`/workflow/${projectId}/phase/${phase}/complete`, data),
  
  // Get phase details
  getPhaseDetails: (projectId, phase) =>
    api.get(`/workflow/${projectId}/phase/${phase}`),
    
  // Get all deliverables for a phase
  getDeliverables: (projectId, phase) =>
    api.get(`/workflow/${projectId}/phase/${phase}/deliverables`),
    
  // Update deliverable status
  updateDeliverable: (projectId, phase, deliverableId, data) =>
    api.put(`/workflow/${projectId}/phase/${phase}/deliverables/${deliverableId}`, data),
    
  // Get phase transitions
  getTransitions: (projectId) =>
    api.get(`/workflow/${projectId}/transitions`),
    
  // Request phase approval
  requestApproval: (projectId, phase, data = {}) =>
    api.post(`/workflow/${projectId}/phase/${phase}/request-approval`, data),
    
  // Approve phase
  approvePhase: (projectId, phase, data = {}) =>
    api.post(`/workflow/${projectId}/phase/${phase}/approve`, data),
    
  // Reject phase
  rejectPhase: (projectId, phase, data = {}) =>
    api.post(`/workflow/${projectId}/phase/${phase}/reject`, data),
    
  // Get phase history
  getPhaseHistory: (projectId, phase) =>
    api.get(`/workflow/${projectId}/phase/${phase}/history`),
    
  // Get all phases for a project
  getProjectPhases: (projectId) =>
    api.get(`/workflow/${projectId}/phases`),
    
  // Get phase metrics
  getPhaseMetrics: (projectId, phase) =>
    api.get(`/workflow/${projectId}/phase/${phase}/metrics`),
    
  // Upload deliverable file
  uploadDeliverable: (projectId, phase, formData, onUploadProgress) => {
    return api.post(
      `/workflow/${projectId}/phase/${phase}/upload-deliverable`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      }
    );
  },
  
  // Download deliverable file
  downloadDeliverable: (projectId, phase, fileId) =>
    api.get(`/workflow/${projectId}/phase/${phase}/deliverables/${fileId}/download`, {
      responseType: 'blob',
    }),
};

export default workflowAPI;
