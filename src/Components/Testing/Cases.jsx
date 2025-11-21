import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthContext } from '../../context/AuthContext';
import { 
  FiSearch, 
  FiFilter, 
  FiPlus, 
  FiCheck, 
  FiX, 
  FiUser, 
  FiClock, 
  FiAlertCircle, 
  FiSave, 
  FiXCircle,
  FiPlusCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Cases.css';

// Initial empty test cases array
const initialTestCases = [];

// Create a mock API service with access to component state
export const createMockAPI = (testCases, setTestCases) => ({
  getAll: async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    let filtered = [...testCases];
    
    if (params.projectId) {
      filtered = filtered.filter(tc => tc.projectId === parseInt(params.projectId));
    }
    
    if (params._sort && params._order) {
      filtered.sort((a, b) => {
        const aVal = a[params._sort];
        const bVal = b[params._sort];
        if (aVal < bVal) return params._order === 'asc' ? -1 : 1;
        if (aVal > bVal) return params._order === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return { data: filtered };
  },
  
  create: async (data) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newTestCase = {
      id: Date.now(), // Use timestamp as ID to ensure uniqueness
      ...data,
      status: 'not_run',
      projectId: 1,
      createdBy: 1,
      assignedTo: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Update the test cases in the component state
    const updatedTestCases = [newTestCase, ...testCases];
    setTestCases(updatedTestCases);
    
    return { data: newTestCase };
  }
});

// Toast configuration is handled by the main App component

// New Test Case Form Component
const NewTestCaseForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'functional',
    priority: 'medium',
    steps: '',
    expectedResult: ''
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
      await onSave({
        ...formData,
        steps: formData.steps.split('\n').filter(step => step.trim() !== '')
      });
      
      // Reset form on successful save
      setFormData({
        title: '',
        description: '',
        type: 'functional',
        priority: 'medium',
        steps: '',
        expectedResult: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to save test case');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="new-test-case-form">
      <h3>Add New Test Case</h3>
      {error && <div className="form-error"><FiAlertCircle /> {error}</div>}
      <form onSubmit={handleSubmit} className="test-case-form">
        <div className="form-group">
          <label>Title <span className="text-danger">*</span></label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter test case title"
            required
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter test case description"
            rows="3"
            className="form-control"
          />
        </div>
        
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-select"
              >
                <option value="functional">Functional</option>
                <option value="integration">Integration</option>
                <option value="regression">Regression</option>
                <option value="smoke">Smoke</option>
                <option value="sanity">Sanity</option>
                <option value="performance">Performance</option>
              </select>
            </div>
          </div>
          
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
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label>Test Steps (one per line)</label>
          <textarea
            name="steps"
            value={formData.steps}
            onChange={handleChange}
            placeholder="Enter test steps, one per line"
            rows="5"
            className="form-control"
            required
          />
          <small className="text-muted">Each line will be treated as a separate test step</small>
        </div>
        
        <div className="form-group">
          <label>Expected Result</label>
          <textarea
            name="expectedResult"
            value={formData.expectedResult}
            onChange={handleChange}
            placeholder="Enter expected result"
            rows="3"
            className="form-control"
            required
          />
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
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="me-1" /> Save Test Case
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const Cases = () => {
  const { currentUser } = useAuth();
  const [testCases, setTestCases] = useState(initialTestCases);
  const [loading, setLoading] = useState(false);
  const [showNewTestCaseForm, setShowNewTestCaseForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const fetchTestCases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch('http://localhost:5000/api/test-cases', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch test cases');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Transform the data to match the expected format
        const formattedTestCases = result.data.map(tc => ({
          id: tc.id,
          title: tc.title,
          description: tc.description,
          type: tc.type,
          priority: tc.priority,
          status: tc.status || 'not_run',
          steps: tc.steps || [],
          expectedResult: tc.expectedResult || '',
          projectId: tc.projectId,
          createdBy: tc.createdBy,
          assignedTo: tc.assignedTo,
          createdAt: tc.createdAt,
          updatedAt: tc.updatedAt
        }));
        
        setTestCases(formattedTestCases);
      } else {
        throw new Error(result.message || 'Failed to load test cases');
      }
    } catch (error) {
      console.error('Error fetching test cases:', error);
      toast.error(error.message || 'Failed to load test cases');
      // Fallback to empty array if there's an error
      setTestCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestCases();
  }, []);
  
  const handleSaveTestCase = async (newTestCase) => {
    try {
      // Process steps
      let stepsArray = [];
      if (newTestCase.steps) {
        stepsArray = typeof newTestCase.steps === 'string' 
          ? newTestCase.steps.split('\n').filter(step => step.trim() !== '')
          : Array.isArray(newTestCase.steps) 
            ? newTestCase.steps.filter(step => step && step.trim() !== '')
            : [];
      }

      // Create the test case object for MySQL/Sequelize
      const testCaseToSave = {
        title: newTestCase.title || 'Untitled Test Case',
        description: newTestCase.description || '',
        type: newTestCase.type || 'functional',
        priority: newTestCase.priority || 'medium',
        expectedResult: newTestCase.expectedResult || '',
        steps: stepsArray.map((step, index) => ({
          step: `Step ${index + 1}`,
          expected: step
        })),
        status: 'not_run',
        projectId: currentUser?.projectId || 1,
        createdBy: currentUser?.id || 1  // Use the numeric user ID for MySQL
      };

      // Send the request to the backend
      const response = await fetch('http://localhost:5000/api/test-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(testCaseToSave)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save test case');
      }

      const savedTestCase = await response.json();
      
      // Update the local state with the saved test case from the server
      setTestCases([savedTestCase.data, ...testCases]);
      setShowNewTestCaseForm(false);
      
      toast.success('Test case created successfully!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } catch (error) {
      console.error('Error saving test case:', error);
      toast.error(`Failed to save test case: ${error.message}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    }
  };

  const filteredCases = testCases.filter(testCase => {
    if (!testCase) return false;
    
    const matchesSearch = testCase.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testCase.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || testCase.status === statusFilter;
    const matchesType = typeFilter === 'all' || testCase.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="cases-container">
      {showNewTestCaseForm ? (
        <div className="new-test-case-container">
          <button 
            className="btn btn-link back-button"
            onClick={() => setShowNewTestCaseForm(false)}
          >
            &larr; Back to Test Cases
          </button>
          <NewTestCaseForm 
            onSave={handleSaveTestCase}
            onCancel={() => setShowNewTestCaseForm(false)}
          />
        </div>
      ) : (
        <>
          <div className="cases-header">
            <h2>Test Cases</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowNewTestCaseForm(true)}
            >
              <FiPlus className="btn-icon" /> New Test Case
            </button>
          </div>

          <div className="cases-toolbar">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search test cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filters">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="not_run">Not Run</option>
              </select>

              <select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="functional">Functional</option>
                <option value="integration">Integration</option>
                <option value="regression">Regression</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading test cases...</div>
          ) : filteredCases.length === 0 ? (
            <div className="no-results">No test cases found matching your criteria.</div>
          ) : (
            <div className="cases-list">
              {filteredCases.map(testCase => (
                <div key={testCase.id} className="case-card">
                  <div className="case-card-header">
                    <div className="case-meta-tags">
                      <span className={`status-badge ${testCase.status || 'not_run'}`}>
                        {testCase.status === 'passed' ? (
                          <FiCheck size={14} className="mr-1" />
                        ) : testCase.status === 'failed' ? (
                          <FiX size={14} className="mr-1" />
                        ) : (
                          <FiAlertCircle size={14} className="mr-1" />
                        )}
                        {testCase.status ? testCase.status.replace('_', ' ') : 'Not Run'}
                      </span>
                      <span className="type-badge">
                        {testCase.type || 'functional'}
                      </span>
                      <span className={`priority-badge ${testCase.priority?.toLowerCase() || 'medium'}`}>
                        {testCase.priority ? testCase.priority.charAt(0).toUpperCase() + testCase.priority.slice(1) : 'Medium'}
                      </span>
                    </div>
                  </div>
                  <h3>{testCase.title || 'Untitled Test Case'}</h3>
                  <p className="case-description">{testCase.description || 'No description provided'}</p>
                  <div className="case-footer">
                    <span className="case-steps">
                      {Array.isArray(testCase.steps) ? testCase.steps.length : 
                       typeof testCase.steps === 'string' ? 1 : 0} steps
                    </span>
                    <div className="case-meta">
                      <span className="case-date">
                        <FiClock size={14} /> {testCase.createdAt ? new Date(testCase.createdAt).toLocaleDateString() : 'Unknown date'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Cases;
