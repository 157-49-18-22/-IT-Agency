import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiDownload, FiEye, FiEdit2, FiLink, FiClock, FiUser, FiLayers } from 'react-icons/fi';
import './Prototypes.css';
import { deliverableAPI } from '../../services/api';

const Prototypes = () => {
  const [prototypes, setPrototypes] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await deliverableAPI.getAll({ stage: 'UI/UX', type: 'Prototype' });
        setPrototypes(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) return <div className="loading">Loading...</div>;

  // OLD Mock data - REMOVED
  const oldPrototypes = [
    {
      id: 1,
      title: 'E-commerce App Flow',
      description: 'Complete user flow for the e-commerce mobile application',
      status: 'in-review',
      version: '1.2.0',
      updatedAt: '2023-10-15',
      updatedBy: 'Alex Johnson',
      screens: 24,
      link: 'https://example.com/prototype1',
      thumbnail: 'https://via.placeholder.com/300x180/4299e1/ffffff?text=E-commerce+App'
    },
    {
      id: 2,
      title: 'Dashboard Redesign',
      description: 'New admin dashboard with analytics and reporting features',
      status: 'approved',
      version: '2.0.0',
      updatedAt: '2023-10-10',
      updatedBy: 'Sarah Williams',
      screens: 18,
      link: 'https://example.com/prototype2',
      thumbnail: 'https://via.placeholder.com/300x180/48bb78/ffffff?text=Dashboard'
    },
    {
      id: 3,
      title: 'Onboarding Experience',
      description: 'New user onboarding flow with interactive tutorials',
      status: 'in-progress',
      version: '0.5.0',
      updatedAt: '2023-10-05',
      updatedBy: 'Michael Chen',
      screens: 12,
      link: 'https://example.com/prototype3',
      thumbnail: 'https://via.placeholder.com/300x180/ed8936/ffffff?text=Onboarding'
    },
    {
      id: 4,
      title: 'Mobile Navigation',
      description: 'Redesigned mobile navigation with bottom tabs',
      status: 'needs-review',
      version: '1.1.0',
      updatedAt: '2023-09-28',
      updatedBy: 'Emily Davis',
      screens: 8,
      link: 'https://example.com/prototype4',
      thumbnail: 'https://via.placeholder.com/300x180/9f7aea/ffffff?text=Mobile+Nav'
    }
  ];

  // Filter and sort prototypes
  const filteredPrototypes = prototypes
    .filter(proto => {
      const matchesSearch = proto.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proto.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || proto.status === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.updatedAt) - new Date(b.updatedAt);
      } else if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'in-review':
        return 'status-review';
      case 'needs-review':
        return 'status-pending';
      case 'in-progress':
        return 'status-progress';
      default:
        return 'status-draft';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status label
  const getStatusLabel = (status) => {
    return status
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="prototypes-loading">
        <div className="loading-spinner"></div>
        <p>Loading prototypes...</p>
      </div>
    );
  }

  return (
    <div className="prototypes-container">
      <div className="prototypes-header">
        <div>
          <h2>Prototypes</h2>
          <p>Manage and review interactive prototypes for your projects</p>
        </div>
        <Link to="/uiux/prototypes/new" className="btn btn-primary">
          <span>+ New Prototype</span>
        </Link>
      </div>

      <div className="prototypes-toolbar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search prototypes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <FiFilter className="filter-icon" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="in-review">In Review</option>
            <option value="needs-review">Needs Review</option>
            <option value="in-progress">In Progress</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="sort-group">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {filteredPrototypes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FiLayers size={48} />
          </div>
          <h3>No prototypes found</h3>
          <p>Try adjusting your search or create a new prototype</p>
          <Link to="/uiux/prototypes/new" className="btn btn-primary">
            Create Prototype
          </Link>
        </div>
      ) : (
        <div className="prototypes-grid">
          {filteredPrototypes.map((proto) => (
            <div key={proto.id} className="prototype-card">
              <div className="prototype-thumbnail">
                <img src={proto.thumbnail} alt={proto.title} />
                <div className={`status-badge ${getStatusColor(proto.status)}`}>
                  {getStatusLabel(proto.status)}
                </div>
                <a href={proto.link} className="preview-overlay" target="_blank" rel="noopener noreferrer">
                  View Prototype
                </a>
              </div>
              <div className="prototype-details">
                <div className="prototype-header">
                  <h3>{proto.title}</h3>
                  <span className="version">v{proto.version}</span>
                </div>
                <p className="description">{proto.description}</p>
                
                <div className="prototype-meta">
                  <div className="meta-item">
                    <FiClock className="meta-icon" />
                    <span>{formatDate(proto.updatedAt)}</span>
                  </div>
                  <div className="meta-item">
                    <FiUser className="meta-icon" />
                    <span>{proto.updatedBy}</span>
                  </div>
                  <div className="meta-item">
                    <FiLayers className="meta-icon" />
                    <span>{proto.screens} screens</span>
                  </div>
                </div>
                
                <div className="prototype-actions">
                  <a 
                    href={proto.link} 
                    className="btn btn-outline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FiEye size={16} />
                    <span>Preview</span>
                  </a>
                  <Link to={`/uiux/prototypes/edit/${proto.id}`} className="btn btn-outline">
                    <FiEdit2 size={16} />
                    <span>Edit</span>
                  </Link>
                  <button className="btn btn-icon" title="Copy link">
                    <FiLink size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Prototypes;