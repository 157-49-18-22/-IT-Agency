import axios from 'axios';
import { getAuthHeader } from './auth';

const API_URL = 'http://localhost:5000/api/uat';

// Create a new UAT test case
const createTest = async (testData) => {
  try {
    const response = await axios.post(API_URL, testData, {
      headers: getAuthHeader()
    });
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
    
    const response = await axios.get(`${API_URL}?${params.toString()}`, {
      headers: getAuthHeader()
    });
    
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching UAT test cases:', error);
    throw error.response?.data?.message || 'Failed to fetch test cases';
  }
};

// Get a single UAT test case by ID
const getTestById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching UAT test case ${id}:`, error);
    throw error.response?.data?.message || 'Failed to fetch test case';
  }
};

// Update a UAT test case
const updateTest = async (id, testData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, testData, {
      headers: getAuthHeader()
    });
    return response.data.data;
  } catch (error) {
    console.error(`Error updating UAT test case ${id}:`, error);
    throw error.response?.data?.message || 'Failed to update test case';
  }
};

// Delete a UAT test case
const deleteTest = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
    return true;
  } catch (error) {
    console.error(`Error deleting UAT test case ${id}:`, error);
    throw error.response?.data?.message || 'Failed to delete test case';
  }
};

// Update UAT test case status
const updateTestStatus = async (id, status) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${id}/status`,
      { status },
      { headers: getAuthHeader() }
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
