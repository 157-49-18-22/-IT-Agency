import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../../services/auth';
import {
  FiSearch,
  FiPlus,
  FiFilter,
  FiUser,
  FiClock,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiPause,
  FiEdit2,
  FiTrash2,
  FiDownload,
  FiUpload,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiExternalLink,
  FiCopy,
  FiTag,
  FiFlag,
  FiBarChart2,
  FiPieChart,
  FiGrid,
  FiList,
  FiColumns,
  FiSliders,
  FiSettings,
  FiFilter as FiFilterIcon,
  FiX as FiXIcon,
  FiCheck as FiCheckIcon,
  FiAlertCircle,
  FiInfo,
  FiLock,
  FiUnlock,
  FiCalendar,
  FiClock as FiClockIcon,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle as FiAlertTriangleIcon,
  FiPauseCircle,
  FiCircle,
  FiZap,
  FiMessageSquare
} from 'react-icons/fi';
import './Uat.css';
import { uatAPI, projectsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'blocked', label: 'Blocked' }
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

const getStatusIcon = (status) => {
  switch (status) {
    case 'passed':
    case 'approved':
      return <FiCheckCircle className="status-icon passed" />;
    case 'failed':
    case 'rejected':
      return <FiX className="status-icon failed" />;
    case 'in_progress':
      return <FiZap className="status-icon in-progress" />;
    case 'blocked':
      return <FiAlertTriangleIcon className="status-icon blocked" />;
    case 'pending':
    default:
      return <FiCircle className="status-icon pending" />;
  }
};

