import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, 
  FaFilter, 
  FaPlus, 
  FaEllipsisV, 
  FaRegClock,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';
import './AllProjects.css';

// Mock data for projects
const mockProjects = [
  {
    id: 1,
    name: 'E-commerce Website Redesign',
    client: 'FashionHub',
    status: 'In Progress',
    progress: 65,
    startDate: '2023-10-15',
    endDate: '2023-12-30',
    priority: 'High',
    team: ['JD', 'AS', 'MK'],
    phase: 'Development'
  },
  {
    id: 2,
    name: 'Mobile Banking App',
    client: 'Global Bank',
    status: 'On Hold',
    progress: 30,
    startDate: '2023-11-01',
    endDate: '2024-02-15',
    priority: 'High',
    team: ['AS', 'RK', 'PM'],
    phase: 'UI/UX Design'
  },
  {
    id: 3,
    name: 'Corporate Website',
    client: 'TechSolutions Inc.',
    status: 'Completed',
    progress: 100,
    startDate: '2023-09-10',
    endDate: '2023-10-25',
    priority: 'Medium',
    team: ['MK', 'PM'],
    phase: 'Completed'
  },
  {
    id: 4,
    name: 'Inventory Management System',
    client: 'RetailPro',
    status: 'In Progress',
    progress: 45,
    startDate: '2023-10-20',
    endDate: '2024-01-15',
    priority: 'High',
    team: ['JD', 'RK'],
    phase: 'Development'
  },
  {
    id: 5,
    name: 'Fitness App',
    client: 'FitLife',
    status: 'Planning',
    progress: 10,
    startDate: '2023-11-15',
    endDate: '2024-03-01',
    priority: 'Medium',
    team: ['AS', 'MK'],
    phase: 'Planning'
  },
  {
    id: 6,
    name: 'Restaurant Booking System',
    client: 'DineEasy',
    status: 'In Progress',
    progress: 80,
    startDate: '2023-10-01',
    endDate: '2023-11-30',
    priority: 'Low',
    team: ['PM', 'RK'],
    phase: 'Testing'
  }
];

const AllProjects = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setProjects(mockProjects);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'in-progress') return project.status === 'In Progress' && matchesSearch;
    if (filter === 'completed') return project.status === 'Completed' && matchesSearch;
    if (filter === 'on-hold') return project.status === 'On Hold' && matchesSearch;
    if (filter === 'planning') return project.status === 'Planning' && matchesSearch;
    return matchesSearch;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.startDate) - new Date(a.startDate);
    if (sortBy === 'oldest') return new Date(a.startDate) - new Date(b.startDate);
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    return 0;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Progress':
        return <span className="status-badge in-progress"><FaSpinner className="status-icon" /> {status}</span>;
      case 'Completed':
        return <span className="status-badge completed"><FaCheckCircle className="status-icon" /> {status}</span>;
      case 'On Hold':
        return <span className="status-badge on-hold"><FaExclamationTriangle className="status-icon" /> {status}</span>;
      case 'Planning':
        return <span className="status-badge planning"><FaRegClock className="status-icon" /> {status}</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    return <span className={`priority-badge ${priority.toLowerCase()}`}>{priority}</span>;
  };

  const getPhaseBadge = (phase) => {
    return <span className={`phase-badge ${phase.toLowerCase().replace(/\s+/g, '-')}`}>{phase}</span>;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const calculateDaysLeft = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return <span className="days-left overdue">Overdue by {Math.abs(diffDays)} days</span>;
    if (diffDays === 0) return <span className="days-left due-today">Due today</span>;
    return <span className="days-left">{diffDays} days left</span>;
  };

  if (isLoading) {
    return (
      <div className="projects-loading">
        <div className="spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="all-projects">
      <div className="projects-header">
        <div className="header-left">
          <h1>All Projects</h1>
          <p>Manage and track all your projects in one place</p>
        </div>
        <Link to="/projects/create" className="new-project-btn">
          <FaPlus className="btn-icon" /> New Project
        </Link>
      </div>

      <div className="projects-toolbar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select 
              id="status-filter" 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Projects</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="planning">Planning</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-by">Sort by:</label>
            <select 
              id="sort-by" 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="projects-grid">
        {sortedProjects.length > 0 ? (
          sortedProjects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
                <div className="project-title">
                  <h3>{project.name}</h3>
                  {getStatusBadge(project.status)}
                </div>
                <div className="project-actions">
                  <button className="icon-btn">
                    <FaEllipsisV />
                  </button>
                </div>
              </div>
              
              <div className="project-client">
                <span className="label">Client:</span>
                <span className="value">{project.client}</span>
              </div>
              
              <div className="project-phase">
                <span className="label">Phase:</span>
                {getPhaseBadge(project.phase)}
              </div>
              
              <div className="project-priority">
                <span className="label">Priority:</span>
                {getPriorityBadge(project.priority)}
              </div>
              
              <div className="project-progress">
                <div className="progress-header">
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
              
              <div className="project-dates">
                <div className="date">
                  <span className="label">Start:</span>
                  <span className="value">{formatDate(project.startDate)}</span>
                </div>
                <div className="date">
                  <span className="label">Deadline:</span>
                  <span className="value">{formatDate(project.endDate)}</span>
                </div>
              </div>
              
              <div className="project-footer">
                <div className="team-avatars">
                  {project.team.map((member, index) => (
                    <div key={index} className="team-avatar">
                      {member}
                    </div>
                  ))}
                </div>
                <div className="days-left">
                  {calculateDaysLeft(project.endDate)}
                </div>
              </div>
              
              <div className="project-actions-hover">
                <button className="action-btn view">View</button>
                <button className="action-btn edit">Edit</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-projects">
            <img src="/images/no-projects.svg" alt="No projects found" />
            <h3>No projects found</h3>
            <p>Try adjusting your search or filter criteria</p>
            <Link to="/projects/create" className="create-project-btn">
              <FaPlus className="btn-icon" /> Create New Project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllProjects;