const API_URL = 'http://localhost:5000/api/test-cases';

// Helper function to handle API calls
const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Something went wrong');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Create a new test case
export const createTestCase = async (testCaseData) => {
  const response = await apiRequest(API_URL, {
    method: 'POST',
    body: JSON.stringify(testCaseData),
  });
  return response.data;
};

// Get all test cases
export const getTestCases = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params if they exist
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') {
      queryParams.append(key, value);
    }
  });

  const url = `${API_URL}?${queryParams.toString()}`;
  const response = await apiRequest(url);
  return response.data;
};

// Get a single test case by ID
export const getTestCase = async (testCaseId) => {
  const response = await apiRequest(`${API_URL}/${testCaseId}`);
  return response.data;
};

// Update a test case
export const updateTestCase = async (testCaseId, testCaseData) => {
  const response = await apiRequest(`${API_URL}/${testCaseId}`, {
    method: 'PUT',
    body: JSON.stringify(testCaseData),
  });
  return response.data;
};

// Delete a test case
export const deleteTestCase = async (testCaseId) => {
  await apiRequest(`${API_URL}/${testCaseId}`, {
    method: 'DELETE',
  });
  return testCaseId;
};

// Add test result
export const addTestResult = async (testCaseId, resultData) => {
  const response = await apiRequest(`${API_URL}/${testCaseId}/results`, {
    method: 'POST',
    body: JSON.stringify(resultData),
  });
  return response.data;
};
