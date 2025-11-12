import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiClock, FiAlertCircle, FiDownload, FiMessageCircle, FiFileText } from 'react-icons/fi';
import './ClientDashboard.css';
import { projectAPI, dashboardAPI } from '../../services/api';

export default function ClientDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await projectAPI.getAll();
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      setProject({
        id: 1,
        name: 'E-commerce Website Redesign',
        client: 'FashionHub Inc.',
        currentStage: 2, // 1=UI/UX, 2=Development, 3=Testing
        overallProgress: 65,
        stages: {
          uiux: { status: 'Completed', progress: 100, startDate: '2024-10-15', endDate: '2024-11-05' },
          development: { status: 'In Progress', progress: 60, startDate: '2024-11-06', endDate: '2024-12-15' },
          testing: { status: 'Not Started', progress: 0, startDate: null, endDate: null }
        },
        milestones: [
          { id: 1, name: 'Wireframes Approved', date: '2024-10-20', status: 'Completed' },
          { id: 2, name: 'Design System Ready', date: '2024-11-05', status: 'Completed' },
          { id: 3, name: 'Frontend Complete', date: '2024-11-30', status: 'Pending' },
          { id: 4, name: 'Backend Complete', date: '2024-12-15', status: 'Pending' },
          { id: 5, name: 'UAT Complete', date: '2024-12-25', status: 'Pending' }
        ],
        pendingApprovals: 2,
        newDeliverables: 3,
        unreadMessages: 5
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading || !project) {
    return <div className="loading">Loading client data...</div>;
  }

  // Default values to prevent null reference errors
  const clientData = {
    name: project?.client || 'Client',
    projects: project?.milestones || [],
    completedProjects: project?.milestones.filter(milestone => milestone.status === 'Completed').length || 0,
    totalInvestment: 100000, // Replace with actual data
    upcomingMilestones: project?.milestones.filter(milestone => milestone.status !== 'Completed') || []
  };

  const getStageStatus = (stageNum) => {
    if (project.currentStage > stageNum) return 'completed';
    if (project.currentStage === stageNum) return 'active';
    return 'pending';
  };

  return (
    <div className="client-dashboard">
      <div className="client-header">
        <div>
          <h1>Welcome back, {clientData.name}!</h1>
          <p>{clientData.completedProjects}</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline"><FiMessageCircle /> Contact Team</button>
          <button className="btn-primary"><FiDownload /> Download Reports</button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon pending"><FiClock /></div>
          <div className="stat-content">
            <div className="stat-value">{project.pendingApprovals}</div>
            <div className="stat-label">Pending Approvals</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><FiFileText /></div>
          <div className="stat-content">
            <div className="stat-value">{project.newDeliverables}</div>
            <div className="stat-label">New Deliverables</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info"><FiMessageCircle /></div>
          <div className="stat-content">
            <div className="stat-value">{project.unreadMessages}</div>
            <div className="stat-label">Unread Messages</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon primary"><FiCheckCircle /></div>
          <div className="stat-content">
            <div className="stat-value">{project.overallProgress}%</div>
            <div className="stat-label">Overall Progress</div>
          </div>
        </div>
      </div>

      {/* Project Progress */}
      <div className="progress-section">
        <h2>Project Progress</h2>
        <div className="overall-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${project.overallProgress}%` }}></div>
          </div>
          <span className="progress-text">{project.overallProgress}% Complete</span>
        </div>
      </div>

      {/* Stage Timeline */}
      <div className="stage-timeline">
        <h2>Project Stages</h2>
        <div className="stages">
          <div className={`stage ${getStageStatus(1)}`}>
            <div className="stage-number">1</div>
            <div className="stage-content">
              <h3>UI/UX Design</h3>
              <div className="stage-progress">
                <div className="progress-bar small">
                  <div className="progress-fill" style={{ width: `${project.stages.uiux.progress}%` }}></div>
                </div>
                <p>{clientData.projects.length}</p>
              </div>
              <div className="stage-status">{project.stages.uiux.status}</div>
              {project.stages.uiux.endDate && (
                <div className="stage-date">Completed: {project.stages.uiux.endDate}</div>
              )}
            </div>
          </div>

          <div className="stage-connector"></div>

          <div className={`stage ${getStageStatus(2)}`}>
            <div className="stage-number">2</div>
            <div className="stage-content">
              <h3>Development</h3>
              <div className="stage-progress">
                <div className="progress-bar small">
                  <div className="progress-fill" style={{ width: `${project.stages.development.progress}%` }}></div>
                </div>
                <span>{project.stages.development.progress}%</span>
              </div>
              <div className="stage-status">{project.stages.development.status}</div>
              {project.stages.development.endDate && (
                <div className="stage-date">Expected: {project.stages.development.endDate}</div>
              )}
            </div>
          </div>

          <div className="stage-connector"></div>

          <div className={`stage ${getStageStatus(3)}`}>
            <div className="stage-number">3</div>
            <div className="stage-content">
              <h3>Testing</h3>
              <div className="stage-progress">
                <div className="progress-bar small">
                  <div className="progress-fill" style={{ width: `${project.stages.testing.progress}%` }}></div>
                </div>
                <p>${clientData.totalInvestment.toLocaleString()}</p>
              </div>
              <div className="stage-status">{project.stages.testing.status}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="milestones-section">
        <h2>Key Milestones</h2>
        <div className="milestones-list">
          {clientData.upcomingMilestones.map((milestone, index) => (
            <div key={milestone.id} className={`milestone ${milestone.status.toLowerCase()}`}>
              {clientData.upcomingMilestones.length > 0 ? (
                <div className="milestone-icon">
                  {milestone.status === 'Completed' ? <FiCheckCircle /> : <FiClock />}
                </div>
              ) : null}
              <div className="milestone-content">
                <div className="milestone-name">{milestone.name}</div>
                <div className="milestone-date">{milestone.date}</div>
              </div>
              <div className={`milestone-status ${milestone.status.toLowerCase()}`}>
                {milestone.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Recent Updates</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon"><FiCheckCircle /></div>
            <div className="activity-content">
              <div className="activity-title">Design System Approved</div>
              <div className="activity-time">2 hours ago</div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon"><FiFileText /></div>
            <div className="activity-content">
              <div className="activity-title">New deliverable uploaded: Homepage Mockups v3</div>
              <div className="activity-time">5 hours ago</div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon"><FiMessageCircle /></div>
            <div className="activity-content">
              <div className="activity-title">Message from Project Manager</div>
              <div className="activity-time">1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



