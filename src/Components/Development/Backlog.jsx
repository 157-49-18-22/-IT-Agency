import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiArrowRight, 
  FiFilter, 
  FiSearch 
} from 'react-icons/fi';
import './Backlog.css';
import { taskAPI } from '../../services/api';
import { toast } from 'react-toastify';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in Backlog component:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h3>Something went wrong loading the Backlog</h3>
          <p>{this.state.error?.message || 'Unknown error occurred'}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

function Backlog() {
  const [backlogItems, setBacklogItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const initialFormState = {
    title: '',
    description: '',
    priority: 'medium',
    storyPoints: 5,
    status: 'to_do',
    projectId: null,
    type: 'story'
  };

  const [form, setForm] = useState(initialFormState);

  const filteredItems = backlogItems.filter(item => {
    const matchesFilter = filter === 'All' || item.status === filter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                         item.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const openModal = (item = null) => {
    try {
      if (item) {
        setEditingItem(item);
        setForm({
          ...initialFormState,
          ...item,
          status: item.status || 'to_do',
          priority: item.priority ? item.priority.toLowerCase() : 'medium',
          storyPoints: item.storyPoints || 5
        });
      } else {
        setEditingItem(null);
        setForm(initialFormState);
      }
      setShowModal(true);
    } catch (error) {
      console.error('Error opening modal:', error);
      toast.error('Failed to open task form');
    }
  };

  // Add a ref to track if the component is mounted
  const isMounted = React.useRef(true);
  const retryCount = React.useRef(0);
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second

  // Cleanup function for when component unmounts
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch backlog items with retry logic
  const fetchWithRetry = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      console.log('Fetching backlog items...');
      setIsLoading(true);
      
      const response = await taskAPI.getAll({});
      console.log('API Response:', response);
      
      let tasks = [];
      
      // Handle different response structures
      if (response?.data && Array.isArray(response.data)) {
        tasks = response.data;
      } else if (Array.isArray(response)) {
        tasks = response;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        tasks = response.data.data;
      }
      
      console.log('Extracted tasks:', tasks);
      
      if (!tasks.length) {
        console.warn('No tasks found in the response');
      }
      
      setBacklogItems(tasks);
      retryCount.current = 0; // Reset retry count on success
    } catch (error) {
      console.error('Error fetching backlog items:', error);
      
      if (error.response?.status === 429) {
        // Rate limited - implement exponential backoff
        const retryAfter = error.response?.headers?.['retry-after'] || 1;
        const delay = Math.min(
          baseDelay * Math.pow(2, retryCount.current),
          30000 // Max 30 seconds
        );
        
        if (retryCount.current < maxRetries) {
          retryCount.current++;
          console.warn(`Rate limited. Retrying in ${delay}ms... (${retryCount.current}/${maxRetries})`);
          
          // Show user feedback
          toast.warning(`Too many requests. Retrying... (${retryCount.current}/${maxRetries})`);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry();
        } else {
          toast.error('Too many requests. Please try again later.');
        }
      } else {
        toast.error('Failed to fetch backlog items. Please try again.');
      }
      
      setBacklogItems([]);
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchWithRetry();
  }, [fetchWithRetry]);

  const fetchBacklogItems = useCallback(async () => {
    console.log('Fetching backlog items...');
    setIsLoading(true);
    
    try {
      const response = await taskAPI.getAll({});
      console.log('API Response:', response);
      
      let tasks = [];
      
      // Handle different response structures
      if (response?.data && Array.isArray(response.data)) {
        tasks = response.data;
      } else if (Array.isArray(response)) {
        tasks = response;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        tasks = response.data.data;
      }
      
      console.log('Extracted tasks:', tasks);
      
      if (!tasks.length) {
        console.warn('No tasks found in the response');
        toast.info('No backlog items found');
        setBacklogItems([]);
        return;
      }
      
      // Log all unique statuses and types for debugging
      const allStatuses = [...new Set(tasks.map(t => t.status))];
      const allTypes = [...new Set(tasks.map(t => t.type))];
      console.log('All statuses in response:', allStatuses);
      console.log('All types in response:', allTypes);
      
      // Filter and map items
      const backlogItemsList = tasks
        .filter(item => {
          const isStory = item.type?.toLowerCase() === 'story';
          const isToDo = item.status?.toLowerCase() === 'to_do';
          return isStory && isToDo;
        })
        .map(item => {
          // First, create a clean copy of the item without the project
          const { project, ...rest } = item;
          
          // Process the project field to ensure it's a string
          let projectName = 'No Project';
          if (project) {
            if (typeof project === 'object' && project !== null) {
              projectName = project.name || 'No Project';
            } else {
              projectName = String(project);
            }
          }
          
          // Return the new object with all properties
          return {
            id: item.id,
            title: item.title || 'Untitled Task',
            description: item.description || '',
            status: 'Backlog',
            priority: item.priority || 'medium',
            storyPoints: item.storyPoints || 0,
            project: projectName,
            ...rest
          };
        });
      
      console.log('Processed backlog items:', backlogItemsList);
      setBacklogItems(backlogItemsList);
    } catch (error) {
      console.error('Error fetching backlog items:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      
      const errorMessage = error.response?.data?.message || 'Failed to load backlog items';
      toast.error(errorMessage);
      setBacklogItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveItem = async () => {
    if (!form?.title?.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      setIsLoading(true);
      
      // Prepare task data with proper type conversion
      const taskData = {
        title: String(form.title).trim(),
        description: form.description ? String(form.description).trim() : '',
        priority: ['low', 'medium', 'high', 'critical'].includes(form.priority?.toLowerCase()) 
          ? form.priority.toLowerCase() 
          : 'medium',
        storyPoints: Number(form.storyPoints) || 0,
        status: 'to_do',
        type: 'story',
        projectId: form.projectId || null
      };

      console.log('Saving task with data:', taskData);
      
      if (editingItem?.id) {
        console.log('Updating task:', editingItem.id);
        const response = await taskAPI.update(editingItem.id, taskData);
        console.log('Update response:', response);
        toast.success('Task updated successfully');
      } else {
        console.log('Creating new task');
        const response = await taskAPI.create(taskData);
        console.log('Create response:', response);
        toast.success('Task created successfully');
      }
      
      // Refresh the backlog items
      await fetchBacklogItems();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving task:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to save task';
      console.error('Error details:', error.response?.data);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id) => {
    if (!id || !window.confirm('Delete this item?')) return;
    
    try {
      setIsLoading(true);
      console.log('Deleting task:', id);
      const response = await taskAPI.delete(id);
      console.log('Delete response:', response);
      toast.success('Task deleted successfully');
      await fetchBacklogItems();
    } catch (error) {
      console.error('Error deleting task:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete task';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const moveToSprint = async (id) => {
    try {
      setIsLoading(true);
      await taskAPI.updateStatus(id, 'in_progress');
      toast.success('Task moved to Sprint!');
      await fetchBacklogItems();
    } catch (error) {
      console.error('Error moving task to sprint:', error);
      toast.error('Failed to move task to sprint');
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = { High: '#ef4444', Medium: '#f59e0b', Low: '#6b7280' };
    return colors[priority] || '#6b7280';
  };

  const getStatusColor = (status) => {
    const colors = { 
      'Backlog': '#6b7280', 
      'Ready': '#3b82f6', 
      'In Progress': '#f59e0b',
      'Done': '#10b981'
    };
    return colors[status] || '#6b7280';
  };

  if (isLoading && backlogItems.length === 0) {
    return (
      <div className="backlog-container">
        <div className="loading">Loading backlog items...</div>
      </div>
    );
  }

  return (
    <div className="backlog-container">
      <div className="backlog-header">
        <div>
          <h1>Product Backlog</h1>
          <p>Manage and prioritize development tasks</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <FiPlus /> Add Backlog Item
        </button>
      </div>

      {/* Filters */}
      <div className="backlog-filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search backlog items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {['All', 'Backlog', 'Ready', 'In Progress', 'Done'].map(status => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="backlog-stats">
        <div className="stat-item">
          <span className="stat-label">Total Items</span>
          <span className="stat-value">{backlogItems.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Story Points</span>
          <span className="stat-value">{backlogItems.reduce((sum, item) => sum + item.storyPoints, 0)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Ready for Sprint</span>
          <span className="stat-value">{backlogItems.filter(i => i.status === 'Ready').length}</span>
        </div>
      </div>

      {/* Backlog List */}
      <div className="backlog-list">
        {filteredItems.map(item => (
          <div key={item.id} className="backlog-item">
            <div className="item-header">
              <div className="item-title-section">
                <h3>{item.title}</h3>
                <p className="item-description">{item.description}</p>
              </div>
              <div className="item-actions">
                <button className="btn-icon" onClick={() => openModal(item)} title="Edit">
                  <FiEdit2 />
                </button>
                <button className="btn-icon" onClick={() => deleteItem(item.id)} title="Delete">
                  <FiTrash2 />
                </button>
                {item.status === 'Backlog' && (
                  <button className="btn-move" onClick={() => moveToSprint(item.id)} title="Move to Sprint">
                    <FiArrowRight /> Sprint
                  </button>
                )}
              </div>
            </div>
            <div className="item-meta">
              <span className="meta-badge" style={{ background: getPriorityColor(item.priority) + '20', color: getPriorityColor(item.priority) }}>
                {item.priority} Priority
              </span>
              <span className="meta-badge" style={{ background: getStatusColor(item.status) + '20', color: getStatusColor(item.status) }}>
                {item.status}
              </span>
              {item.storyPoints && (
                <span className="meta-badge story-points">
                  {item.storyPoints} SP
                </span>
              )}
              {item.project && (
                <span className="meta-project">
                  {typeof item.project === 'object' ? item.project.name || 'Project' : item.project}
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="empty-state">
            <p>No backlog items found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            boxSizing: 'border-box'
          }}
          onClick={() => setShowModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#111827' }}>
                {editingItem ? 'Edit Backlog Item' : 'Add Backlog Item'}
              </h2>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter item title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter description"
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Story Points</label>
                  <input
                    type="number"
                    min="1"
                    max="21"
                    value={form.storyPoints}
                    onChange={e => setForm({ ...form, storyPoints: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option>Backlog</option>
                    <option>Ready</option>
                    <option>In Progress</option>
                    <option>Done</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Project</label>
                  <input
                    type="text"
                    value={form.project}
                    onChange={e => setForm({ ...form, project: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveItem}>
                {editingItem ? 'Update' : 'Add'} Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Define PropTypes
Backlog.propTypes = {
  // Add any props here if needed
};


// Wrap the component with ErrorBoundary
export default function BacklogWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Backlog />
    </ErrorBoundary>
  );
}

