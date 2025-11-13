import React, { useState, useEffect } from 'react';
import { FiPlay, FiPause, FiCheckCircle, FiClock, FiTrendingUp, FiCalendar, FiPlus, FiX } from 'react-icons/fi';
import './Sprints.css';
import { sprintAPI } from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Sprints() {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [isNewSprintModalOpen, setIsNewSprintModalOpen] = useState(false);
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
        const response = await sprintAPI.getAll();
        // Ensure we always set an array, even if the response is malformed
        const sprintsData = Array.isArray(response?.data) ? response.data : [];
        setSprints(sprintsData);
      } catch (error) {
        console.error('Error fetching sprints:', error);
        setSprints([]); // Reset to empty array on error
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await sprintAPI.create(formData);
      setSprints([...sprints, response.data]);
      setIsNewSprintModalOpen(false);
      toast.success('Sprint created successfully!');
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
      toast.error('Failed to create sprint');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

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
                  required
                  placeholder="e.g., Sprint 1 - Feature Launch"
                />
              </div>
              <div className="form-group">
                <label htmlFor="goal">Sprint Goal *</label>
                <textarea
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="What do you want to accomplish in this sprint?"
                ></textarea>
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
                    required
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
                    required
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
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsNewSprintModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Start Sprint
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
          onClick={() => setIsNewSprintModalOpen(true)}
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
              <h2>{sprint.name}</h2>
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
                <div className="stat-value">{sprint.completedPoints}/{sprint.totalPoints}</div>
              </div>
            </div>
            <div className="stat-box">
              <FiClock className="stat-icon" />
              <div>
                <div className="stat-label">End Date</div>
                <div className="stat-value-small">{sprint.endDate}</div>
              </div>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${getProgressPercentage(sprint)}%` }}
              ></div>
            </div>
          </div>

          <div className="sprint-tasks">
            <h3>Sprint Tasks</h3>
            <div className="tasks-grid">
              {sprint.tasks.map(task => (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <span className="task-title">{task.title}</span>
                    <span className="task-points">{task.points} SP</span>
                  </div>
                  <div 
                    className="task-status" 
                    style={{ 
                      background: getTaskStatusColor(task.status) + '20',
                      color: getTaskStatusColor(task.status)
                    }}
                  >
                    {task.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* All Sprints List */}
      <div className="sprints-list">
        <h2>All Sprints</h2>
        <div className="sprints-grid">
          {sprints.map(sprint => (
            <div 
              key={sprint.id} 
              className={`sprint-card ${sprint.status.toLowerCase()}`}
              onClick={() => setSelectedSprint(sprint)}
            >
              <div className="sprint-card-header">
                <div>
                  <h3>{sprint.name}</h3>
                  <p className="sprint-dates">{sprint.startDate} → {sprint.endDate}</p>
                </div>
                <div 
                  className="status-badge"
                  style={{ 
                    background: getStatusColor(sprint.status) + '20',
                    color: getStatusColor(sprint.status)
                  }}
                >
                  {sprint.status}
                </div>
              </div>

              <p className="sprint-goal-text">{sprint.goal}</p>

              <div className="sprint-metrics">
                <div className="metric">
                  <span className="metric-label">Progress</span>
                  <span className="metric-value">{getProgressPercentage(sprint)}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Points</span>
                  <span className="metric-value">{sprint.completedPoints}/{sprint.totalPoints}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Tasks</span>
                  <span className="metric-value">{sprint.tasks.length}</span>
                </div>
              </div>

              <div className="sprint-progress-bar">
                <div 
                  className="sprint-progress-fill"
                  style={{ 
                    width: `${getProgressPercentage(sprint)}%`,
                    background: getStatusColor(sprint.status)
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
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
