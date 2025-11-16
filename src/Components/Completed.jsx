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
  FiMoreHorizontal
} from 'react-icons/fi';
import './Completed.css';
import { projectAPI } from '../services/api';

const Completed = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedProjects();
  }, []);

  const fetchCompletedProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getAll({ status: 'Completed' });
      setProjects(response.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  if (loading) return <div className="loading">Loading...</div>;

  // Ensure projects is an array before filtering
  const projectsArray = Array.isArray(projects) ? projects : [];

  const filteredProjects = projectsArray.filter(project => {
    if (!project) return false;
    
    const projectName = project.name || '';
    const projectClient = project.client || '';
    const projectRating = project.rating || 0;
    const completionDate = project.completionDate ? new Date(project.completionDate) : null;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = projectName.toLowerCase().includes(searchLower) ||
                         projectClient.toLowerCase().includes(searchLower);
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'high-rating' && projectRating >= 4) ||
                         (filter === 'recent' && completionDate && completionDate > thirtyDaysAgo);
    
    return matchesSearch && matchesFilter;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.completionDate) - new Date(a.completionDate);
      case 'oldest':
        return new Date(a.completionDate) - new Date(b.completionDate);
      case 'rating':
        return b.rating - a.rating;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  const renderRating = (rating) => {
    return (
      <div className="rating">
        {[...Array(5)].map((_, i) => (
          <FiStar 
            key={i} 
            className={`star ${i < rating ? 'filled' : ''}`} 
          />
        ))}
        <span className="rating-text">{rating}.0</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="completed-projects">
        <div className="projects-header">
          <h1>Completed Projects</h1>
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
      <div className="projects-header">
        <h1>Completed Projects</h1>
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
      </div>

      {sortedProjects.length === 0 ? (
        <div className="no-projects">
          <div className="no-projects-icon">
            <FiAward size={48} />
          </div>
          <h3>No Completed Projects Found</h3>
          <p>There are no completed projects matching your criteria.</p>
        </div>
      ) : (
        <div className="projects-list">
          {sortedProjects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <div className="project-title">
                  <h3>{project.name}</h3>
                  <p className="client-name">{project.client}</p>
                </div>
                <div className="project-meta">
                  <div className="meta-item">
                    <FiCalendar className="meta-icon" />
                    <span>Completed on {new Date(project.completionDate).toLocaleDateString()}</span>
                  </div>
                  <div className="meta-item">
                    <FiClock className="meta-icon" />
                    <span>Duration: {project.duration}</span>
                  </div>
                </div>
                <div className="project-rating">
                  {renderRating(project.rating)}
                </div>
              </div>
              
              <div className="project-details">
                <div className="project-feedback">
                  <h4>Client Feedback:</h4>
                  <p className="feedback-text">"{project.feedback}"</p>
                </div>
                
                <div className="project-team">
                  <h4>Team:</h4>
                  <div className="team-avatars">
                    {project.team.map(member => (
                      <div key={member.id} className="team-member">
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className="team-avatar"
                          title={member.name}
                        />
                        <span className="member-name">{member.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="project-actions">
                <button className="btn-outline">
                  <FiCheckCircle className="btn-icon" />
                  View Details
                </button>
                <button className="btn-text">
                  <FiMoreHorizontal />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Completed;