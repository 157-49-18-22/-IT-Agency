import axios from 'axios';
import { getAuthHeader } from './auth';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api', // This will be handled by the Vite proxy
  headers: {
    'Content-Type': 'application/json',
  }
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


// Create a new UAT test case
const createTest = async (testData) => {
  try {
    const response = await api.post('/uat', testData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating UAT test case:', error);
    throw error.response?.data?.message || 'Failed to create test case';
  }
};

// Get all UAT test cases with optional filters
const getAllTests = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to query params if provided
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.projectId) params.append('projectId', filters.projectId);
    
    const response = await api.get(`/uat?${params.toString()}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching UAT test cases:', error);
    throw error.response?.data?.message || 'Failed to fetch test cases';
  }
};

// Get a single UAT test case by ID
const getTestById = async (id) => {
  try {
    const response = await api.get(`/uat/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching UAT test case ${id}:`, error);
    throw error.response?.data?.message || 'Failed to fetch test case';
  }
};

// Update a UAT test case
const updateTest = async (id, testData) => {
  try {
    const response = await api.put(`/uat/${id}`, testData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating UAT test case ${id}:`, error);
    throw error.response?.data?.message || 'Failed to update test case';
  }
};

// Delete a UAT test case
const deleteTest = async (id) => {
  try {
    await api.delete(`/uat/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting UAT test case ${id}:`, error);
    throw error.response?.data?.message || 'Failed to delete test case';
  }
};

// Update UAT test case status
const updateTestStatus = async (id, status) => {
  try {
    const response = await api.patch(
      `/uat/${id}/status`,
      { status }
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error updating status for UAT test case ${id}:`, error);
    throw error.response?.data?.message || 'Failed to update test case status';
  }
};

export default {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
  updateTestStatus
};
