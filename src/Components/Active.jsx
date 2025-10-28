import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiChevronDown, FiClock, FiCalendar, FiUser, FiAlertCircle, FiCheckCircle, FiPauseCircle, FiPlay, FiMoreHorizontal } from 'react-icons/fi';
import './Active.css';

const Active = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for active projects
  useEffect(() => {
    const mockProjects = [
      {
        id: 1,
        name: 'E-commerce Website Redesign',
        client: 'Fashion Hub',
        status: 'in-progress',
        priority: 'high',
        progress: 65,
        startDate: '2023-10-15',
        deadline: '2023-12-20',
        team: [
          { id: 1, name: 'John D', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
          { id: 2, name: 'Jane S', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
          { id: 3, name: 'Mike R', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
        ],
        daysLeft: 28
      },
      {
        id: 2,
        name: 'Mobile App Development',
        client: 'Tech Solutions Inc.',
        status: 'in-progress',
        priority: 'medium',
        progress: 30,
        startDate: '2023-11-01',
        deadline: '2024-01-15',
        team: [
          { id: 4, name: 'Alex K', avatar: 'https://randomuser.me/api/portraits/men/4.jpg' },
          { id: 5, name: 'Sarah M', avatar: 'https://randomuser.me/api/portraits/women/5.jpg' },
        ],
        daysLeft: 45
      },
      {
        id: 3,
        name: 'Corporate Website',
        client: 'Global Corp',
        status: 'in-progress',
        priority: 'low',
        progress: 15,
        startDate: '2023-11-10',
        deadline: '2024-02-28',
        team: [
          { id: 1, name: 'John D', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
          { id: 6, name: 'Emily T', avatar: 'https://randomuser.me/api/portraits/women/6.jpg' },
        ],
        daysLeft: 92
      }
    ];

    // Simulate API call
    const timer = setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || project.priority === filter;
    return matchesSearch && matchesFilter;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.startDate) - new Date(a.startDate);
      case 'oldest':
        return new Date(a.startDate) - new Date(b.startDate);
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in-progress':
        return <span className="status-badge in-progress"><FiPlay /> In Progress</span>;
      case 'on-hold':
        return <span className="status-badge on-hold"><FiPauseCircle /> On Hold</span>;
      case 'planning':
        return <span className="status-badge planning"><FiClock /> Planning</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="priority-badge high"><FiAlertCircle /> High</span>;
      case 'medium':
        return <span className="priority-badge medium"><FiAlertCircle /> Medium</span>;
      case 'low':
        return <span className="priority-badge low"><FiCheckCircle /> Low</span>;
      default:
        return <span className="priority-badge">{priority}</span>;
    }
  };

  if (loading) {
    return (
      <div className="active-projects">
        <div className="projects-header">
          <h1>Active Projects</h1>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading active projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="active-projects">
      <div className="projects-header">
        <h1>Active Projects</h1>
        <div className="projects-actions">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filters">
            <div className="filter-group">
              <FiFilter className="filter-icon" />
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <FiChevronDown className="dropdown-arrow" />
            </div>
            <div className="filter-group">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
              <FiChevronDown className="dropdown-arrow" />
            </div>
          </div>
        </div>
      </div>

      {sortedProjects.length === 0 ? (
        <div className="no-projects">
          <div className="no-projects-icon">
            <FiFileText size={48} />
          </div>
          <h3>No Active Projects Found</h3>
          <p>There are currently no active projects matching your criteria.</p>
          <button className="btn-primary">Create New Project</button>
        </div>
      ) : (
        <div className="projects-grid">
          {sortedProjects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>{project.name}</h3>
                <div className="project-actions">
                  <button className="icon-btn">
                    <FiMoreHorizontal />
                  </button>
                </div>
              </div>
              <p className="client-name">{project.client}</p>
              
              <div className="project-meta">
                <div className="meta-item">
                  <FiCalendar className="meta-icon" />
                  <span>{new Date(project.startDate).toLocaleDateString()} - {new Date(project.deadline).toLocaleDateString()}</span>
                </div>
                <div className="meta-item">
                  <FiClock className="meta-icon" />
                  <span>{project.daysLeft} days left</span>
                </div>
              </div>
              
              <div className="project-status">
                {getStatusBadge(project.status)}
                {getPriorityBadge(project.priority)}
              </div>
              
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
                  {project.team.map(member => (
                    <img 
                      key={member.id} 
                      src={member.avatar} 
                      alt={member.name} 
                      title={member.name}
                      className="team-avatar"
                    />
                  ))}
                </div>
                <button className="btn-outline">View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Active;