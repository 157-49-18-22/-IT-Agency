import React, { useState, useEffect } from 'react';
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
import './Cases.css';
import { testCaseAPI } from '../../services/api';

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
        {error && <div className="alert alert-danger">{error}</div>}
        
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
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTestCaseForm, setShowNewTestCaseForm] = useState(false);
  
  useEffect(() => {
    const fetchTestCases = async () => {
      try {
        const res = await testCaseAPI.getAll();
        setTestCases(res.data || []);
      } catch (err) {
        console.error('Error fetching test cases:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestCases();
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const handleSaveTestCase = async (newTestCase) => {
    try {
      // Format steps if needed
      const formattedTestCase = {
        ...newTestCase,
        steps: newTestCase.steps ? newTestCase.steps.split('\n').map(step => ({
          step: step.trim(),
          expected: '' // You can modify this based on your form
        })) : [],
        projectId: 1, // Replace with actual project ID
        createdBy: 1, // Replace with actual user ID from auth context
        assignedTo: 1, // Replace with actual assigned user ID
        status: 'not_run',
        expectedResult: newTestCase.expectedResult || ''
      };

      const response = await testCaseAPI.create(formattedTestCase);
      setTestCases(prev => [response.data, ...prev]);
      setShowNewTestCaseForm(false);
      return response.data;
    } catch (err) {
      console.error('Error saving test case:', err);
      throw new Error('Failed to save test case');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  // Test cases will be loaded from the API

  const filteredCases = testCases.filter(testCase => {
    if (!testCase) return false;
    
    const matchesSearch = testCase.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testCase.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || testCase.status === statusFilter;
    const matchesType = typeFilter === 'all' || testCase.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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
                <option value="not-run">Not Run</option>
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
                <option value="smoke">Smoke</option>
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
                    <span className={`case-status ${testCase.status}`}>
                      {testCase.status === 'passed' ? (
                        <FiCheck size={14} />
                      ) : testCase.status === 'failed' ? (
                        <FiX size={14} />
                      ) : (
                        <FiAlertCircle size={14} />
                      )}
                      {testCase.status}
                    </span>
                    <span className="case-type">{testCase.type}</span>
                  </div>
                  <h3>{testCase.title}</h3>
                  <p className="case-description">{testCase.description}</p>
                  <div className="case-footer">
                    <span className="case-steps">{testCase.steps} steps</span>
                    <div className="case-meta">
                      <span className="case-assignee">
                        <FiUser size={14} /> {testCase.assignedTo}
                      </span>
                      <span className="case-date">
                        <FiClock size={14} /> {testCase.lastRun}
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