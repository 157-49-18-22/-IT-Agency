const API_URL = 'http://localhost:5000/api/tasks';

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

// Get all tasks
export const getTasks = async (filters = {}) => {
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

// Create a new task
export const createTask = async (taskData) => {
  const response = await apiRequest(API_URL, {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
  return response.data;
};

// Update a task
export const updateTask = async (taskId, taskData) => {
  const response = await apiRequest(`${API_URL}/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  });
  return response.data;
};

// Delete a task
export const deleteTask = async (taskId) => {
  await apiRequest(`${API_URL}/${taskId}`, {
    method: 'DELETE',
  });
  return taskId;
};

// Toggle task status
export const toggleTaskStatus = async (taskId, currentStatus) => {
  const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
  return updateTask(taskId, { status: newStatus });
};
