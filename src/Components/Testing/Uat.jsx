import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiPlus, 
  FiX, 
  FiClock, 
  FiUser, 
  FiAlertCircle,
  FiThumbsUp,
  FiThumbsDown,
  FiMessageSquare,
  FiSave,
  FiTrash2
} from 'react-icons/fi';
import './Uat.css';
import uatAPI from '../../services/uatAPI';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Uat = () => {
  const [uatTests, setUatTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    steps: [''],
    status: 'pending',
    tester: '',
    priority: 'medium'
  });
  
  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setIsLoading(true);
      const tests = await uatAPI.getAllTests();
      setUatTests(tests);
    } catch (err) {
      console.error('Error fetching UAT tests:', err);
      toast.error('Failed to load UAT tests');
    } finally {
      setIsLoading(false);
    }
  };
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (isLoading) return <div className="loading">Loading...</div>;

  // OLD Mock data - REMOVED
  const oldUatTests = [
    {
      id: 1,
      title: 'Checkout Process',
      status: 'approved',
      tester: 'John Smith',
      lastUpdated: '2023-10-28 14:30:00',
      comments: 3,
      description: 'Verify the complete checkout process with multiple payment methods',
      steps: [
        'Add items to cart',
        'Proceed to checkout',
        'Select payment method',
        'Complete purchase'
      ]
    },
    // Add more UAT tests here
  ];

  const filteredTests = uatTests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FiThumbsUp className="status-icon approved" />;
      case 'rejected':
        return <FiThumbsDown className="status-icon rejected" />;
      case 'pending':
        return <FiClock className="status-icon pending" />;
      default:
        return <FiAlertCircle className="status-icon" />;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData(prev => ({
      ...prev,
      steps: newSteps
    }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, '']
    }));
  };

  const removeStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      steps: newSteps
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Filter out empty steps
      const testData = {
        ...formData,
        steps: formData.steps.filter(step => step.trim() !== ''),
        lastUpdated: new Date().toISOString(),
        comments: 0
      };
      
      await uatAPI.createTest(testData);
      toast.success('Test case created successfully!');
      setShowModal(false);
      resetForm();
      fetchTests();
    } catch (err) {
      console.error('Error creating test case:', err);
      toast.error('Failed to create test case');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      steps: [''],
      status: 'pending',
      tester: '',
      priority: 'medium'
    });
  };

  return (
    <div className="uat-container">
      <div className="uat-header">
        <h2>User Acceptance Testing</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowModal(true)}
        >
          <FiPlus size={16} /> New Test Case
        </button>
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
                {formData.steps.map((step, index) => (
                  <div key={index} className="step-input">
                    <span className="step-number">{index + 1}.</span>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => handleStepChange(index, e.target.value)}
                      required={index === 0}
                      placeholder={`Step ${index + 1}`}
                    />
                    {formData.steps.length > 1 && (
                      <button 
                        type="button" 
                        className="remove-step"
                        onClick={() => removeStep(index)}
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
                  onClick={addStep}
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
                <label>Tester Name</label>
                <input
                  type="text"
                  name="tester"
                  value={formData.tester}
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

      <div className="uat-toolbar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search UAT tests..."
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
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Loading UAT tests...</div>
      ) : filteredTests.length === 0 ? (
        <div className="no-results">No UAT tests found matching your criteria.</div>
      ) : (
        <div className="uat-test-list">
          {filteredTests.map(test => (
            <div key={test.id} className="uat-test-card">
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
              
              {test.steps && test.steps.length > 0 && (
                <div className="test-steps">
                  <h4>Test Steps:</h4>
                  <ol>
                    {test.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
              
              <div className="test-actions">
                <button className="btn-outline">
                  <FiMessageSquare size={14} /> Add Comment
                </button>
                <div>
                  <button className="btn-text">Edit</button>
                  <button className="btn-text">Delete</button>
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