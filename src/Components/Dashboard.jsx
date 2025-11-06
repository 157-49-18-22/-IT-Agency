import React, { useState } from 'react';
import { 
  FaUsers, 
  FaLaptopCode,
  FaProjectDiagram,
  FaChartLine,
  FaServer,
  FaCodeBranch,
  FaMobileAlt,
  FaCloud,
  FaRegClock,
  FaRegCheckCircle,
  FaRegClock as FaClock,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // IT Agency specific metrics
  const stats = [
    { 
      title: 'Active Projects', 
      value: '24', 
      icon: <FaProjectDiagram className="stat-icon" />, 
      color: '#3498db',
      change: '+3 this week'
    },
    { 
      title: 'Team Members', 
      value: '18', 
      icon: <FaUsers className="stat-icon" />, 
      color: '#2ecc71',
      change: '+2 this month'
    },
    { 
      title: 'Active Clients', 
      value: '42', 
      icon: <FaUsers className="stat-icon" />, 
      color: '#9b59b6',
      change: '+5 this month'
    },
    { 
      title: 'Monthly Revenue', 
      value: '$85,420', 
      icon: <FaChartLine className="stat-icon" />, 
      color: '#e74c3c',
      change: '12.5% from last month'
    },
  ];

  // Active Projects
  const activeProjects = [
    { 
      id: 1, 
      name: 'E-commerce Platform', 
      client: 'TechNova Inc.',
      progress: 75,
      deadline: '2023-12-15',
      status: 'In Progress',
      team: ['JD', 'MS', 'AR'],
      tech: ['React', 'Node.js', 'MongoDB']
    },
    { 
      id: 2, 
      name: 'Mobile App Redesign', 
      client: 'UrbanFit',
      progress: 35,
      deadline: '2024-01-20',
      status: 'In Progress',
      team: ['AK', 'LP', 'SM'],
      tech: ['React Native', 'Firebase']
    },
    { 
      id: 3, 
      name: 'Cloud Migration', 
      client: 'Global Finance',
      progress: 90,
      deadline: '2023-11-30',
      status: 'Final Testing',
      team: ['TB', 'RJ', 'KW'],
      tech: ['AWS', 'Docker', 'Kubernetes']
    },
  ];

  // Recent Activities
  const recentActivities = [
    { 
      id: 1, 
      user: 'John Doe', 
      action: 'completed the payment gateway integration', 
      time: '2 hours ago',
      type: 'success'
    },
    { 
      id: 2, 
      user: 'Sarah Wilson', 
      action: 'requested new features for the dashboard', 
      time: '5 hours ago',
      type: 'info'
    },
    { 
      id: 3, 
      user: 'Mike Johnson', 
      action: 'reported an issue with the login page', 
      time: '1 day ago',
      type: 'warning'
    },
    { 
      id: 4, 
      user: 'Emma Davis', 
      action: 'signed a new contract for mobile app development', 
      time: '2 days ago',
      type: 'success'
    },
  ];

  // Team Members
  const teamMembers = [
    { id: 1, name: 'Alex Johnson', role: 'Lead Developer', status: 'online', avatar: 'AJ' },
    { id: 2, name: 'Maria Garcia', role: 'UI/UX Designer', status: 'online', avatar: 'MG' },
    { id: 3, name: 'David Kim', role: 'DevOps Engineer', status: 'away', avatar: 'DK' },
    { id: 4, name: 'Sarah Wilson', role: 'Project Manager', status: 'offline', avatar: 'SW' },
  ];

  return (
    <div className="dashboard-page">
        <header className="header">
          <div className="header-left">
            <h1>Dashboard</h1>
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
                onClick={() => setActiveTab('projects')}
              >
                Projects
              </button>
              <button 
                className={`tab ${activeTab === 'clients' ? 'active' : ''}`}
                onClick={() => setActiveTab('clients')}
              >
                Clients
              </button>
            </div>
          </div>
          <div className="header-actions">
            <div className="search-bar">
              <input type="text" placeholder="Search projects, clients..." />
              <button><i className="fas fa-search"></i></button>
            </div>
            <div className="notifications">
              <span className="notification-badge">3</span>
              <i className="fas fa-bell"></i>
            </div>
            <div className="user-profile">
              <div className="user-avatar">AD</div>
            </div>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-info">
                <h3>{stat.title}</h3>
                <p className="stat-value">{stat.value}</p>
                <span className="stat-change">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="content-row">
          {/* Active Projects */}
          <div className="projects-container">
            <div className="section-header">
              <h3>Active Projects</h3>
              <button className="btn-view-all">View All</button>
            </div>
            <div className="projects-list">
              {activeProjects.map(project => (
                <div key={project.id} className="project-card">
                  <div className="project-header">
                    <h4>{project.name}</h4>
                    <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="project-client">{project.client}</p>
                  
                  <div className="progress-container">
                    <div className="progress-labels">
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
                  
                  <div className="project-footer">
                    <div className="team-avatars">
                      {project.team.map((member, i) => (
                        <div key={i} className="team-avatar">{member}</div>
                      ))}
                    </div>
                    <div className="project-tech">
                      {project.tech.map((tech, i) => (
                        <span key={i} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="project-deadline">
                    <FaClock className="icon" />
                    <span>Deadline: {project.deadline}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="right-sidebar">
            {/* Team Members */}
            <div className="team-widget">
              <div className="section-header">
                <h3>Team Members</h3>
                <button className="btn-view-all">View All</button>
              </div>
              <div className="team-list">
                {teamMembers.map(member => (
                  <div key={member.id} className="team-member">
                    <div className="member-avatar">
                      {member.avatar}
                      <span className={`status-dot ${member.status}`}></span>
                    </div>
                    <div className="member-info">
                      <h4>{member.name}</h4>
                      <p>{member.role}</p>
                    </div>
                    <button className="btn-message">
                      <i className="fas fa-comment-dots"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="activity-widget">
              <div className="section-header">
                <h3>Recent Activity</h3>
              </div>
              <ul className="activity-list">
                {recentActivities.map(activity => (
                  <li key={activity.id} className={`activity-item ${activity.type}`}>
                    <div className="activity-icon">
                      {activity.type === 'success' && <FaRegCheckCircle />}
                      {activity.type === 'warning' && <FaExclamationTriangle />}
                      {activity.type === 'info' && <FaInfoCircle />}
                    </div>
                    <div className="activity-details">
                      <p><strong>{activity.user}</strong> {activity.action}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Dashboard;