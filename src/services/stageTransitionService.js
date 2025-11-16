import axios from 'axios';
import { API_BASE_URL } from './api';

const API_URL = `${API_BASE_URL}/api/stage-transitions`;

// Get all stage transitions
export const getStageTransitions = async (token) => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching stage transitions:', error);
    throw error;
  }
};

// Create a new stage transition
export const createStageTransition = async (transitionData, token) => {
  try {
    const response = await axios.post(API_URL, transitionData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating stage transition:', error);
    throw error;
  }
};

// Update a stage transition
export const updateStageTransition = async (id, updates, token) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updates, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating stage transition:', error);
    throw error;
  }
};

// Approve a stage transition
export const approveStageTransition = async (id, approverId, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/${id}/approve`,
      { approvedById: approverId },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error approving stage transition:', error);
    throw error;
  }
};

// Reject a stage transition
export const rejectStageTransition = async (id, { rejectedById, rejectionReason }, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/${id}/reject`,
      { rejectedById, rejectionReason },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error rejecting stage transition:', error);
    throw error;
  }
};

// Get stage transitions by project ID
export const getStageTransitionsByProject = async (projectId, token) => {
  try {
    const response = await axios.get(`${API_URL}/project/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching project stage transitions:', error);
    throw error;
  }
};
