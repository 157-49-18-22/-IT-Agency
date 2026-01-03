import React, { useContext, useState } from 'react';
import {
  FaUsers,
  FaProjectDiagram,
  FaChartLine,
  FaRegClock,
  FaRegCheckCircle,
  FaArrowRight,
  FaSearch,
  FaBell,
  FaCommentDots,
  FaPlus,
  FaEllipsisV,
  FaUserTie
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ProjectContext } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

// Utility function to generate a consistent color from a string
const stringToColor = (str) => {
  if (!str) return '#ccc'; // Fallback color for empty/null strings
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 70%, 60%)`; // Using HSL for better color consistency
};

const Dashboard = () => {
  const { projects, getActiveProjects, getCompletedProjects, getProjectsByUser, isLoading: projectsLoading } = useContext(ProjectContext);
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Ensure projects is always an array
  const safeProjects = Array.isArray(projects) ? projects : [];

  // Get projects for the current user if they're a developer
  const userProjects = currentUser?.role === 'developer'
    ? getProjectsByUser(currentUser.id)
    : safeProjects;

  // Ensure userProjects is always an array
  const safeUserProjects = Array.isArray(userProjects) ? userProjects : [];

  const activeProjects = currentUser?.role === 'developer'
    ? safeUserProjects.filter(project => (project.status || '').toLowerCase() === 'in progress' || (project.status || '').toLowerCase() === 'in-progress')
    : getActiveProjects();

  const completedProjects = currentUser?.role === 'developer'
    ? safeUserProjects.filter(project => (project.status || '').toLowerCase() === 'completed')
    : getCompletedProjects();

  const totalProjects = safeUserProjects.length;
  const totalClients = [...new Set(safeUserProjects.map(p => p.clientName))].length;

  // Get recent activities (last 5 projects created)
  const recentActivities = [...safeUserProjects]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  // Get unique team members from all projects
  // Get team members from user's projects
  const allTeamMembers = [
    ...new Map(
      safeUserProjects
        .flatMap(project =>
          project.teamMembers?.map(member => ({
            id: member?.id || Math.random().toString(36).substr(2, 9),
            name: member?.name || 'Unknown',
            role: member?.role || 'Team Member'
          })) || []
        )
        .map(m => [m.id, m])
    ).values()
  ].slice(0, 4);

  // Dashboard stats
  const stats = [
    {
      title: 'Total Projects',
      value: totalProjects,
      icon: <FaProjectDiagram className="stat-icon" />,
      color: '#3498db'
    },
    {
      title: 'Active',
      value: activeProjects.length,
      icon: <FaChartLine className="stat-icon" />,
      color: '#2ecc71'
    },
    {
      title: 'Completed',
      value: completedProjects.length,
      icon: <FaRegCheckCircle className="stat-icon" />,
      color: '#9b59b6'
    },
    {
      title: 'Clients',
      value: totalClients,
      icon: <FaUsers className="stat-icon" />,
      color: '#e74c3c'
    }
  ];

  // Get status color
  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'in progress':
      case 'in-progress':
        return '#3498db';
      case 'completed':
        return '#2ecc71';
      case 'on-hold':
      case 'on hold':
        return '#f39c12';
      default: return '#95a5a6';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Show loading state while projects are being fetched
  if (projectsLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Dashboard</h1>
          <div className="date-display">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className="header-right">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search projects, clients..." />
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              <FaBell />
              <span className="badge">3</span>
            </button>
            <Link to="/projects/new" className="btn-primary">
              <FaPlus className="icon" /> New Project
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}15` }}>
              {React.cloneElement(stat.icon, { color: stat.color })}
            </div>
            <div className="stat-details">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-title">{stat.title}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        {/* Projects Section */}
        <section className="projects-section">
          <div className="section-header">
            <h2>Active Projects</h2>
            <Link to="/projects" className="view-all">
              View All <FaArrowRight size={12} />
            </Link>
          </div>

          <div className="projects-grid">
            {activeProjects.length > 0 ? (
              activeProjects.map(project => (
                <div key={project.id} className="project-card">
                  <div className="project-card-header">
                    <div className="project-title">
                      <h3>{project.projectName || 'Untitled Project'}</h3>
                      <span className="project-status" style={{ backgroundColor: getStatusColor(project.status) }}>
                        {project.status || 'draft'}
                      </span>
                    </div>
                    <button className="project-menu">
                      <FaEllipsisV />
                    </button>
                  </div>

                  <p className="project-client">
                    <FaUserTie size={14} /> {project.clientName || 'No Client'}
                  </p>

                  <div className="project-dates">
                    <span className="date">
                      <FaRegClock size={12} /> {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </span>
                    {project.budget && (
                      <span className="budget">${parseInt(project.budget, 10).toLocaleString()}</span>
                    )}
                  </div>

                  {project.teamMembers?.length > 0 && (
                    <div className="project-team">
                      <div className="team-avatars">
                        {project.teamMembers.slice(0, 3).map((member, idx) => (
                          <div
                            key={member.id || idx}
                            className="team-avatar"
                            title={member.name || 'Unknown Member'}
                            style={{ backgroundColor: stringToColor(member.name || 'Unknown') }}
                          >
                            {member.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        ))}
                        {project.teamMembers.length > 3 && (
                          <div className="team-more">+{project.teamMembers.length - 3}</div>
                        )}
                      </div>
                      <button className="btn-add-member">
                        <FaPlus size={10} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-projects">
                <p>No active projects found. <Link to="/projects/new">Create a new project</Link></p>
              </div>
            )}
          </div>
        </section>

        <div className="dashboard-sidebar">
          {/* Team Members */}
          <div className="team-section">
            <div className="section-header">
              <h3>Team Members</h3>
              <Link to="/team" className="view-all">View All</Link>
            </div>
            <div className="team-list">
              {allTeamMembers.map((member, index) => (
                <div key={member.id || index} className="team-member">
                  <div
                    className="member-avatar"
                    style={{ backgroundColor: stringToColor(member.name || 'Unknown') }}
                  >
                    {member.name?.charAt(0).toUpperCase() || 'U'}
                    <span className="status-dot online"></span>
                  </div>
                  <div className="member-info">
                    <h4>{member.name}</h4>
                    <p>{member.role}</p>
                  </div>
                  <button type="button" className="btn-message">
                    <FaCommentDots />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="recent-activities">
            <div className="section-header">
              <h3>Recent Activities</h3>
            </div>
            <ul className="activity-list">
              {recentActivities.length > 0 ? (
                recentActivities.map((project) => (
                  <li key={project.id} className="activity-item">
                    <div
                      className="activity-icon"
                      style={{ backgroundColor: getStatusColor(project.status) }}
                    >
                      <FaProjectDiagram size={14} />
                    </div>
                    <div className="activity-content">
                      <p className="activity-text">
                        <strong>New Project:</strong> {project.projectName}
                      </p>
                      <div className="activity-meta">
                        <span className="activity-client">{project.clientName}</span>
                        <span className="activity-time">{formatDate(project.createdAt)}</span>
                      </div>
                    </div>
                    <Link to={`/projects/${project.id}`} className="view-details">
                      <FaArrowRight size={12} />
                    </Link>
                  </li>
                ))
              ) : (
                <li className="no-activities">
                  No recent projects
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
