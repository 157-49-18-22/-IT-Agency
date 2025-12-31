import React, { useState, useEffect, useContext, useCallback } from 'react';
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
  FiXCircle,
  FiCheckCircle,
  FiLoader
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Bug.css';
import bugAPI from '../../services/bugAPI';
import { projectsAPI } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';



// New Bug Form Component
const NewBugForm = ({ onSave, onCancel, projects = [], users = [] }) => {
  const { user } = useContext(AuthContext);
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
      // Add reported_by from the current user
      const bugData = {
        ...formData,
        reported_by: user?.id
      };

      const response = await bugAPI.create(bugData);

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

      toast.success('Bug report created successfully!');

      // Notify parent component about the successful save
      if (onSave) {
        onSave(response.data);
      }

    } catch (err) {
      console.error('Error creating bug:', err);
      const errorMessage = err?.message || 'Failed to save bug report';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="new-bug-form">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Report New Bug</h3>
        <button
          type="button"
          className="btn btn-link text-decoration-none"
          onClick={onCancel}
        >
          <FiX size={20} />
        </button>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <FiAlertCircle className="me-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
        <div className="mb-3">
          <label htmlFor="bugTitle" className="form-label">
            Title <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="bugTitle"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="form-control"
            required
            placeholder="Enter a descriptive title"
          />
          <div className="invalid-feedback">
            Please provide a title for the bug.
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="bugDescription" className="form-label">
            Description
          </label>
          <textarea
            id="bugDescription"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
            rows="3"
            placeholder="Provide a detailed description of the bug"
          />
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label htmlFor="bugPriority" className="form-label">
              Priority
            </label>
            <select
              id="bugPriority"
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
          <div className="col-md-6">
            <label htmlFor="bugSeverity" className="form-label">
              Severity
            </label>
            <select
              id="bugSeverity"
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

        <div className="mb-3">
          <label htmlFor="stepsToReproduce" className="form-label">
            Steps to Reproduce
          </label>
          <textarea
            id="stepsToReproduce"
            name="steps_to_reproduce"
            value={formData.steps_to_reproduce}
            onChange={handleChange}
            className="form-control"
            rows="3"
            placeholder="1. Go to...\n2. Click on...\n3. Observe that..."
          />
          <div className="form-text">
            Provide clear, step-by-step instructions to reproduce the issue.
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="expectedResult" className="form-label">
            Expected Result
          </label>
          <textarea
            id="expectedResult"
            name="expected_result"
            value={formData.expected_result}
            onChange={handleChange}
            className="form-control"
            rows="2"
            placeholder="Describe what you expected to happen"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="actualResult" className="form-label">
            Actual Result
          </label>
          <textarea
            id="actualResult"
            name="actual_result"
            value={formData.actual_result}
            onChange={handleChange}
            className="form-control"
            rows="2"
            placeholder="Describe what actually happened"
          />
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label htmlFor="projectId" className="form-label">
              Project
            </label>
            <select
              id="projectId"
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select a project</option>
              {projects && projects.length > 0 ? (
                projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))
              ) : (
                <option disabled>No projects available</option>
              )}
            </select>
          </div>
          <div className="col-md-6">
            <label htmlFor="assignedTo" className="form-label">
              Assign To
            </label>
            <select
              id="assignedTo"
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Unassigned</option>
              {users && users.length > 0 ? (
                users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email || user.username})
                  </option>
                ))
              ) : (
                <option disabled>No users available</option>
              )}
            </select>
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
  const [showNewBugForm, setShowNewBugForm] = useState(false);
  const [projects, setProjects] = useState([]);

  const [users] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bugs, setBugs] = useState([
    {
      id: 1,
      title: 'Login button not working',
      description: 'The login button does nothing when clicked',
      status: 'open',
      priority: 'high',
      severity: 'critical',
      created_at: new Date().toISOString(),
      project: { id: 1, name: 'Project A' },
      reporter: { id: 1, name: 'John Doe', email: 'john@example.com' },
      assignee: { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
    },
    {
      id: 2,
      title: 'Page layout broken on mobile',
      description: 'The layout breaks on mobile devices',
      status: 'in_progress',
      priority: 'medium',
      severity: 'medium',
      created_at: new Date().toISOString(),
      project: { id: 2, name: 'Project B' },
      reporter: { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
      assignee: { id: 1, name: 'John Doe', email: 'john@example.com' }
    }
  ]);

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Toggle new bug form visibility
  const handleNewBugClick = useCallback(() => {
    setShowNewBugForm(true);
  }, []);

  // Handle canceling new bug form
  const handleCancelNewBug = useCallback(() => {
    setShowNewBugForm(false);
  }, []);

  // Update Status Handler
  const handleStatusUpdate = async (e, id, newStatus) => {
    e.stopPropagation();
    try {
      // Optimistic update
      setBugs(prev => prev.map(bug =>
        bug.id === id ? { ...bug, status: newStatus } : bug
      ));

      await bugAPI.updateStatus(id, newStatus);
      toast.success(`Bug marked as ${newStatus.replace('_', ' ')}`);
      loadBugs(); // Refresh data to ensure consistency
    } catch (err) {
      console.error('Error updating status:', err);
      // Revert on error
      loadBugs();
      toast.error('Failed to update status');
    }
  };

  // Load bugs data
  const loadBugs = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch real projects from API
      const projectsResponse = await projectsAPI.getProjects().catch(() => ({ data: [] }));
      const realProjects = projectsResponse.data?.data || projectsResponse.data || [];

      const [bugsRes, usersRes] = await Promise.all([
        bugAPI.getAll(),
        Promise.resolve({
          data: [
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
            { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
          ]
        })
      ]);

      setBugs(bugsRes?.data || [
        {
          id: 1,
          title: 'Login button not working',
          description: 'The login button does not respond when clicked',
          status: 'open',
          priority: 'high',
          severity: 'critical',
          created_at: new Date().toISOString(),
          project: { id: 1, name: 'Project A' },
          reporter: { id: 1, name: 'John Doe', email: 'john@example.com' },
          assignee: { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
        },
        {
          id: 2,
          title: 'Page layout broken on mobile',
          description: 'The layout breaks on mobile devices',
          status: 'in_progress',
          priority: 'medium',
          severity: 'high',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          project: { id: 2, name: 'Project B' },
          reporter: { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
          assignee: { id: 1, name: 'John Doe', email: 'john@example.com' }
        }
      ]);

      setProjects(realProjects);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    loadBugs();
  }, [loadBugs]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };;

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
  };

  // Handle saving a new bug
  const handleSaveBug = async (bugData) => {
    try {
      const response = await bugAPI.create(bugData);
      setBugs(prev => [...prev, response.data]);
      setShowNewBugForm(false);
      toast.success('Bug reported successfully!');
    } catch (err) {
      console.error('Error saving bug:', err);
      setError('Failed to save bug. Please try again.');
      toast.error('Failed to save bug');
    }
  };

  // Toggle new bug form
  const toggleNewBugForm = useCallback(() => {
    setShowNewBugForm(prev => !prev);
    setError('');
  }, []);

  // Filter bugs based on search and filters
  const filteredBugs = bugs.filter(bug => {
    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!bug.title.toLowerCase().includes(searchLower) &&
        !bug.description.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Filter by status
    if (filters.status && bug.status !== filters.status) {
      return false;
    }

    // Filter by priority
    if (filters.priority && bug.priority !== filters.priority) {
      return false;
    }

    return true;
  });

  // Get status badge
  if (isLoading && bugs.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2">Loading bugs...</span>
      </div>
    );
  }

  const getStatusBadge = useCallback((status) => {
    switch (status) {
      case 'open': return 'badge bg-primary';
      case 'in_progress': return 'badge bg-info text-dark';
      case 'resolved': return 'badge bg-success';
      case 'closed': return 'badge bg-secondary';
      case 'reopened': return 'badge bg-warning text-dark';
      default: return 'badge bg-secondary';
    }
  }, []);

  const getPriorityBadge = useCallback((priority) => {
    switch (priority) {
      case 'critical': return 'badge bg-danger';
      case 'high': return 'badge bg-warning text-dark';
      case 'medium': return 'badge bg-info text-dark';
      case 'low':
      default: return 'badge bg-secondary';
    }
  }, []);

  if (isLoading && bugs.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2">Loading bugs...</span>
      </div>
    );
  }

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
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBugs.map(bug => (
                      <tr key={bug.id} className={`bug-row ${bug.status === 'resolved' ? 'border-success-left' : ''}`}>
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
                        <td className="text-end">
                          <div className="bug-actions d-flex gap-2 justify-content-end">
                            <button
                              className={`btn-icon-action pass ${bug.status === 'resolved' ? 'active' : ''}`}
                              title="Resolve Bug"
                              onClick={(e) => handleStatusUpdate(e, bug.id, 'resolved')}
                            >
                              <FiCheckCircle size={20} />
                            </button>
                            <button
                              className={`btn-icon-action fail ${bug.status === 'closed' ? 'active' : ''}`}
                              title="Close Bug"
                              onClick={(e) => handleStatusUpdate(e, bug.id, 'closed')}
                            >
                              <FiXCircle size={20} />
                            </button>
                          </div>
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