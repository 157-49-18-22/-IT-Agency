import React, { useState, useEffect, useContext } from 'react';
import { FiPlay, FiPause, FiCheckCircle, FiClock, FiTrendingUp, FiCalendar, FiPlus, FiX, FiCode } from 'react-icons/fi';
import axios from 'axios';
import './Sprints.css';
import { sprintAPI } from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ProjectContext } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';

export default function Sprints() {
  const { currentUser } = useAuth();
  const { getProjectsByUser } = useContext(ProjectContext);

  const [selectedProject, setSelectedProject] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
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
    projectId: 1 // Will be updated from selected project
  });

  // Load projects with robust fallback
  useEffect(() => {
    const fetchProjects = async () => {
      if (!currentUser?.id) return;

      try {
        setLoading(true);
        let availableProjects = [];

        // 1. Try fetching approved projects first
        try {
          const approvalsRes = await axios.get(import.meta.env.VITE_API_URL + '/approvals?status=Approved', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          const approvedData = approvalsRes.data?.data || approvalsRes.data || [];

          const projectMap = new Map();
          approvedData.forEach(approval => {
            if (approval.projectId && !projectMap.has(approval.projectId)) {
              projectMap.set(approval.projectId, {
                id: approval.projectId,
                projectName: approval.project?.name || `Project ${approval.projectId}`,
                uiuxApproved: true
              });
            }
          });
          availableProjects = Array.from(projectMap.values());
        } catch (e) {
          console.warn('Approvals fetch failed', e);
        }

        // 2. Fallback to Context/User Projects
        if (availableProjects.length === 0) {
          const userProjects = getProjectsByUser(currentUser.id);
          if (userProjects && userProjects.length > 0) {
            availableProjects = userProjects.map(p => ({
              id: p.id,
              projectName: p.name || p.projectName
            }));
          }
        }

        // 3. Fallback to ALL projects (for safety/admin)
        if (availableProjects.length === 0) {
          try {
            const allRes = await axios.get(import.meta.env.VITE_API_URL + '/projects', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const allPrjs = allRes.data?.data || allRes.data || [];
            availableProjects = allPrjs.map(p => ({
              id: p.id,
              projectName: p.name || p.projectName
            }));
          } catch (e) {
            console.error('Final fallback failed', e);
          }
        }

        console.log('Final projects for Sprint:', availableProjects);

        if (availableProjects.length > 0) {
          setMyProjects(availableProjects);
          // Set default selected project
          if (!selectedProject || !availableProjects.find(p => p.id === selectedProject.id)) {
            setSelectedProject(availableProjects[0]);
            setFormData(prev => ({ ...prev, projectId: availableProjects[0].id }));
          }
        } else {
          setMyProjects([]);
          if (!selectedProject) setSelectedProject(null);
        }
      } catch (error) {
        console.error('Error in project fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentUser, getProjectsByUser]);

  useEffect(() => {
    const fetchSprints = async () => {
      if (!selectedProject) return;

      try {
        setLoading(true);
        console.log('Fetching sprints for project:', selectedProject.id);

        try {
          const response = await sprintAPI.getSprints({ projectId: selectedProject.id });
          console.log('Sprints API response:', response);

          let sprintsData = [];

          if (Array.isArray(response)) {
            sprintsData = response;
          } else if (response?.data) {
            if (Array.isArray(response.data)) {
              sprintsData = response.data;
            } else if (response.data.data && Array.isArray(response.data.data)) {
              sprintsData = response.data.data;
            } else if (response.data.sprints && Array.isArray(response.data.sprints)) {
              sprintsData = response.data.sprints;
            }
          }

          // Data is already filtered by backend
          console.log('Sprints loaded:', sprintsData);
          setSprints(sprintsData || []);

          if (sprintsData.length === 0) {
            toast.info('No sprints found for this project. Click "Start New Sprint" to create one.');
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
  }, [selectedProject]);

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

      const response = await sprintAPI.createSprint(sprintData);

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

              {/* Project Selector */}
              <div className="form-group">
                <label htmlFor="projectSelect">Project *</label>
                {myProjects.length > 0 ? (
                  <select
                    id="projectSelect"
                    value={selectedProject?.id || ''}
                    onChange={(e) => {
                      const project = myProjects.find(p => p.id === parseInt(e.target.value));
                      setSelectedProject(project);
                      setFormData(prev => ({ ...prev, projectId: project.id }));
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      fontSize: '14px'
                    }}
                  >
                    {myProjects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.projectName || `Project ${project.id}`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ padding: '10px', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '6px', fontSize: '14px', color: '#92400e' }}>
                    No projects available. Please create a project first.
                  </div>
                )}
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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Project Selector */}
          {myProjects.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              color: 'white'
            }}>
              <FiCode size={18} />
              <select
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  const project = myProjects.find(p => p.id === parseInt(e.target.value));
                  setSelectedProject(project);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  outline: 'none',
                  padding: '4px 8px'
                }}
              >
                {myProjects.map(project => (
                  <option key={project.id} value={project.id} style={{ background: '#1f2937', color: 'white' }}>
                    {project.projectName || `Project ${project.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            className="btn-primary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsNewSprintModalOpen(true);
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
                      {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : 'Not set'} - {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'Not set'}
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
