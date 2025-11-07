import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiCode, FiGitBranch, FiClock, FiUser, FiAlertCircle, FiCheckCircle, FiEye, FiEdit2 } from 'react-icons/fi';
import './Code.css';
import { projectAPI } from '../../services/api';

const Code = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await projectAPI.getAll();
        setRepos(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data for code files
  const [files, setFiles] = useState([
    {
      id: 1,
      name: 'App.jsx',
      path: 'src/App.jsx',
      type: 'jsx',
      lastUpdated: '2023-10-28T14:30:00',
      updatedBy: 'Alex Johnson',
      lines: 245,
      issues: 3,
      branch: 'main'
    },
    {
      id: 2,
      name: 'Dashboard.jsx',
      path: 'src/Components/Dashboard.jsx',
      type: 'jsx',
      lastUpdated: '2023-10-27T09:15:00',
      updatedBy: 'Sarah Williams',
      lines: 178,
      issues: 0,
      branch: 'feature/dashboard'
    },
    {
      id: 3,
      name: 'styles.css',
      path: 'src/styles/main.css',
      type: 'css',
      lastUpdated: '2023-10-26T16:45:00',
      updatedBy: 'Michael Chen',
      lines: 342,
      issues: 2,
      branch: 'styling/redesign'
    },
    {
      id: 4,
      name: 'api.js',
      path: 'src/services/api.js',
      type: 'javascript',
      lastUpdated: '2023-10-25T11:20:00',
      updatedBy: 'Emily Davis',
      lines: 89,
      issues: 1,
      branch: 'feature/api-integration'
    },
    {
      id: 5,
      name: 'utils.js',
      path: 'src/utils/helpers.js',
      type: 'javascript',
      lastUpdated: '2023-10-24T13:10:00',
      updatedBy: 'David Kim',
      lines: 56,
      issues: 0,
      branch: 'refactor/utils'
    },
    {
      id: 6,
      name: 'auth.js',
      path: 'src/auth/auth.js',
      type: 'javascript',
      lastUpdated: '2023-10-23T10:05:00',
      updatedBy: 'Lisa Wong',
      lines: 134,
      issues: 4,
      branch: 'feature/authentication'
    }
  ]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter and sort files
  const filteredFiles = files
    .filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.path.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || 
                          (filter === 'with-issues' && file.issues > 0) ||
                          (filter === 'no-issues' && file.issues === 0);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.lastUpdated) - new Date(a.lastUpdated);
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'most-issues') {
        return b.issues - a.issues;
      }
      return 0;
    });

  // Get file type icon
  const getFileIcon = (type) => {
    switch (type) {
      case 'jsx':
      case 'javascript':
        return <span className="file-icon jsx">JSX</span>;
      case 'css':
        return <span className="file-icon css">CSS</span>;
      case 'html':
        return <span className="file-icon html">HTML</span>;
      default:
        return <span className="file-icon">TXT</span>;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const updated = new Date(dateString);
    const diffInHours = Math.floor((now - updated) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  if (isLoading) {
    return (
      <div className="code-loading">
        <div className="loading-spinner"></div>
        <p>Loading code files...</p>
      </div>
    );
  }

  return (
    <div className="code-container">
      <div className="code-header">
        <div>
          <h2>Code Repository</h2>
          <p>Browse and manage your project's source code</p>
        </div>
        <button className="btn btn-primary">
          <FiCode className="btn-icon" />
          <span>New File</span>
        </button>
      </div>

      <div className="code-toolbar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <FiFilter className="filter-icon" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Files</option>
            <option value="with-issues">With Issues</option>
            <option value="no-issues">No Issues</option>
          </select>
        </div>

        <div className="sort-group">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Recently Updated</option>
            <option value="name">Name (A-Z)</option>
            <option value="most-issues">Most Issues</option>
          </select>
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="empty-state">
          <FiCode className="empty-icon" size={48} />
          <h3>No files found</h3>
          <p>Try adjusting your search or create a new file</p>
          <button className="btn btn-primary">
            <FiCode className="btn-icon" />
            <span>New File</span>
          </button>
        </div>
      ) : (
        <div className="code-files">
          <div className="files-header">
            <div className="header-name">Name</div>
            <div className="header-branch">Branch</div>
            <div className="header-updated">Last Updated</div>
            <div className="header-issues">Issues</div>
            <div className="header-actions">Actions</div>
          </div>
          
          <div className="files-list">
            {filteredFiles.map((file) => (
              <div key={file.id} className="file-item">
                <div className="file-info">
                  {getFileIcon(file.type)}
                  <div className="file-details">
                    <div className="file-name">{file.name}</div>
                    <div className="file-path">{file.path}</div>
                  </div>
                </div>
                
                <div className="file-branch">
                  <FiGitBranch className="branch-icon" />
                  <span>{file.branch}</span>
                </div>
                
                <div className="file-updated">
                  <div className="updated-time">{formatTimeAgo(file.lastUpdated)}</div>
                  <div className="updated-by">by {file.updatedBy}</div>
                </div>
                
                <div className="file-issues">
                  {file.issues > 0 ? (
                    <span className="issues-badge has-issues">
                      <FiAlertCircle className="issues-icon" />
                      {file.issues} {file.issues === 1 ? 'issue' : 'issues'}
                    </span>
                  ) : (
                    <span className="issues-badge no-issues">
                      <FiCheckCircle className="issues-icon" />
                      No issues
                    </span>
                  )}
                </div>
                
                <div className="file-actions">
                  <button className="btn-icon" title="View">
                    <FiEye size={16} />
                  </button>
                  <button className="btn-icon" title="Edit">
                    <FiEdit2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Code;