const Uat = () => {
  const navigate = useNavigate();
  const [uatTests, setUatTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projects, setProjects] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    testSteps: [''],
    expectedResult: '',
    actualResult: '',
    status: 'pending',
    priority: 'medium',
    projectId: '',
    testerName: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Please login to access UAT tests');
      navigate('/login');
      return;
    }
    fetchTests();
    fetchProjects();
  }, [navigate]);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getProjects().catch(() => ({ data: [] }));
      setProjects(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchTests = async () => {
    try {
      setIsLoading(true);
      const response = await uatAPI.getUATs();
      setUatTests(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching UAT tests:', err);
      toast.error('Failed to load UAT tests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'searchTerm') {
      setSearchTerm(value);
    } else if (name === 'statusFilter') {
      setStatusFilter(value);
    } else if (name === 'priorityFilter') {
      setPriorityFilter(value);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTestStepChange = (index, value) => {
    const newSteps = [...formData.testSteps];
    newSteps[index] = value;
    setFormData(prev => ({ ...prev, testSteps: newSteps }));
  };

  const addTestStep = () => {
    setFormData(prev => ({ ...prev, testSteps: [...prev.testSteps, ''] }));
  };

  const removeTestStep = (index) => {
    const newSteps = formData.testSteps.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, testSteps: newSteps }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!isAuthenticated()) {
      toast.error('Your session has expired. Please login again.');
      navigate('/login');
      return;
    }

    try {
      const testData = {
        ...formData,
        testSteps: formData.testSteps.filter(step => step.trim() !== ''),
        lastUpdated: new Date().toISOString(),
        comments: 0,
        createdBy: getCurrentUser().id
      };

      if (isEditing) {
        await uatAPI.updateUAT(currentTest.id || currentTest._id, testData);
        toast.success('Test case updated successfully!');
      } else {
        await uatAPI.createUAT(testData);
        toast.success('Test case created successfully!');
      }

      setShowModal(false);
      resetForm();
      fetchTests();
    } catch (err) {
      console.error('Error creating/updating test case:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(err.message || 'Failed to save test case');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      testSteps: [''],
      expectedResult: '',
      actualResult: '',
      status: 'pending',
      priority: 'medium',
      projectId: '',
      testerName: ''
    });
  };

  const handleEdit = (test) => {
    setIsEditing(true);
    setCurrentTest(test);
    setFormData({
      title: test.title,
      description: test.description,
      testSteps: test.testSteps || test.steps || [],
      expectedResult: test.expectedResult,
      actualResult: test.actualResult,
      status: test.status,
      priority: test.priority,
      projectId: test.projectId || '',
      testerName: test.testerName
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!isAuthenticated()) {
      toast.error('Your session has expired. Please login again.');
      navigate('/login');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this test case?')) {
      return;
    }

    try {
      await uatAPI.deleteUAT(id);
      toast.success('Test case deleted successfully!');
      fetchTests();
    } catch (err) {
      console.error('Error deleting test case:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      } else {
        toast.error(err.message || 'Failed to delete test case');
      }
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await uatAPI.updateStatus(id, status);
      toast.success(`Test case marked as ${status}`);
      fetchTests();
    } catch (err) {
      console.error('Error updating test case status:', err);
      toast.error('Failed to update test case status');
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'low':
        return 'info';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      case 'critical':
        return 'dark';
      default:
        return 'secondary';
    }
  };

  const filteredTests = uatTests.filter(test => {
    if (!test) return false;

    const matchesSearch = searchTerm === '' ||
      (test.title && test.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (test.description && test.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || test.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="uat-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>User Acceptance Testing</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <FiPlus className="me-2" /> Create New Test Case
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="uat-toolbar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search test cases..."
            value={searchTerm}
            onChange={handleFilterChange}
            name="searchTerm"
          />
        </div>

        <div className="filters">
          <select
            value={statusFilter}
            onChange={handleFilterChange}
            name="statusFilter"
            className="form-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={priorityFilter}
            onChange={handleFilterChange}
            name="priorityFilter"
            className="form-select"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* New Test Case Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Test Case</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter test case title"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Describe the test case in detail"
                ></textarea>
              </div>

              <div className="form-group">
                <label>Test Steps *</label>
                {formData.testSteps.map((step, index) => (
                  <div key={index} className="step-input">
                    <span className="step-number">{index + 1}.</span>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => handleTestStepChange(index, e.target.value)}
                      required={index === 0}
                      placeholder={`Step ${index + 1}`}
                    />
                    {formData.testSteps.length > 1 && (
                      <button
                        type="button"
                        className="remove-step"
                        onClick={() => removeTestStep(index)}
                        aria-label="Remove step"
                      >
                        <FiX size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="add-step"
                  onClick={addTestStep}
                >
                  + Add Step
                </button>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Project <span className="text-danger">*</span></label>
                <select
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phase || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tester Name</label>
                <input
                  type="text"
                  name="testerName"
                  value={formData.testerName}
                  onChange={handleInputChange}
                  placeholder="Enter tester's name"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Test Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {isLoading ? (
        <div className="loading">Loading UAT tests...</div>
      ) : filteredTests.length === 0 ? (
        <div className="no-results">No UAT tests found matching your criteria.</div>
      ) : (
        <div className="uat-test-list">
          {filteredTests.map(test => (
            <div key={test.id} className={`uat-test-card ${test.status === 'approved' ? 'border-success-left' : ''}`}>
              <div className="test-card-header">
                <div className="test-status">
                  {getStatusIcon(test.status)}
                  <span className={`status-label ${test.status}`}>
                    {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                  </span>
                </div>
                <div className="test-meta">
                  <span className="test-tester">
                    <FiUser size={14} /> {test.tester}
                  </span>
                  <span className="test-date">
                    <FiClock size={14} /> {test.lastUpdated}
                  </span>
                  <span className="test-comments">
                    <FiMessageSquare size={14} /> {test.comments}
                  </span>
                </div>
              </div>

              <h3>{test.title}</h3>
              <p className="test-description">{test.description}</p>

              {(test.steps && test.steps.length > 0) || (test.testSteps && test.testSteps.length > 0) ? (
                <div className="test-steps">
                  <h4>Test Steps:</h4>
                  <ol>
                    {(test.steps || test.testSteps).map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              ) : null}

              <div className="test-actions d-flex justify-content-between align-items-center w-100">
                <div className="status-actions d-flex gap-2">
                  <button
                    className={`btn-icon-action pass ${test.status === 'approved' ? 'active' : ''}`}
                    title="Approve"
                    onClick={(e) => { e.stopPropagation(); updateStatus(test.id, 'approved'); }}
                  >
                    <FiCheckCircle size={20} />
                  </button>
                  <button
                    className={`btn-icon-action fail ${test.status === 'rejected' ? 'active' : ''}`}
                    title="Reject"
                    onClick={(e) => { e.stopPropagation(); updateStatus(test.id, 'rejected'); }}
                  >
                    <FiXCircle size={20} />
                  </button>
                </div>

                <div className="d-flex gap-2">
                  <button className="btn-outline">
                    <FiMessageSquare size={14} /> Add Comment
                  </button>
                  <div className="action-buttons-right">
                    <button className="btn-text" onClick={() => handleEdit(test)}>Edit</button>
                    <button className="btn-text" onClick={() => handleDelete(test.id)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Uat;