import React, { useState } from 'react';
import { FiSearch, FiFilter, FiClock, FiTrendingUp, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import './Performance.css';

const Performance = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const [isLoading] = useState(false);

  // Mock performance data
  const performanceData = {
    metrics: {
      avgResponseTime: '245ms',
      requestsPerSecond: '1,245',
      errorRate: '0.12%',
      uptime: '99.98%',
    },
    tests: [
      {
        id: 1,
        name: 'Homepage Load Test',
        status: 'passed',
        responseTime: '1.2s',
        successRate: '100%',
        lastRun: '2023-10-28 14:30:00',
      },
      // Add more test data here
    ],
  };

  return (
    <div className="performance-container">
      <div className="performance-header">
        <h2>Performance Testing</h2>
        <div className="time-range-selector">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <FiClock size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Avg. Response Time</span>
            <span className="metric-value">{performanceData.metrics.avgResponseTime}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <FiTrendingUp size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Requests / Second</span>
            <span className="metric-value">{performanceData.metrics.requestsPerSecond}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon error">
            <FiAlertTriangle size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Error Rate</span>
            <span className="metric-value">{performanceData.metrics.errorRate}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon success">
            <FiCheck size={24} />
          </div>
          <div className="metric-info">
            <span className="metric-label">Uptime</span>
            <span className="metric-value">{performanceData.metrics.uptime}</span>
          </div>
        </div>
      </div>

      <div className="performance-tests">
        <div className="section-header">
          <h3>Performance Tests</h3>
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Search tests..." />
          </div>
        </div>

        {isLoading ? (
          <div className="loading">Loading performance data...</div>
        ) : (
          <div className="tests-table">
            <div className="table-header">
              <div className="table-row">
                <div className="table-cell">Test Name</div>
                <div className="table-cell">Status</div>
                <div className="table-cell">Response Time</div>
                <div className="table-cell">Success Rate</div>
                <div className="table-cell">Last Run</div>
                <div className="table-cell">Actions</div>
              </div>
            </div>
            <div className="table-body">
              {performanceData.tests.map((test) => (
                <div key={test.id} className="table-row">
                  <div className="table-cell">{test.name}</div>
                  <div className="table-cell">
                    <span className={`status-badge ${test.status}`}>
                      {test.status === 'passed' ? <FiCheck size={14} /> : <FiAlertTriangle size={14} />}
                      {test.status}
                    </span>
                  </div>
                  <div className="table-cell">{test.responseTime}</div>
                  <div className="table-cell">{test.successRate}</div>
                  <div className="table-cell">{test.lastRun}</div>
                  <div className="table-cell">
                    <button className="btn-text">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Performance;