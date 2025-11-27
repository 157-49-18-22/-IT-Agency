import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Testing.css';
import { 
  FaHome, FaClipboardCheck, FaBug, 
  FaFileUpload, FaChartLine, FaSignOutAlt,
  FaCheckCircle, FaExclamationTriangle, FaClock
} from 'react-icons/fa';

const Testing = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('test-cases');
  const [testCases, setTestCases] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [deliverables, setDeliverables] = useState({
    testCasesExecuted: false,
    resultsDocumented: false,
    bugsLogged: false,
    fixesRetested: false,
    performanceVerified: false,
    securityChecksPassed: false,
    crossBrowserTested: false,
    finalReportPrepared: false
  });

  // Mock data for test cases
  useEffect(() => {
    // Simulate API call to fetch test cases
    const mockTestCases = [
      { id: 1, title: 'Login Functionality', status: 'Pending', priority: 'High', assignedTo: 'Tester 1' },
      { id: 2, title: 'Registration Flow', status: 'In Progress', priority: 'High', assignedTo: 'Me' },
      { id: 3, title: 'Password Reset', status: 'Completed', priority: 'Medium', assignedTo: 'Tester 2' },
      { id: 4, title: 'Profile Update', status: 'Pending', priority: 'Low', assignedTo: 'Me' },
    ];
    setTestCases(mockTestCases);

    // Mock bugs data
    const mockBugs = [
      { id: 1, title: 'Login fails with special characters', status: 'Open', severity: 'High', priority: 'P1', assignedTo: 'Dev 1' },
      { id: 2, title: 'Password reset email not sent', status: 'In Progress', severity: 'Critical', priority: 'P0', assignedTo: 'Dev 2' },
      { id: 3, title: 'UI alignment issue on mobile', status: 'Resolved', severity: 'Low', priority: 'P3', assignedTo: 'Dev 1' },
    ];
    setBugs(mockBugs);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleDeliverableToggle = (key) => {
    setDeliverables(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'test-cases':
        return (
          <div className="test-cases">
            <h2>Test Cases</h2>
            <div className="test-case-filters">
              <button className="btn btn-primary">All</button>
              <button className="btn btn-outline">Assigned to Me</button>
              <button className="btn btn-outline">Pending</button>
              <button className="btn btn-outline">In Progress</button>
              <button className="btn btn-outline">Completed</button>
            </div>
            <div className="table-responsive">
              <table className="test-case-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testCases.map(testCase => (
                    <tr key={testCase.id}>
                      <td>{testCase.id}</td>
                      <td>{testCase.title}</td>
                      <td>
                        <span className={`status-badge ${testCase.status.toLowerCase().replace(' ', '-')}`}>
                          {testCase.status}
                        </span>
                      </td>
                      <td><span className={`priority-badge ${testCase.priority.toLowerCase()}`}>{testCase.priority}</span></td>
                      <td>{testCase.assignedTo}</td>
                      <td>
                        <button className="btn btn-sm btn-primary">Execute</button>
                        <button className="btn btn-sm btn-outline">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'bug-reporting':
        return (
          <div className="bug-reporting">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Bug Reporting</h2>
              <button className="btn btn-primary">
                <FaBug className="mr-2" /> Report New Bug
              </button>
            </div>
            
            <div className="bug-filters">
              <div className="search-box">
                <input type="text" placeholder="Search bugs..." />
                <button className="btn btn-icon">
                  <i className="fas fa-search"></i>
                </button>
              </div>
              <div className="filter-options">
                <select className="form-control">
                  <option>All Status</option>
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>
                <select className="form-control">
                  <option>All Severity</option>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>
            
            <div className="bugs-list">
              {bugs.map(bug => (
                <div key={bug.id} className="bug-card">
                  <div className="bug-header">
                    <div className="bug-title">
                      <span className={`severity-dot ${bug.severity.toLowerCase()}`}></span>
                      <h4>{bug.title}</h4>
                      <span className={`priority-tag ${bug.priority.toLowerCase()}`}>{bug.priority}</span>
                    </div>
                    <div className="bug-meta">
                      <span className="assigned-to">Assigned to: {bug.assignedTo}</span>
                      <span className={`status-badge ${bug.status.toLowerCase().replace(' ', '-')}`}>
                        {bug.status}
                      </span>
                    </div>
                  </div>
                  <div className="bug-actions">
                    <button className="btn btn-sm btn-outline">View Details</button>
                    <button className="btn btn-sm btn-primary">Add Comment</button>
                    <button className="btn btn-sm btn-success">Mark as Fixed</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'deliverables':
        return (
          <div className="deliverables">
            <h2>Testing Deliverables</h2>
            <div className="deliverables-checklist">
              <h3>Testing Completion Checklist</h3>
              <div className="checklist-item">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={deliverables.testCasesExecuted}
                    onChange={() => handleDeliverableToggle('testCasesExecuted')}
                  />
                  <span className="checkmark"></span>
                  All test cases executed
                </label>
              </div>
              <div className="checklist-item">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={deliverables.resultsDocumented}
                    onChange={() => handleDeliverableToggle('resultsDocumented')}
                  />
                  <span className="checkmark"></span>
                  Test results documented
                </label>
              </div>
              <div className="checklist-item">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={deliverables.bugsLogged}
                    onChange={() => handleDeliverableToggle('bugsLogged')}
                  />
                  <span className="checkmark"></span>
                  Bugs logged with details
                </label>
              </div>
              <div className="checklist-item">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={deliverables.fixesRetested}
                    onChange={() => handleDeliverableToggle('fixesRetested')}
                  />
                  <span className="checkmark"></span>
                  Retest completed for fixes
                </label>
              </div>
              <div className="checklist-item">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={deliverables.performanceVerified}
                    onChange={() => handleDeliverableToggle('performanceVerified')}
                  />
                  <span className="checkmark"></span>
                  Performance benchmarks verified
                </label>
              </div>
              <div className="checklist-item">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={deliverables.securityChecksPassed}
                    onChange={() => handleDeliverableToggle('securityChecksPassed')}
                  />
                  <span className="checkmark"></span>
                  Security checks passed
                </label>
              </div>
              <div className="checklist-item">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={deliverables.crossBrowserTested}
                    onChange={() => handleDeliverableToggle('crossBrowserTested')}
                  />
                  <span className="checkmark"></span>
                  Cross-browser testing done
                </label>
              </div>
              <div className="checklist-item">
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={deliverables.finalReportPrepared}
                    onChange={() => handleDeliverableToggle('finalReportPrepared')}
                  />
                  <span className="checkmark"></span>
                  Final test report prepared
                </label>
              </div>
            </div>
            
            <div className="deliverables-actions mt-4">
              <h3>Submit Deliverables</h3>
              <div className="file-upload-area">
                <div className="upload-icon">
                  <FaFileUpload size={32} />
                </div>
                <p>Drag & drop test reports or click to browse</p>
                <input type="file" id="test-reports" className="d-none" />
                <label htmlFor="test-reports" className="btn btn-outline">Select Files</label>
              </div>
              
              <div className="submission-section mt-4">
                <h4>Final Submission</h4>
                <p>Once you submit, you won't be able to make further changes to the test cases or reports.</p>
                <div className="form-group">
                  <label>Additional Notes (Optional)</label>
                  <textarea className="form-control" rows="3" placeholder="Any additional information or comments..."></textarea>
                </div>
                <button className="btn btn-primary">
                  <FaCheckCircle className="mr-2" /> Submit All Deliverables
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'reports':
        return (
          <div className="reports">
            <h2>Test Reports & Analytics</h2>
            <div className="report-cards">
              <div className="report-card">
                <div className="report-icon bg-primary">
                  <FaCheckCircle />
                </div>
                <div className="report-details">
                  <h3>Test Coverage</h3>
                  <div className="progress">
                    <div className="progress-bar" style={{ width: '78%' }}></div>
                  </div>
                  <p>78% of requirements covered</p>
                </div>
              </div>
              
              <div className="report-card">
                <div className="report-icon bg-success">
                  <FaCheckCircle />
                </div>
                <div className="report-details">
                  <h3>Test Execution</h3>
                  <div className="progress">
                    <div className="progress-bar bg-success" style={{ width: '65%' }}></div>
                  </div>
                  <p>65% of tests passed</p>
                </div>
              </div>
              
              <div className="report-card">
                <div className="report-icon bg-warning">
                  <FaExclamationTriangle />
                </div>
                <div className="report-details">
                  <h3>Defects</h3>
                  <div className="progress">
                    <div className="progress-bar bg-warning" style={{ width: '45%' }}></div>
                  </div>
                  <p>12 open defects</p>
                </div>
              </div>
              
              <div className="report-card">
                <div className="report-icon bg-info">
                  <FaClock />
                </div>
                <div className="report-details">
                  <h3>Progress</h3>
                  <div className="progress">
                    <div className="progress-bar bg-info" style={{ width: '30%' }}></div>
                  </div>
                  <p>30% of testing complete</p>
                </div>
              </div>
            </div>
            
            <div className="report-charts mt-4">
              <div className="chart-container">
                <h3>Test Execution Status</h3>
                <div className="chart-placeholder">
                  <p>Chart: Test Execution Status</p>
                  <div className="chart-legend">
                    <span className="legend-item"><span className="legend-color passed"></span> Passed</span>
                    <span className="legend-item"><span className="legend-color failed"></span> Failed</span>
                    <span className="legend-item"><span className="legend-color pending"></span> Pending</span>
                    <span className="legend-item"><span className="legend-color blocked"></span> Blocked</span>
                  </div>
                </div>
              </div>
              
              <div className="chart-container">
                <h3>Defect Distribution</h3>
                <div className="chart-placeholder">
                  <p>Chart: Defect Distribution by Module</p>
                  <div className="chart-legend">
                    <span className="legend-item"><span class="legend-color critical"></span> Critical</span>
                    <span className="legend-item"><span class="legend-color high"></span> High</span>
                    <span className="legend-item"><span class="legend-color medium"></span> Medium</span>
                    <span className="legend-item"><span class="legend-color low"></span> Low</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="export-options mt-4">
              <h3>Export Reports</h3>
              <div className="export-buttons">
                <button className="btn btn-outline">
                  <i className="fas fa-file-pdf mr-2"></i> Export as PDF
                </button>
                <button className="btn btn-outline">
                  <i className="fas fa-file-excel mr-2"></i> Export as Excel
                </button>
                <button className="btn btn-outline">
                  <i className="fas fa-file-csv mr-2"></i> Export as CSV
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Select a tab to get started</div>;
    }
  };

  return (
    <div className="testing-dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <h3>Testing Dashboard</h3>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? '«' : '»'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li 
              className={`nav-item ${activeTab === 'test-cases' ? 'active' : ''}`}
              onClick={() => setActiveTab('test-cases')}
            >
              <FaClipboardCheck className="nav-icon" />
              <span className="nav-text">Test Cases</span>
            </li>
            
            <li 
              className={`nav-item ${activeTab === 'bug-reporting' ? 'active' : ''}`}
              onClick={() => setActiveTab('bug-reporting')}
            >
              <FaBug className="nav-icon" />
              <span className="nav-text">Bug Reporting</span>
              <span className="badge badge-danger">3</span>
            </li>
            
            <li 
              className={`nav-item ${activeTab === 'deliverables' ? 'active' : ''}`}
              onClick={() => setActiveTab('deliverables')}
            >
              <FaFileUpload className="nav-icon" />
              <span className="nav-text">Deliverables</span>
            </li>
            
            <li 
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <FaChartLine className="nav-icon" />
              <span className="nav-text">Reports</span>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <span>T</span>
            </div>
            <div className="user-info">
              <h4>Tester Name</h4>
              <p>QA Tester</p>
            </div>
          </div>
          <button className="btn btn-link sign-out">
            <FaSignOutAlt className="mr-2" /> Sign Out
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        <header className="top-bar">
          <div className="d-flex justify-content-between align-items-center">
            <h1>{activeTab === 'test-cases' ? 'Test Cases' : 
                 activeTab === 'bug-reporting' ? 'Bug Reporting' :
                 activeTab === 'deliverables' ? 'Testing Deliverables' :
                 'Reports & Analytics'}</h1>
            <div className="top-actions">
              <div className="search-box">
                <input type="text" placeholder="Search..." />
                <button className="btn btn-icon">
                  <i className="fas fa-search"></i>
                </button>
              </div>
              <div className="notifications">
                <button className="btn btn-icon">
                  <i className="fas fa-bell"></i>
                  <span className="badge">3</span>
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <div className="content-area">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Testing;