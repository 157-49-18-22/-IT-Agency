import React, { useState } from 'react';
import { FiPlay, FiPause, FiCheckCircle, FiClock, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import './Sprints.css';

export default function Sprints() {
  const [sprints, setSprints] = useState([
    {
      id: 1,
      name: 'Sprint 1 - Authentication & Core Features',
      status: 'Active',
      startDate: '2024-11-01',
      endDate: '2024-11-14',
      goal: 'Complete user authentication and basic CRUD operations',
      totalPoints: 34,
      completedPoints: 21,
      tasks: [
        { id: 1, title: 'User Login', status: 'Done', points: 5 },
        { id: 2, title: 'JWT Implementation', status: 'Done', points: 8 },
        { id: 3, title: 'Password Reset', status: 'In Progress', points: 5 },
        { id: 4, title: 'User Profile', status: 'Done', points: 3 },
        { id: 5, title: 'API Endpoints', status: 'In Progress', points: 13 }
      ]
    },
    {
      id: 2,
      name: 'Sprint 2 - Payment & Checkout',
      status: 'Planned',
      startDate: '2024-11-15',
      endDate: '2024-11-28',
      goal: 'Implement payment gateway and checkout flow',
      totalPoints: 29,
      completedPoints: 0,
      tasks: [
        { id: 6, title: 'Stripe Integration', status: 'To Do', points: 13 },
        { id: 7, title: 'Checkout Flow', status: 'To Do', points: 8 },
        { id: 8, title: 'Order Confirmation', status: 'To Do', points: 5 },
        { id: 9, title: 'Payment Webhooks', status: 'To Do', points: 3 }
      ]
    },
    {
      id: 3,
      name: 'Sprint 0 - Setup & Planning',
      status: 'Completed',
      startDate: '2024-10-15',
      endDate: '2024-10-31',
      goal: 'Project setup and initial planning',
      totalPoints: 21,
      completedPoints: 21,
      tasks: [
        { id: 10, title: 'Project Setup', status: 'Done', points: 5 },
        { id: 11, title: 'Database Schema', status: 'Done', points: 8 },
        { id: 12, title: 'CI/CD Pipeline', status: 'Done', points: 8 }
      ]
    }
  ]);

  const [selectedSprint, setSelectedSprint] = useState(null);

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
      <div className="sprints-header">
        <div>
          <h1>Sprint Management</h1>
          <p>Plan and track development sprints</p>
        </div>
        <button className="btn-primary">
          <FiPlay /> Start New Sprint
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
