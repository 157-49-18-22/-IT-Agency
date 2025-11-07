import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiChevronDown, FiRefreshCw, FiPlay, 
  FiPause, FiExternalLink, FiGitBranch, FiClock, FiUser, FiCheckCircle, 
  FiXCircle, FiAlertCircle, FiGitCommit, FiGitPullRequest } from 'react-icons/fi';
import './Deployment.css';
import { projectAPI } from '../../services/api';

const Deployment = () => {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await projectAPI.getAll();
        setDeployments(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [environmentFilter, setEnvironmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  if (loading) return <div className="loading">Loading...</div>;

  // Mock data for deployments
  useEffect(() => {
    // Simulate API call
    const fetchDeployments = () => {
      setLoading(true);
      // Mock data
      const mockDeployments = [
        {
          id: 'deploy-001',
          project: 'E-commerce Platform',
          environment: 'Production',
          status: 'success',
          branch: 'main',
          commit: 'a1b2c3d',
          commitMessage: 'Update payment gateway integration',
          deployedBy: 'John Doe',
          deployedAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
          duration: '2m 15s',
          url: 'https://example.com',
        },
        {
          id: 'deploy-002',
          project: 'Admin Dashboard',
          environment: 'Staging',
          status: 'in-progress',
          branch: 'feature/user-management',
          commit: 'd4e5f6g',
          commitMessage: 'Add user role management',
          deployedBy: 'Jane Smith',
          deployedAt: new Date(Date.now() - 1800000), // 30 minutes ago
          duration: '1m 45s',
          progress: 65,
        },
        {
          id: 'deploy-003',
          project: 'Mobile App API',
          environment: 'Development',
          status: 'failed',
          branch: 'fix/auth-bug',
          commit: 'h7i8j9k',
          commitMessage: 'Fix authentication token expiration',
          deployedBy: 'Alex Johnson',
          deployedAt: new Date(Date.now() - 86400000), // 1 day ago
          duration: '3m 20s',
          error: 'Build failed: Test suite failed',
        },
        {
          id: 'deploy-004',
          project: 'Marketing Website',
          environment: 'Preview',
          status: 'pending',
          branch: 'update-content',
          commit: 'l1m2n3o',
          commitMessage: 'Update homepage content',
          deployedBy: 'Sarah Williams',
          deployedAt: new Date(),
          duration: '0s',
        },
        {
          id: 'deploy-005',
          project: 'E-commerce Platform',
          environment: 'Staging',
          status: 'success',
          branch: 'feature/checkout',
          commit: 'p4q5r6s',
          commitMessage: 'Implement new checkout flow',
          deployedBy: 'Mike Brown',
          deployedAt: new Date(Date.now() - 172800000), // 2 days ago
          duration: '2m 50s',
          url: 'https://staging.example.com',
        },
      ];

      setDeployments(mockDeployments);
      setFilteredDeployments(mockDeployments);
      setLoading(false);
    };

    fetchDeployments();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...deployments];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        deploy => 
          deploy.project.toLowerCase().includes(term) || 
          deploy.branch.toLowerCase().includes(term) ||
          deploy.commitMessage.toLowerCase().includes(term) ||
          deploy.deployedBy.toLowerCase().includes(term)
      );
    }
    
    // Apply environment filter
    if (environmentFilter !== 'all') {
      result = result.filter(deploy => 
        deploy.environment.toLowerCase() === environmentFilter.toLowerCase()
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(deploy => 
        deploy.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'recent') {
        return b.deployedAt - a.deployedAt;
      } else if (sortBy === 'oldest') {
        return a.deployedAt - b.deployedAt;
      } else if (sortBy === 'project') {
        return a.project.localeCompare(b.project);
      } else if (sortBy === 'environment') {
        return a.environment.localeCompare(b.environment);
      }
      return 0;
    });
    
    setFilteredDeployments(result);
  }, [searchTerm, environmentFilter, statusFilter, sortBy, deployments]);

  // Format date to relative time
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'status-badge success';
      case 'in-progress':
        return 'status-badge in-progress';
      case 'failed':
        return 'status-badge failed';
      case 'pending':
        return 'status-badge pending';
      default:
        return 'status-badge';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <FiCheckCircle className="status-icon" />;
      case 'in-progress':
        return <FiRefreshCw className="status-icon spin" />;
      case 'failed':
        return <FiXCircle className="status-icon" />;
      case 'pending':
        return <FiClock className="status-icon" />;
      default:
        return <FiAlertCircle className="status-icon" />;
    }
  };

  // Handle retry deployment
  const handleRetryDeployment = (deploymentId) => {
    console.log(`Retrying deployment ${deploymentId}`);
    // In a real app, this would trigger a new deployment
  };

  // Handle cancel deployment
  const handleCancelDeployment = (deploymentId) => {
    console.log(`Canceling deployment ${deploymentId}`);
    // In a real app, this would cancel the deployment
  };

  // Handle view deployment
  const handleViewDeployment = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="deployment-loading">
        <div className="loading-spinner"></div>
        <p>Loading deployments...</p>
      </div>
    );
  }

  return (
    <div className="deployment-container">
      <div className="deployment-header">
        <div>
          <h2>Deployments</h2>
          <p>Manage and monitor your application deployments</p>
        </div>
        <button className="btn btn-primary">
          <FiPlay className="btn-icon" /> New Deployment
        </button>
      </div>

      <div className="deployment-toolbar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search deployments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <FiFilter className="filter-icon" />
          <select 
            value={environmentFilter}
            onChange={(e) => setEnvironmentFilter(e.target.value)}
          >
            <option value="all">All Environments</option>
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
            <option value="preview">Preview</option>
          </select>
          <FiChevronDown className="chevron-icon" />
        </div>
        
        <div className="filter-group">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="in-progress">In Progress</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
          <FiChevronDown className="chevron-icon" />
        </div>
        
        <div className="sort-group">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest</option>
            <option value="project">Project (A-Z)</option>
            <option value="environment">Environment (A-Z)</option>
          </select>
          <FiChevronDown className="chevron-icon" />
        </div>
      </div>

      {filteredDeployments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FiGitCommit size={48} />
          </div>
          <h3>No deployments found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setSearchTerm('');
              setEnvironmentFilter('all');
              setStatusFilter('all');
            }}
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="deployment-list">
          {filteredDeployments.map((deploy) => (
            <div key={deploy.id} className="deployment-card">
              <div className="deployment-card-header">
                <div className="deployment-title">
                  <h3>{deploy.project}</h3>
                  <span className={getStatusBadgeClass(deploy.status)}>
                    {getStatusIcon(deploy.status)}
                    {deploy.status.charAt(0).toUpperCase() + deploy.status.slice(1)}
                  </span>
                </div>
                <div className="deployment-actions">
                  {deploy.status === 'in-progress' && (
                    <button 
                      className="btn-icon" 
                      title="Cancel Deployment"
                      onClick={() => handleCancelDeployment(deploy.id)}
                    >
                      <FiPause />
                    </button>
                  )}
                  {deploy.status === 'failed' && (
                    <button 
                      className="btn-icon" 
                      title="Retry Deployment"
                      onClick={() => handleRetryDeployment(deploy.id)}
                    >
                      <FiRefreshCw />
                    </button>
                  )}
                  {deploy.url && (
                    <button 
                      className="btn-icon" 
                      title="View Deployment"
                      onClick={() => handleViewDeployment(deploy.url)}
                    >
                      <FiExternalLink />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="deployment-details">
                <div className="deployment-meta">
                  <span className="meta-item">
                    <FiGitBranch className="meta-icon" />
                    {deploy.branch}
                  </span>
                  <span className="meta-item">
                    <FiGitCommit className="meta-icon" />
                    {deploy.commit.substring(0, 7)}
                  </span>
                  <span className="meta-item">
                    <FiUser className="meta-icon" />
                    {deploy.deployedBy}
                  </span>
                  <span className="meta-item">
                    <FiClock className="meta-icon" />
                    {formatRelativeTime(deploy.deployedAt)}
                  </span>
                  <span className="meta-item">
                    <span className="meta-label">Duration:</span> {deploy.duration}
                  </span>
                </div>
                
                <div className="deployment-commit">
                  <p>{deploy.commitMessage}</p>
                </div>
                
                {deploy.status === 'in-progress' && deploy.progress && (
                  <div className="deployment-progress">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${deploy.progress}%` }}
                    ></div>
                    <span>{deploy.progress}% complete</span>
                  </div>
                )}
                
                {deploy.status === 'failed' && deploy.error && (
                  <div className="deployment-error">
                    <FiAlertCircle className="error-icon" />
                    <span>{deploy.error}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Deployment;