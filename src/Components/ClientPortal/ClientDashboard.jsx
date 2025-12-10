import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaProjectDiagram, FaCheckCircle, FaClock, FaChartLine } from 'react-icons/fa';
import './ClientDashboard.css';

const ClientDashboard = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    activeProjects: 0,
    pendingApprovals: 0,
    completedProjects: 0,
    totalProgress: 0
  });

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    // TODO: Replace with actual API call
    // const response = await clientAPI.getDashboard();

    // Mock data for demo
    const mockProjects = [
      {
        id: 1,
        name: 'E-Commerce Website',
        currentStage: 'development',
        progress: 65,
        status: 'in-progress',
        dueDate: '2024-02-15',
        pendingApprovals: 2
      },
      {
        id: 2,
        name: 'Mobile App',
        currentStage: 'ui_ux',
        progress: 30,
        status: 'in-progress',
        dueDate: '2024-03-01',
        pendingApprovals: 1
      },
      {
        id: 3,
        name: 'CRM System',
        currentStage: 'testing',
        progress: 85,
        status: 'in-progress',
        dueDate: '2024-01-30',
        pendingApprovals: 0
      }
    ];

    setProjects(mockProjects);
    setStats({
      activeProjects: mockProjects.filter(p => p.status === 'in-progress').length,
      pendingApprovals: mockProjects.reduce((sum, p) => sum + p.pendingApprovals, 0),
      completedProjects: 5,
      totalProgress: Math.round(mockProjects.reduce((sum, p) => sum + p.progress, 0) / mockProjects.length)
    });
  };

  const getStageLabel = (stage) => {
    const stages = {
      'ui_ux': 'UI/UX Design',
      'development': 'Development',
      'testing': 'Testing',
      'completed': 'Completed'
    };
    return stages[stage] || stage;
  };

  const getStageColor = (stage) => {
    const colors = {
      'ui_ux': '#9b59b6',
      'development': '#3498db',
      'testing': '#f39c12',
      'completed': '#2ecc71'
    };
    return colors[stage] || '#95a5a6';
  };

  return (
    <div className="client-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Welcome back, {currentUser?.name || 'Client'}!</h1>
        <p>Track your projects and provide feedback in real-time</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card active">
          <div className="stat-icon">
            <FaProjectDiagram />
          </div>
          <div className="stat-content">
            <h3>Active Projects</h3>
            <div className="stat-value">{stats.activeProjects}</div>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>Pending Approvals</h3>
            <div className="stat-value">{stats.pendingApprovals}</div>
          </div>
        </div>

        <div className="stat-card completed">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>Completed</h3>
            <div className="stat-value">{stats.completedProjects}</div>
          </div>
        </div>

        <div className="stat-card progress">
          <div className="stat-icon">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>Avg Progress</h3>
            <div className="stat-value">{stats.totalProgress}%</div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="projects-section">
        <div className="section-header">
          <h2>Your Projects</h2>
          <button className="btn-view-all">View All</button>
        </div>

        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>{project.name}</h3>
                <span className={`status-badge ${project.status}`}>
                  {project.status.replace('-', ' ')}
                </span>
              </div>

              {/* Stage Indicator */}
              <div className="stage-indicator">
                <div className={`stage ${project.currentStage === 'ui_ux' ? 'active' : 'completed'}`}>
                  <div className="stage-dot"></div>
                  <span>UI/UX</span>
                </div>
                <div className="stage-line"></div>
                <div className={`stage ${project.currentStage === 'development' ? 'active' : project.currentStage === 'testing' ? 'completed' : ''}`}>
                  <div className="stage-dot"></div>
                  <span>Dev</span>
                </div>
                <div className="stage-line"></div>
                <div className={`stage ${project.currentStage === 'testing' ? 'active' : ''}`}>
                  <div className="stage-dot"></div>
                  <span>Test</span>
                </div>
              </div>

              {/* Current Stage */}
              <div className="current-stage">
                <span className="stage-label">Current Stage:</span>
                <span
                  className="stage-name"
                  style={{ color: getStageColor(project.currentStage) }}
                >
                  {getStageLabel(project.currentStage)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="progress-section">
                <div className="progress-header">
                  <span>Overall Progress</span>
                  <span className="progress-percentage">{project.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${project.progress}%`,
                      backgroundColor: getStageColor(project.currentStage)
                    }}
                  ></div>
                </div>
              </div>

              {/* Project Meta */}
              <div className="project-meta">
                <div className="meta-item">
                  <FaClock />
                  <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                </div>
                {project.pendingApprovals > 0 && (
                  <div className="meta-item pending">
                    <FaCheckCircle />
                    <span>{project.pendingApprovals} Approval{project.pendingApprovals > 1 ? 's' : ''} Pending</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="project-actions">
                <button className="btn-view">View Details</button>
                <button className="btn-deliverables">Deliverables</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">📋</div>
            <div className="activity-content">
              <p><strong>New deliverable</strong> uploaded for E-Commerce Website</p>
              <span className="activity-time">2 hours ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">✅</div>
            <div className="activity-content">
              <p><strong>Approval required</strong> for Mobile App wireframes</p>
              <span className="activity-time">5 hours ago</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">🚀</div>
            <div className="activity-content">
              <p><strong>Stage transition</strong> - CRM System moved to Testing</p>
              <span className="activity-time">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
