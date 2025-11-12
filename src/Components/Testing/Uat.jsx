import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiFilter, 
  FiPlus, 
  FiCheck, 
  FiX, 
  FiClock, 
  FiUser, 
  FiAlertCircle,
  FiThumbsUp,
  FiThumbsDown,
  FiMessageSquare
} from 'react-icons/fi';
import './Uat.css';
import { taskAPI, approvalAPI } from '../../services/api';

const Uat = () => {
  const [uatTests, setUatTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await taskAPI.getAll({ type: 'uat' });
        setUatTests(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);
  
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

  return (
    <div className="uat-container">
      <div className="uat-header">
        <h2>User Acceptance Testing</h2>
        <button className="btn-primary">
          <FiPlus size={16} /> New Test Case
        </button>
      </div>

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