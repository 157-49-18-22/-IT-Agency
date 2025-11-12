import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiPlus, FiCheck, FiX, FiUser, FiClock, FiAlertCircle } from 'react-icons/fi';
import './Cases.css';
import { taskAPI } from '../../services/api';

const Cases = () => {
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await taskAPI.getAll({ type: 'test' });
        setTestCases(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  if (loading) return <div className="loading">Loading...</div>;

  // OLD Mock data - REMOVED
  const oldTestCases = [
    {
      id: 1,
      title: 'User Login Test',
      type: 'functional',
      status: 'passed',
      assignedTo: 'Jane Smith',
      lastRun: '2023-10-28',
      steps: 5,
      description: 'Verify user can login with valid credentials'
    },
    // Add more test cases here
  ];

  const filteredCases = testCases.filter(testCase => {
    const matchesSearch = testCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testCase.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || testCase.status === statusFilter;
    const matchesType = typeFilter === 'all' || testCase.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="cases-container">
      <div className="cases-header">
        <h2>Test Cases</h2>
        <button className="btn-primary">
          <FiPlus size={16} /> Add Test Case
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
    </div>
  );
};

export default Cases;