import React, { useState, useEffect } from 'react';
import { 
  FiGitBranch, 
  FiGitCommit, 
  FiGitPullRequest, 
  FiGitMerge, 
  FiTag, 
  FiUser, 
  FiClock, 
  FiSearch, 
  FiFilter, 
  FiChevronDown, 
  FiPlus, 
  FiRefreshCw, 
  FiMoreVertical,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiGitPullRequest as FiPr,
  FiGitCommit as FiCommit,
  FiGitBranch as FiBranch,
  FiTag as FiVersionTag,
  FiUser as FiAuthor,
  FiClock as FiTime,
  FiMessageSquare as FiMessage
} from 'react-icons/fi';
import './Version.css';
import { projectAPI } from '../../services/api';

const Version = () => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await projectAPI.getAll();
        setVersions(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  const [versions, setVersions] = useState([]);
  const [filteredVersions, setFilteredVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    author: 'all',
    branch: 'all'
  });
  const [expandedVersion, setExpandedVersion] = useState(null);
  const [branches, setBranches] = useState(['main', 'develop', 'feature/new-ui']);
  const [authors, setAuthors] = useState(['John Doe', 'Jane Smith', 'Alex Johnson']);

  // Mock data for versions
  useEffect(() => {
    const mockVersions = [
      {
        id: 'v1.2.0',
        type: 'release',
        title: 'Release v1.2.0',
        description: 'Major update with new features and improvements',
        status: 'stable',
        author: 'John Doe',
        branch: 'main',
        timestamp: '2023-06-15T14:30:00Z',
        changes: [
          { id: 'c1', type: 'feature', title: 'Add user profile page', author: 'John Doe', timestamp: '2023-06-14T10:15:00Z' },
          { id: 'c2', type: 'fix', title: 'Fix login authentication issue', author: 'Jane Smith', timestamp: '2023-06-13T16:45:00Z' },
          { id: 'c3', type: 'improvement', title: 'Enhance dashboard performance', author: 'Alex Johnson', timestamp: '2023-06-12T11:20:00Z' }
        ]
      },
      {
        id: 'v1.1.3',
        type: 'hotfix',
        title: 'Hotfix v1.1.3',
        description: 'Critical bug fixes for production',
        status: 'stable',
        author: 'Jane Smith',
        branch: 'hotfix/v1.1.3',
        timestamp: '2023-06-10T09:15:00Z',
        changes: [
          { id: 'h1', type: 'fix', title: 'Fix payment processing error', author: 'Jane Smith', timestamp: '2023-06-09T14:30:00Z' },
          { id: 'h2', type: 'fix', title: 'Resolve session timeout issue', author: 'John Doe', timestamp: '2023-06-09T10:45:00Z' }
        ]
      },
      {
        id: 'v1.1.2',
        type: 'release',
        title: 'Release v1.1.2',
        description: 'Minor update with bug fixes',
        status: 'stable',
        author: 'Alex Johnson',
        branch: 'main',
        timestamp: '2023-06-05T11:30:00Z',
        changes: [
          { id: 'f1', type: 'fix', title: 'Fix mobile navigation menu', author: 'Alex Johnson', timestamp: '2023-06-04T16:20:00Z' },
          { id: 'f2', type: 'fix', title: 'Resolve form validation error', author: 'John Doe', timestamp: '2023-06-03T09:10:00Z' },
          { id: 'f3', type: 'improvement', title: 'Optimize image loading', author: 'Jane Smith', timestamp: '2023-06-02T14:55:00Z' }
        ]
      },
      {
        id: 'v1.1.1',
        type: 'hotfix',
        title: 'Hotfix v1.1.1',
        description: 'Emergency security patch',
        status: 'stable',
        author: 'John Doe',
        branch: 'hotfix/v1.1.1',
        timestamp: '2023-05-28T16:45:00Z',
        changes: [
          { id: 's1', type: 'security', title: 'Patch security vulnerability in auth', author: 'John Doe', timestamp: '2023-05-28T15:30:00Z' }
        ]
      },
      {
        id: 'v1.1.0',
        type: 'release',
        title: 'Release v1.1.0',
        description: 'New features and enhancements',
        status: 'stable',
        author: 'Jane Smith',
        branch: 'main',
        timestamp: '2023-05-20T13:15:00Z',
        changes: [
          { id: 'n1', type: 'feature', title: 'Add dark mode', author: 'Jane Smith', timestamp: '2023-05-19T11:25:00Z' },
          { id: 'n2', type: 'feature', title: 'Implement file upload', author: 'Alex Johnson', timestamp: '2023-05-18T14:40:00Z' },
          { id: 'n3', type: 'improvement', title: 'Enhance search functionality', author: 'John Doe', timestamp: '2023-05-17T10:15:00Z' },
          { id: 'n4', type: 'fix', title: 'Fix minor UI bugs', author: 'Jane Smith', timestamp: '2023-05-16T16:30:00Z' }
        ]
      },
      {
        id: 'v1.0.1',
        type: 'hotfix',
        title: 'Hotfix v1.0.1',
        description: 'Critical bug fixes for initial release',
        status: 'stable',
        author: 'Alex Johnson',
        branch: 'hotfix/v1.0.1',
        timestamp: '2023-05-10T10:30:00Z',
        changes: [
          { id: 'i1', type: 'fix', title: 'Resolve database connection issue', author: 'Alex Johnson', timestamp: '2023-05-09T15:20:00Z' },
          { id: 'i2', type: 'fix', title: 'Fix email notification', author: 'John Doe', timestamp: '2023-05-09T11:45:00Z' }
        ]
      },
      {
        id: 'v1.0.0',
        type: 'release',
        title: 'Initial Release v1.0.0',
        description: 'First stable release of the application',
        status: 'stable',
        author: 'John Doe',
        branch: 'main',
        timestamp: '2023-05-01T09:00:00Z',
        changes: [
          { id: 'r1', type: 'initial', title: 'Initial project setup', author: 'John Doe', timestamp: '2023-04-30T16:45:00Z' },
          { id: 'r2', type: 'feature', title: 'User authentication', author: 'John Doe', timestamp: '2023-04-28T14:30:00Z' },
          { id: 'r3', type: 'feature', title: 'Dashboard layout', author: 'Jane Smith', timestamp: '2023-04-27T11:15:00Z' },
          { id: 'r4', type: 'feature', title: 'Basic CRUD operations', author: 'Alex Johnson', timestamp: '2023-04-25T13:20:00Z' }
        ]
      }
    ];

    // Simulate API call
    const timer = setTimeout(() => {
      setVersions(mockVersions);
      setFilteredVersions(mockVersions);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...versions];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(version => 
        version.id.toLowerCase().includes(term) || 
        version.title.toLowerCase().includes(term) ||
        version.description.toLowerCase().includes(term) ||
        version.author.toLowerCase().includes(term) ||
        version.branch.toLowerCase().includes(term)
      );
    }
    
    // Apply filters
    if (filters.type !== 'all') {
      result = result.filter(version => version.type === filters.type);
    }
    
    if (filters.status !== 'all') {
      result = result.filter(version => version.status === filters.status);
    }
    
    if (filters.author !== 'all') {
      result = result.filter(version => version.author === filters.author);
    }
    
    if (filters.branch !== 'all') {
      result = result.filter(version => version.branch === filters.branch);
    }
    
    setFilteredVersions(result);
  }, [versions, searchTerm, filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const toggleVersionExpand = (versionId) => {
    setExpandedVersion(expandedVersion === versionId ? null : versionId);
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;
    
    return 'Just now';
  };

  const getVersionIcon = (type) => {
    switch (type) {
      case 'release':
        return <FiTag className="version-icon release" />;
      case 'hotfix':
        return <FiAlertCircle className="version-icon hotfix" />;
      case 'feature':
        return <FiGitBranch className="version-icon feature" />;
      case 'bugfix':
        return <FiGitCommit className="version-icon bugfix" />;
      default:
        return <FiGitMerge className="version-icon default" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'stable':
        return <span className="status-badge stable"><FiCheckCircle /> Stable</span>;
      case 'beta':
        return <span className="status-badge beta"><FiAlertCircle /> Beta</span>;
      case 'alpha':
        return <span className="status-badge alpha"><FiAlertCircle /> Alpha</span>;
      case 'deprecated':
        return <span className="status-badge deprecated"><FiXCircle /> Deprecated</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const getChangeTypeIcon = (type) => {
    switch (type) {
      case 'feature':
        return <FiPlus className="change-icon feature" />;
      case 'fix':
        return <FiCheckCircle className="change-icon fix" />;
      case 'improvement':
        return <FiRefreshCw className="change-icon improvement" />;
      case 'security':
        return <FiAlertCircle className="change-icon security" />;
      default:
        return <FiCommit className="change-icon default" />;
    }
  };

  const createNewVersion = () => {
    // In a real app, this would open a form/modal to create a new version
    alert('Create new version functionality would be implemented here');
  };

  const refreshVersions = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="version-loading">
        <div className="loading-spinner"></div>
        <p>Loading versions...</p>
      </div>
    );
  }

  return (
    <div className="version-container">
      <div className="version-header">
        <div>
          <h2>Version Control</h2>
          <p>Manage and track all your project versions and changes</p>
        </div>
        <div className="version-actions">
          <button className="btn btn-icon" onClick={refreshVersions}>
            <FiRefreshCw />
          </button>
          <button className="btn btn-primary" onClick={createNewVersion}>
            <FiPlus /> New Version
          </button>
        </div>
      </div>

      <div className="version-toolbar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search versions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <FiFilter className="filter-icon" />
          <select 
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="release">Releases</option>
            <option value="hotfix">Hotfixes</option>
            <option value="feature">Features</option>
          </select>
          <FiChevronDown className="chevron-icon" />
        </div>
        
        <div className="filter-group">
          <FiGitBranch className="filter-icon" />
          <select 
            value={filters.branch}
            onChange={(e) => handleFilterChange('branch', e.target.value)}
          >
            <option value="all">All Branches</option>
            {branches.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
          <FiChevronDown className="chevron-icon" />
        </div>
        
        <div className="filter-group">
          <FiUser className="filter-icon" />
          <select 
            value={filters.author}
            onChange={(e) => handleFilterChange('author', e.target.value)}
          >
            <option value="all">All Authors</option>
            {authors.map(author => (
              <option key={author} value={author}>{author}</option>
            ))}
          </select>
          <FiChevronDown className="chevron-icon" />
        </div>
      </div>

      {filteredVersions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FiGitBranch size={48} />
          </div>
          <h3>No versions found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
          <button className="btn btn-primary" onClick={() => {
            setSearchTerm('');
            setFilters({
              type: 'all',
              status: 'all',
              author: 'all',
              branch: 'all'
            });
          }}>
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="version-list">
          {filteredVersions.map(version => (
            <div key={version.id} className={`version-card ${expandedVersion === version.id ? 'expanded' : ''}`}>
              <div className="version-card-header" onClick={() => toggleVersionExpand(version.id)}>
                <div className="version-icon-container">
                  {getVersionIcon(version.type)}
                </div>
                <div className="version-info">
                  <div className="version-title">
                    <h3>{version.title}</h3>
                    {getStatusBadge(version.status)}
                  </div>
                  <p className="version-description">{version.description}</p>
                  <div className="version-meta">
                    <span><FiUser size={14} /> {version.author}</span>
                    <span><FiGitBranch size={14} /> {version.branch}</span>
                    <span><FiClock size={14} /> {getRelativeTime(version.timestamp)}</span>
                  </div>
                </div>
                <div className="version-actions">
                  <button className="btn btn-icon">
                    <FiMoreVertical />
                  </button>
                </div>
              </div>
              
              {expandedVersion === version.id && (
                <div className="version-details">
                  <div className="version-changes">
                    <h4>Changes in this version</h4>
                    <ul className="change-list">
                      {version.changes.map(change => (
                        <li key={change.id} className="change-item">
                          <div className="change-type">
                            {getChangeTypeIcon(change.type)}
                            <span className="change-type-label">{change.type}</span>
                          </div>
                          <div className="change-details">
                            <div className="change-title">{change.title}</div>
                            <div className="change-meta">
                              <span><FiUser size={12} /> {change.author}</span>
                              <span><FiClock size={12} /> {getRelativeTime(change.timestamp)}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="version-actions-footer">
                    <button className="btn btn-outline">
                      <FiPr size={16} /> Create Pull Request
                    </button>
                    <div className="version-timestamp">
                      <FiClock size={14} /> {formatDate(version.timestamp)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Version;