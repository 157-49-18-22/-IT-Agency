import React, { useState, useEffect } from 'react';
import { FiClock, FiCheckCircle, FiPlay, FiPause, FiEye, FiDownload } from 'react-icons/fi';
import axios from 'axios';
import './InProgressTasks.css';

export default function InProgressTasks() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTimer, setActiveTimer] = useState(null);

  useEffect(() => {
    fetchInProgressProjects();
  }, []);

  const fetchInProgressProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      // Fetch approved approvals (these are ready for development)
      const approvalsRes = await axios.get('/api/approvals?status=Approved', config);
      const approvedApprovals = approvalsRes.data?.data || approvalsRes.data || [];

      // Group by project and mark as "In Progress"
      const projectMap = new Map();
      approvedApprovals.forEach(approval => {
        if (approval.projectId) {
          if (!projectMap.has(approval.projectId)) {
            projectMap.set(approval.projectId, {
              id: approval.projectId,
              name: approval.project?.name || `Project ${approval.projectId}`,
              approvalId: approval.id,
              approvedDate: approval.approvedAt,
              status: 'In Progress',
              progress: 0,
              attachments: [],
              startedAt: new Date().toISOString()
            });
          }
          const project = projectMap.get(approval.projectId);
          if (approval.attachments) {
            project.attachments.push(...approval.attachments);
          }
        }
      });

      setProjects(Array.from(projectMap.values()));
    } catch (error) {
      console.error('Error fetching in-progress projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTimer = (projectId) => {
    setActiveTimer(projectId);
    // TODO: Implement actual timer logic
  };

  const handlePauseTimer = () => {
    setActiveTimer(null);
    // TODO: Save time log
  };

  if (loading) {
    return (
      <div className="in-progress-tasks">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading in-progress tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="in-progress-tasks">
      <div className="tasks-header">
        <div>
          <h1>In Progress Tasks</h1>
          <p>Projects currently under development</p>
        </div>
        <div className="tasks-count">
          <FiClock className="count-icon" />
          <span>{projects.length} Active</span>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <FiClock size={64} className="empty-icon" />
          <h3>No tasks in progress</h3>
          <p>Start working on assigned tasks to see them here</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {projects.map(project => (
            <div key={project.id} className="task-card">
              <div className="task-header">
                <div>
                  <h3>{project.name}</h3>
                  <span className="task-meta">
                    Started: {new Date(project.startedAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="status-badge in-progress">
                  <FiClock /> In Progress
                </span>
              </div>

              <div className="task-progress">
                <div className="progress-info">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="task-details">
                <div className="detail-item">
                  <span className="detail-label">Design Files:</span>
                  <span className="detail-value">{project.attachments.length} files</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Approved:</span>
                  <span className="detail-value">
                    {new Date(project.approvedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="design-files-preview">
                <h4>Design References</h4>
                <div className="files-list">
                  {project.attachments.slice(0, 3).map((file, idx) => (
                    <div key={idx} className="file-item">
                      <span className="file-type">{file.type}</span>
                      <span className="file-name">{file.name}</span>
                      <button
                        className="file-action"
                        onClick={() => file.url && window.open(file.url, '_blank')}
                      >
                        <FiEye />
                      </button>
                    </div>
                  ))}
                  {project.attachments.length > 3 && (
                    <div className="more-files">
                      +{project.attachments.length - 3} more
                    </div>
                  )}
                </div>
              </div>

              <div className="task-timer">
                {activeTimer === project.id ? (
                  <button 
                    className="timer-btn pause"
                    onClick={handlePauseTimer}
                  >
                    <FiPause /> Pause Timer
                  </button>
                ) : (
                  <button 
                    className="timer-btn start"
                    onClick={() => handleStartTimer(project.id)}
                  >
                    <FiPlay /> Start Timer
                  </button>
                )}
              </div>

              <div className="task-actions">
                <button className="btn-secondary">
                  <FiDownload /> Download Files
                </button>
                <button className="btn-primary">
                  <FiCheckCircle /> Mark Complete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
