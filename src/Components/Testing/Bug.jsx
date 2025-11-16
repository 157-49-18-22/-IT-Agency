import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiFilter, 
  FiPlus, 
  FiAlertTriangle, 
  FiClock, 
  FiCheck, 
  FiX, 
  FiUser,
  FiSave,
  FiAlertCircle,
  FiChevronDown
} from 'react-icons/fi';
import './Bug.css';
import bugAPI from '../../services/bugAPI';

// New Bug Form Component
const NewBugForm = ({ onSave, onCancel, projects, users }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    steps_to_reproduce: '',
    expected_result: '',
    actual_result: '',
    priority: 'medium',
    severity: 'medium',
    status: 'open',
    project_id: projects[0]?.id || '',
    assigned_to: users[0]?.id || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await onSave(formData);
      // Reset form on successful save
      setFormData({
        title: '',
        description: '',
        steps_to_reproduce: '',
        expected_result: '',
        actual_result: '',
        priority: 'medium',
        severity: 'medium',
        status: 'open',
        project_id: projects[0]?.id || '',
        assigned_to: users[0]?.id || ''
      });
    } catch (err) {
      setError(err.message || 'Failed to save bug report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="new-bug-form">
      <h3>Report New Bug</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title <span className="text-danger">*</span></label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
            rows="3"
          />
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Severity</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="form-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Steps to Reproduce</label>
          <textarea
            name="steps_to_reproduce"
            value={formData.steps_to_reproduce}
            onChange={handleChange}
            className="form-control"
            rows="3"
            placeholder="1. Step one...\n2. Step two..."
          />
        </div>

        <div className="form-group">
          <label>Expected Result</label>
          <textarea
            name="expected_result"
            value={formData.expected_result}
            onChange={handleChange}
            className="form-control"
            rows="2"
          />
        </div>

        <div className="form-group">
          <label>Actual Result</label>
          <textarea
            name="actual_result"
            value={formData.actual_result}
            onChange={handleChange}
            className="form-control"
            rows="2"
          />
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>Project</label>
              <select
                name="project_id"
                value={formData.project_id}
                onChange={handleChange}
                className="form-select"
                required
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>Assign To</label>
              <select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                className="form-select"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <FiX className="me-1" /> Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="me-1" /> Save Bug Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const Bug = () => {
  const [bugs, setBugs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewBugForm, setShowNewBugForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bugsRes, projectsRes, usersRes] = await Promise.all([
          bugAPI.getAll(),
          // Replace with your actual API calls for projects and users
          Promise.resolve({ data: [{ id: 1, name: 'Project 1' }] }),
          Promise.resolve({ data: [{ id: 1, name: 'User 1' }] })
        ]);
        
        setBugs(bugsRes.data || []);
        setProjects(projectsRes.data || []);
        setUsers(usersRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const handleSaveBug = async (bugData) => {
    try {
      const response = await bugAPI.create(bugData);
      setBugs(prev => [response.data, ...prev]);
      setShowNewBugForm(false);
      return response.data;
    } catch (err) {
      console.error('Error saving bug:', err);
      throw new Error('Failed to save bug report');
    }
  };

  const handleNewBugClick = () => {
    setShowNewBugForm(true);
    window.scrollTo(0, 0); // Scroll to top when opening the form
  };

  if (isLoading) return <div className="loading">Loading...</div>;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return 'badge bg-primary';
      case 'in_progress':
        return 'badge bg-info text-dark';
      case 'resolved':
        return 'badge bg-success';
      case 'closed':
        return 'badge bg-secondary';
      case 'reopened':
        return 'badge bg-warning text-dark';
      default:
        return 'badge bg-secondary';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'critical':
        return 'badge bg-danger';
      case 'high':
        return 'badge bg-warning text-dark';
      case 'medium':
        return 'badge bg-info text-dark';
      case 'low':
      default:
        return 'badge bg-secondary';
    }
  };

  const filteredBugs = bugs.filter(bug => {
    if (!bug) return false;
    
    const matchesSearch = bug.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bug.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bug.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || bug.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="bug-container">
      <div className="bug-header">
        <h2>Bugs</h2>
        {!showNewBugForm && (
          <button 
            className="btn btn-primary"
            onClick={handleNewBugClick}
          >
            <FiPlus /> Report New Bug
          </button>
        )}
      </div>

      {showNewBugForm ? (
        <div className="bug-form-container">
          <NewBugForm 
            onSave={handleSaveBug}
            onCancel={() => setShowNewBugForm(false)}
            projects={projects}
            users={users}
          />
        </div>
      ) : (
        <div className="bug-content">
          <div className="bug-toolbar">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search bugs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="filters">
              <div className="filter-group">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="reopened">Reopened</option>
                </select>
              </div>
              
              <div className="filter-group">
                <select 
                  value={priorityFilter} 
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bugs-list">
            {filteredBugs.length === 0 ? (
              <div className="no-bugs">
                <FiAlertTriangle className="no-bugs-icon" />
                <p>No bugs found</p>
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' ? (
                  <button 
                    className="btn btn-link"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setPriorityFilter('all');
                    }}
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Reported</th>
                      <th>Assigned To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBugs.map(bug => (
                      <tr key={bug.id} className="bug-row" onClick={() => {/* Add click handler for bug details */}}>
                        <td>#{bug.id}</td>
                        <td>
                          <div className="bug-title">{bug.title}</div>
                          {bug.description && (
                            <div className="bug-description text-muted">
                              {bug.description.length > 100 
                                ? `${bug.description.substring(0, 100)}...` 
                                : bug.description}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={getStatusBadge(bug.status)}>
                            {bug.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <span className={getPriorityBadge(bug.priority)}>
                            {bug.priority}
                          </span>
                        </td>
                        <td>
                          {new Date(bug.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          {users.find(u => u.id === bug.assigned_to)?.name || 'Unassigned'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Bug;