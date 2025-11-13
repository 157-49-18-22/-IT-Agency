import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiChevronDown, FiRefreshCw, FiPlay, 
  FiPause, FiExternalLink, FiGitBranch, FiClock, FiUser, FiCheckCircle, 
  FiXCircle, FiAlertCircle, FiGitCommit, FiGitPullRequest, FiPlus } from 'react-icons/fi';
import './Deployment.css';
import { projectAPI, deploymentAPI } from '../../services/api';

// Form component for new deployments
const NewDeploymentForm = ({ onSubmit, onCancel, projects }) => {
  const [formData, setFormData] = useState({
    projectId: '',
    branch: 'main',
    environment: 'staging',
    commitHash: '',
    commitMessage: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Basic validation
      if (!formData.projectId) {
        throw new Error('Please select a project');
      }
      if (!formData.branch) {
        throw new Error('Branch is required');
      }
      
      // Call the API
      await deploymentAPI.create({
        ...formData,
        // Add any additional fields required by your API
        status: 'pending',
        deployedBy: 'current-user-id', // You'll want to get this from auth context
        startedAt: new Date().toISOString()
      });
      
      // Call the success callback
      onSubmit();
    } catch (err) {
      setError(err.message || 'Failed to create deployment');
      console.error('Deployment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>New Deployment</h3>
          <button type="button" className="close-button" onClick={(e) => onCancel(e)}>
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="projectId">Project</label>
            <select
              id="projectId"
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="environment">Environment</label>
            <select
              id="environment"
              name="environment"
              value={formData.environment}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="branch">Branch</label>
            <input
              type="text"
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              placeholder="e.g., main, develop"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="commitHash">Commit Hash (optional)</label>
            <input
              type="text"
              id="commitHash"
              name="commitHash"
              value={formData.commitHash}
              onChange={handleChange}
              placeholder="e.g., a1b2c3d"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="commitMessage">Deployment Notes (optional)</label>
            <textarea
              id="commitMessage"
              name="commitMessage"
              value={formData.commitMessage}
              onChange={handleChange}
              placeholder="Add any notes about this deployment"
              rows="3"
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className="form-error">
              <FiAlertCircle /> {error}
            </div>
          )}
          
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Deploying...' : 'Deploy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Deployment = () => {
  const [deployments, setDeployments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredDeployments, setFilteredDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewDeploymentForm, setShowNewDeploymentForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [environmentFilter, setEnvironmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch deployments and projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch deployments
        const [deploymentsRes, projectsRes] = await Promise.all([
          deploymentAPI.getAll(),
          projectAPI.getAll()
        ]);
        
        if (deploymentsRes.data) {
          setDeployments(deploymentsRes.data);
          setFilteredDeployments(deploymentsRes.data);
        }
        
        if (projectsRes.data) {
          setProjects(projectsRes.data);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        // Handle error (show toast/notification)
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

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

  // Handle new deployment
  const handleNewDeployment = () => {
    console.log('New Deployment button clicked');
    setShowNewDeploymentForm(true);
  };

  const handleDeploymentCreated = () => {
    setShowNewDeploymentForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancelDeploymentForm = () => {
    setShowNewDeploymentForm(false);
  };

  if (loading) {
    return (
      <div className="deployment-loading">
        <div className="loading-spinner"></div>
        <p>Loading deployments...</p>
      </div>
    );
  }

  console.log('Rendering Deployment component, showNewDeploymentForm:', showNewDeploymentForm);
  
  return (
    <div className="deployment-container">
      {showNewDeploymentForm && (
        <NewDeploymentForm 
          onSubmit={handleDeploymentCreated}
          onCancel={handleCancelDeploymentForm}
          projects={projects}
        />
      )}
      
      <div className="deployment-header">
        <div>
          <h2>Deployments</h2>
          <p>Manage and track your application deployments</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={handleNewDeployment}
        >
          <FiPlus className="btn-icon" />
          New Deployment
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