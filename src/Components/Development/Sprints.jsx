import React, { useState, useEffect } from 'react';
import { FiPlay, FiPause, FiCheckCircle, FiClock, FiTrendingUp, FiCalendar, FiPlus, FiX } from 'react-icons/fi';
import './Sprints.css';
import { sprintAPI } from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Sprints() {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [isNewSprintModalOpen, setIsNewSprintModalOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
    velocity: 20,
    projectId: 1 // Default or get from context/params
  });

  useEffect(() => {
    const fetchSprints = async () => {
      try {
        setLoading(true);
        console.log('Fetching sprints...');
        
        // Try to fetch sprints directly
        try {
          const response = await sprintAPI.getAll();
          console.log('Sprints API response:', response);
          
          let sprintsData = [];
          
          // Handle different possible response structures
          if (Array.isArray(response)) {
            sprintsData = response;
          } else if (response?.data) {
            // If response has data property, check if it's an array or has a nested data property
            if (Array.isArray(response.data)) {
              sprintsData = response.data;
            } else if (response.data.data && Array.isArray(response.data.data)) {
              sprintsData = response.data.data;
            } else if (response.data.sprints && Array.isArray(response.data.sprints)) {
              sprintsData = response.data.sprints;
            }
          }
          
          console.log('Processed sprints data:', sprintsData);
          setSprints(sprintsData || []);
          
          if (sprintsData.length === 0) {
            toast.info('No sprints found. Click "Start New Sprint" to create one.');
          }
          
        } catch (apiError) {
          console.error('API Error:', apiError);
          const errorMessage = apiError.response?.data?.message || 'Failed to load sprints';
          toast.error(`Error: ${errorMessage}`);
          setSprints([]);
        }
        
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred. Please check the console for details.');
        setSprints([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSprints();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'velocity' ? parseInt(value) || 0 : value
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Sprint name is required';
    }
    
    if (!formData.goal.trim()) {
      errors.goal = 'Sprint goal is required';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      errors.endDate = 'End date must be after start date';
    }
    
    if (formData.velocity <= 0) {
      errors.velocity = 'Velocity must be greater than 0';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    setFormErrors(errors);
    
    // If there are errors, don't submit
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Format dates to ISO string
      const sprintData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        status: 'Planned', // Default status
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const response = await sprintAPI.create(sprintData);
      
      // Update local state with the new sprint
      setSprints(prevSprints => [...prevSprints, response.data]);
      
      // Close modal and show success message
      setIsNewSprintModalOpen(false);
      toast.success('Sprint created successfully! 🎉');
      
      // Reset form
      setFormData({
        name: '',
        goal: '',
        startDate: '',
        endDate: '',
        velocity: 20,
        projectId: 1
      });
      
    } catch (error) {
      console.error('Error creating sprint:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create sprint';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading sprints...</div>;

  const getProgressPercentage = (sprint) => {
    return sprint.totalPoints > 0 ? Math.round((sprint.completedPoints / sprint.totalPoints) * 100) : 0;
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': '#3b82f6',
      'Planned': '#6b7280',
      'Completed': '#10b981'
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getTaskStatusColor = (status) => {
    const colors = {
      'Done': '#10b981',
      'In Progress': '#f59e0b',
      'To Do': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="sprints-container">
      {/* New Sprint Modal */}
      {console.log('Rendering modal, isNewSprintModalOpen:', isNewSprintModalOpen)}
      {isNewSprintModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Start New Sprint</h2>
              <button className="close-button" onClick={() => setIsNewSprintModalOpen(false)}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Sprint Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={formErrors.name ? 'input-error' : ''}
                  placeholder="e.g., Sprint 1 - Feature Launch"
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="goal">Sprint Goal *</label>
                <textarea
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  className={formErrors.goal ? 'input-error' : ''}
                  rows="3"
                  placeholder="What do you want to accomplish in this sprint?"
                ></textarea>
                {formErrors.goal && <span className="error-message">{formErrors.goal}</span>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date *</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={formErrors.startDate ? 'input-error' : ''}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">End Date *</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className={formErrors.endDate ? 'input-error' : ''}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="velocity">Velocity (story points)</label>
                <input
                  type="number"
                  id="velocity"
                  name="velocity"
                  min="1"
                  value={formData.velocity}
                  onChange={handleInputChange}
                  className={formErrors.velocity ? 'input-error' : ''}
                />
                {formErrors.velocity && <span className="error-message">{formErrors.velocity}</span>}
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsNewSprintModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating...
                    </>
                  ) : 'Start Sprint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="sprints-header">
        <div>
          <h1>Sprints</h1>
          <p>Manage your development sprints and track progress</p>
        </div>
        <button
          className="btn-primary"
          onClick={(e) => {
            console.log('Button clicked, opening modal...');
            e.preventDefault();
            e.stopPropagation();
            setIsNewSprintModalOpen(true);
            console.log('isNewSprintModalOpen should be true now');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <FiPlus size={16} style={{ marginRight: '8px' }} />
          Start New Sprint
        </button>
      </div>

      {/* Active Sprint Overview */}
      {sprints.filter(s => s.status === 'Active').map(sprint => (
        <div key={sprint.id} className="active-sprint-card">
          <div className="sprint-header-row">
            <div>
              <h2>
                <FiPlay size={20} style={{ marginRight: '8px' }} />
                {sprint.name}
              </h2>
              <p className="sprint-goal">{sprint.goal}</p>
            </div>
            <div className="sprint-status-badge active">
              <FiPlay /> Active Sprint
            </div>
          </div>

          <div className="sprint-stats-grid">
            <div className="stat-box">
              <FiCalendar className="stat-icon" />
              <div>
                <div className="stat-label">Days Remaining</div>
                <div className="stat-value">{getDaysRemaining(sprint.endDate)}</div>
              </div>
            </div>
            <div className="stat-box">
              <FiTrendingUp className="stat-icon" />
              <div>
                <div className="stat-label">Progress</div>
                <div className="stat-value">{getProgressPercentage(sprint)}%</div>
              </div>
            </div>
            <div className="stat-box">
              <FiCheckCircle className="stat-icon" />
              <div>
                <div className="stat-label">Story Points</div>
                <div className="stat-value">{sprint.completedPoints || 0}/{sprint.totalPoints || 0}</div>
              </div>
            </div>
            <div className="stat-box">
              <FiClock className="stat-icon" />
              <div>
                <div className="stat-label">End Date</div>
                <div className="stat-value-small">
                  {new Date(sprint.endDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${getProgressPercentage(sprint)}%`,
                  background: 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                }}
              ></div>
            </div>
          </div>

          <div className="sprint-tasks">
            <h3>Sprint Tasks</h3>
            <div className="tasks-grid">
              {sprint.tasks && sprint.tasks.slice(0, 3).map((task, index) => (
                <div key={task.id || `task-${index}`} className="task-card">
                  <div className="task-header">
                    <span className="task-title">{task.title}</span>
                    <span className="task-points">{task.points || 0} SP</span>
                  </div>
                  <div 
                    className="task-status" 
                    style={{ 
                      background: getTaskStatusColor(task.status) + '20',
                      color: getTaskStatusColor(task.status)
                    }}
                  >
                    {task.status || 'To Do'}
                  </div>
                </div>
              ))}
              {sprint.tasks && sprint.tasks.length > 3 && (
                <div className="task-card view-more">
                  +{sprint.tasks.length - 3} more tasks
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* All Sprints List */}
      <div className="sprints-list">
        <h2>All Sprints</h2>
        {sprints.length === 0 ? (
          <div className="no-sprints">
            <p>No sprints found. Click the "Start New Sprint" button to create your first sprint.</p>
          </div>
        ) : (
          <div className="sprints-grid">
            {sprints.map(sprint => (
              <div 
                key={sprint.id} 
                className={`sprint-card ${(sprint.status || 'Planned').toLowerCase()}`}
                onClick={() => setSelectedSprint(sprint)}
              >
                <div className="sprint-card-header">
                  <div>
                    <h3 className="sprint-name">
                      {sprint.status === 'Active' && <FiPlay size={16} />}
                      {sprint.status === 'Completed' && <FiCheckCircle size={16} />}
                      {(!sprint.status || sprint.status === 'Planned') && <FiClock size={16} />}
                      {sprint.name}
                    </h3>
                    <p className="sprint-dates">
                      <FiCalendar size={14} />
                      {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`sprint-status ${(sprint.status || 'Planned').toLowerCase()}`}>
                    {sprint.status || 'Planned'}
                  </div>
                </div>

                <p className="sprint-description">{sprint.goal}</p>

                <div className="sprint-progress">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span>{getProgressPercentage(sprint)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${getProgressPercentage(sprint)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="sprint-metrics">
                  <div className="metric">
                    <span className="metric-value">
                      {sprint.completedPoints || 0}/{sprint.totalPoints || 0}
                    </span>
                    <span className="metric-label">Points</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">
                      {sprint.completedTasks || 0}/{sprint.totalTasks || 0}
                    </span>
                    <span className="metric-label">Tasks</span>
                  </div>
                  <div className="metric">
                    <span className="metric-value">
                      {getDaysRemaining(sprint.endDate)}
                    </span>
                    <span className="metric-label">Days Left</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sprint Detail Modal */}
      {selectedSprint && (
        <div className="modal-overlay" onClick={() => setSelectedSprint(null)}>
          <div className="modal-content sprint-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedSprint.name}</h2>
                <p className="modal-dates">{selectedSprint.startDate} - {selectedSprint.endDate}</p>
              </div>
              <button className="modal-close" onClick={() => setSelectedSprint(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h3>Sprint Goal</h3>
                <p>{selectedSprint.goal}</p>
              </div>

              <div className="modal-section">
                <h3>Sprint Metrics</h3>
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-label">Total Points</div>
                    <div className="metric-big-value">{selectedSprint.totalPoints}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Completed</div>
                    <div className="metric-big-value">{selectedSprint.completedPoints}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Progress</div>
                    <div className="metric-big-value">{getProgressPercentage(selectedSprint)}%</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Tasks</div>
                    <div className="metric-big-value">{selectedSprint.tasks.length}</div>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Tasks</h3>
                <div className="modal-tasks-list">
                  {selectedSprint.tasks.map(task => (
                    <div key={task.id} className="modal-task-item">
                      <div className="modal-task-info">
                        <span className="modal-task-title">{task.title}</span>
                        <span className="modal-task-points">{task.points} SP</span>
                      </div>
                      <span 
                        className="modal-task-status"
                        style={{ 
                          background: getTaskStatusColor(task.status) + '20',
                          color: getTaskStatusColor(task.status)
                        }}
                      >
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
