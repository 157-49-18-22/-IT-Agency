import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiAward,
  FiStar,
  FiMoreHorizontal,
  FiTrendingUp,
  FiDollarSign,
  FiTarget
} from 'react-icons/fi';
import './Completed.css';
import { projectsAPI } from '../services/api';

const Completed = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedProjects();
  }, []);

  const fetchCompletedProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getProjects({ status: 'Completed' });
      const projectsData = response.data?.data || response.data || [];
      setProjects(projectsData);
    } catch (error) {
      console.error('Error:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const projectsArray = Array.isArray(projects) ? projects : [];

  // Calculate stats
  const stats = {
    total: projectsArray.length,
    thisMonth: projectsArray.filter(p => {
      const completedDate = new Date(p.completedAt || p.actualEndDate);
      const now = new Date();
      return completedDate.getMonth() === now.getMonth() &&
        completedDate.getFullYear() === now.getFullYear();
    }).length,
    avgRating: projectsArray.length > 0
      ? (projectsArray.reduce((sum, p) => sum + (p.rating || 0), 0) / projectsArray.length).toFixed(1)
      : 0,
    highRated: projectsArray.filter(p => (p.rating || 0) >= 4).length
  };

  const filteredProjects = projectsArray.filter(project => {
    if (!project) return false;

    const projectName = project.name || '';
    const clientName = typeof project.client === 'object'
      ? (project.client?.name || project.client?.company || '')
      : (project.client || '');

    const matchesSearch = projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'high-rating') {
      return matchesSearch && (project.rating || 0) >= 4;
    }
    if (filter === 'recent') {
      const completedDate = new Date(project.completedAt || project.actualEndDate);
      const now = new Date();
      return matchesSearch &&
        completedDate.getMonth() === now.getMonth() &&
        completedDate.getFullYear() === now.getFullYear();
    }

    return matchesSearch;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.completedAt || b.actualEndDate) - new Date(a.completedAt || a.actualEndDate);
    }
    if (sortBy === 'oldest') {
      return new Date(a.completedAt || a.actualEndDate) - new Date(b.completedAt || b.actualEndDate);
    }
    if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === 'name-asc') {
      return (a.name || '').localeCompare(b.name || '');
    }
    if (sortBy === 'name-desc') {
      return (b.name || '').localeCompare(a.name || '');
    }
    return 0;
  });

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FiStar
          key={i}
          className={`star ${i <= rating ? 'filled' : ''}`}
          fill={i <= rating ? '#f6ad55' : 'none'}
        />
      );
    }
    return (
      <div className="rating">
        {stars.map((star, idx) => (
          <span key={idx}>{star}</span>
        ))}
        <span className="rating-text">{rating}.0</span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="completed-projects">
        <div className="projects-header">
          <h1>🎉 Completed Projects</h1>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading completed projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="completed-projects">
      {/* Header with Title */}
      <div className="projects-header">
        <div className="header-content">
          <h1>🎉 Completed Projects</h1>
          <p className="header-subtitle">Celebrating successful project deliveries</p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Completed</div>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">
            <FiTrendingUp />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.thisMonth}</div>
            <div className="stat-label">This Month</div>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">
            <FiStar />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.avgRating}</div>
            <div className="stat-label">Avg Rating</div>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">
            <FiAward />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.highRated}</div>
            <div className="stat-label">High Rated (4+)</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="projects-actions">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by project name or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters">
          <div className="filter-group">
            <FiFilter className="filter-icon" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Projects</option>
              <option value="high-rating">High Rating (4+ stars)</option>
              <option value="recent">Completed This Month</option>
            </select>
            <FiChevronDown className="dropdown-arrow" />
          </div>
          <div className="filter-group">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating">Highest Rated</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
            <FiChevronDown className="dropdown-arrow" />
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="projects-list">
        {sortedProjects.length > 0 ? (
          sortedProjects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <div className="project-title">
                  <div className="title-row">
                    <h3>{project.name}</h3>
                    {(project.rating || 0) >= 4 && (
                      <span className="badge badge-success">
                        <FiAward size={12} /> Top Rated
                      </span>
                    )}
                  </div>
                  <p className="client-name">
                    {typeof project.client === 'object'
                      ? (project.client?.name || project.client?.company || 'N/A')
                      : (project.client || 'N/A')}
                  </p>
                </div>
                <div className="project-rating">
                  {renderStars(project.rating || 0)}
                </div>
              </div>

              <div className="project-meta">
                <div className="meta-item">
                  <FiCalendar className="meta-icon" />
                  <span>Completed on {formatDate(project.completedAt || project.actualEndDate)}</span>
                </div>
                {project.duration && (
                  <div className="meta-item">
                    <FiClock className="meta-icon" />
                    <span>Duration: {project.duration || 'N/A'}</span>
                  </div>
                )}
                {project.budget && (
                  <div className="meta-item">
                    <FiDollarSign className="meta-icon" />
                    <span>Budget: ${parseInt(project.budget).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {project.feedback && (
                <div className="project-feedback">
                  <h4>Client Feedback:</h4>
                  <p className="feedback-text">"{project.feedback}"</p>
                </div>
              )}

              {!project.feedback && (
                <div className="project-feedback">
                  <p className="feedback-text no-feedback">No feedback provided</p>
                </div>
              )}

              <div className="project-actions">
                <Link to={`/stage-transition/${project.id}`} className="btn-outline">
                  <FiTarget className="btn-icon" />
                  View Details
                </Link>
                <button className="btn-text">
                  <FiMoreHorizontal size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-projects">
            <div className="no-projects-icon">
              <FiCheckCircle size={40} />
            </div>
            <h3>No Completed Projects Found</h3>
            <p>
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Completed projects will appear here once they are finished'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Completed;