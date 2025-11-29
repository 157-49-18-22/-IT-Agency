import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Testing.css';
import { 
  FaHome, FaClipboardCheck, FaBug, 
  FaFileUpload, FaChartLine, FaSignOutAlt,
  FaCheckCircle, FaExclamationTriangle, FaClock,
  FaCamera, FaDesktop, FaMobileAlt, FaUserTie, FaUpload,
  FaFilePdf, FaFileWord, FaFileExcel, FaFileImage
} from 'react-icons/fa';

const Testing = ({ projectId, onComplete, isClientView = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('test-cases');
  const [phaseCompleted, setPhaseCompleted] = useState(false);
  const [testCases, setTestCases] = useState([]);
  const [bugs, setBugs] = useState([]);
  const { logout } = useAuth();
  const navigate = useNavigate();
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

  // Handle phase completion
  const handleCompletePhase = () => {
    // TODO: Save any final testing phase data
    
    // Mark phase as completed
    setPhaseCompleted(true);
    
    // Notify parent component
    if (onComplete) {
      onComplete();
    }
  };

  // Check if all tests are passed
  const checkPhaseCompletion = useCallback(() => {
    const allTestsPassed = Object.values(deliverables).every(d => d);
    setPhaseCompleted(allTestsPassed);
  }, [deliverables]);

  useEffect(() => {
    checkPhaseCompletion();
  }, [checkPhaseCompletion, deliverables]);

  // State for test environment
  const [testEnvironment, setTestEnvironment] = useState({
    url: 'https://test-env.example.com',
    credentials: {
      username: 'tester@example.com',
      password: '********'
    },
    browserInfo: {
      name: 'Chrome',
      version: '120.0.0',
      os: 'Windows 10'
    },
    showCredentials: false
  });

  // State for bug report form
  const [bugReport, setBugReport] = useState({
    title: '',
    description: '',
    steps: '',
    expected: '',
    actual: '',
    severity: 'Medium',
    priority: 'Medium',
    browser: '',
    device: 'Desktop',
    attachments: [],
    screenshot: null
  });

  // State for client feedback
  const [clientFeedback, setClientFeedback] = useState({
    rating: 0,
    comments: '',
    issues: []
  });

  // State for UAT
  const [uatStatus, setUatStatus] = useState({
    testCases: [],
    approved: false,
    approvalDate: null,
    approvedBy: ''
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

  // Handle file upload for bug reports
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setBugReport(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  // Handle screenshot capture
  const captureScreenshot = () => {
    // In a real app, this would use a screenshot library
    const mockScreenshot = 'data:image/png;base64,mock-screenshot-data';
    setBugReport(prev => ({
      ...prev,
      screenshot: mockScreenshot
    }));
  };

  // Handle bug report submission
  const submitBugReport = () => {
    // In a real app, this would submit to an API
    const newBug = {
      id: bugs.length + 1,
      title: bugReport.title,
      status: 'Open',
      severity: bugReport.severity,
      priority: bugReport.priority,
      assignedTo: 'Unassigned',
      screenshot: bugReport.screenshot,
      attachments: bugReport.attachments.length,
      browser: bugReport.browser,
      device: bugReport.device
    };
    
    setBugs([...bugs, newBug]);
    // Reset form
    setBugReport({
      title: '',
      description: '',
      steps: '',
      expected: '',
      actual: '',
      severity: 'Medium',
      priority: 'Medium',
      browser: '',
      device: 'Desktop',
      attachments: [],
      screenshot: null
    });
    
    // Show success message
    alert('Bug report submitted successfully!');
  };

  // Handle client feedback submission
  const submitClientFeedback = () => {
    // In a real app, this would submit to an API
    alert('Thank you for your feedback!');
    setClientFeedback({
      rating: 0,
      comments: '',
      issues: []
    });
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
              <button 
                className="btn btn-primary" 
                onClick={() => setActiveTab('new-bug')}
              >
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
      
      case 'test-environment':
        return (
          <div className="test-environment">
            <h2>Testing Environment</h2>
            <div className="environment-details">
              <div className="card mb-4">
                <div className="card-header">
                  <h3>Access Details</h3>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label>Environment URL</label>
                    <div className="input-group">
                      <input 
                        type="text" 
                        className="form-control" 
                        value={testEnvironment.url}
                        readOnly
                      />
                      <div className="input-group-append">
                        <a 
                          href={testEnvironment.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                        >
                          Open
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <div className="d-flex justify-content-between align-items-center">
                      <label>Test Credentials</label>
                      <button 
                        className="btn btn-sm btn-link"
                        onClick={() => setTestEnvironment(prev => ({
                          ...prev,
                          showCredentials: !prev.showCredentials
                        }))}
                      >
                        {testEnvironment.showCredentials ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    {testEnvironment.showCredentials && (
                      <div className="credentials-box p-3 bg-light rounded">
                        <div className="form-group">
                          <label>Username</label>
                          <input 
                            type="text" 
                            className="form-control mb-2" 
                            value={testEnvironment.credentials.username}
                            readOnly
                          />
                        </div>
                        <div className="form-group">
                          <label>Password</label>
                          <input 
                            type="password" 
                            className="form-control" 
                            value={testEnvironment.credentials.password}
                            readOnly
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="browser-info">
                    <h4>Browser Information</h4>
                    <ul className="list-unstyled">
                      <li><strong>Browser:</strong> {testEnvironment.browserInfo.name}</li>
                      <li><strong>Version:</strong> {testEnvironment.browserInfo.version}</li>
                      <li><strong>OS:</strong> {testEnvironment.browserInfo.os}</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="testing-tools">
                <h3>Testing Tools</h3>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <div className="card h-100">
                      <div className="card-body text-center">
                        <FaDesktop size={32} className="mb-3" />
                        <h5>Cross-Browser Testing</h5>
                        <p>Test your application across multiple browsers and devices</p>
                        <button className="btn btn-outline-primary btn-sm">Launch</button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card h-100">
                      <div className="card-body text-center">
                        <FaMobileAlt size={32} className="mb-3" />
                        <h5>Mobile Testing</h5>
                        <p>Test on various mobile devices and screen sizes</p>
                        <button className="btn btn-outline-primary btn-sm">Launch</button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card h-100">
                      <div className="card-body text-center">
                        <FaChartLine size={32} className="mb-3" />
                        <h5>Performance Testing</h5>
                        <p>Check application performance and load times</p>
                        <button className="btn btn-outline-primary btn-sm">Launch</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'new-bug':
        return (
          <div className="new-bug-report">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Report New Bug</h2>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => setActiveTab('bug-reporting')}
              >
                Back to Bug List
              </button>
            </div>
            
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-8">
                    <div className="form-group">
                      <label>Bug Title *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={bugReport.title}
                        onChange={(e) => setBugReport({...bugReport, title: e.target.value})}
                        placeholder="Briefly describe the issue"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Description *</label>
                      <textarea 
                        className="form-control" 
                        rows="3"
                        value={bugReport.description}
                        onChange={(e) => setBugReport({...bugReport, description: e.target.value})}
                        placeholder="Provide a detailed description of the issue"
                      ></textarea>
                    </div>
                    
                    <div className="form-group">
                      <label>Steps to Reproduce *</label>
                      <textarea 
                        className="form-control" 
                        rows="3"
                        value={bugReport.steps}
                        onChange={(e) => setBugReport({...bugReport, steps: e.target.value})}
                        placeholder="1. Go to...\n2. Click on...\n3. Scroll to..."
                      ></textarea>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Expected Result *</label>
                          <textarea 
                            className="form-control" 
                            rows="2"
                            value={bugReport.expected}
                            onChange={(e) => setBugReport({...bugReport, expected: e.target.value})}
                          ></textarea>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Actual Result *</label>
                          <textarea 
                            className="form-control" 
                            rows="2"
                            value={bugReport.actual}
                            onChange={(e) => setBugReport({...bugReport, actual: e.target.value})}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Severity</label>
                          <select 
                            className="form-control"
                            value={bugReport.severity}
                            onChange={(e) => setBugReport({...bugReport, severity: e.target.value})}
                          >
                            <option>Critical</option>
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                          </select>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Priority</label>
                          <select 
                            className="form-control"
                            value={bugReport.priority}
                            onChange={(e) => setBugReport({...bugReport, priority: e.target.value})}
                          >
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Browser</label>
                          <input 
                            type="text" 
                            className="form-control"
                            value={bugReport.browser}
                            onChange={(e) => setBugReport({...bugReport, browser: e.target.value})}
                            placeholder="e.g., Chrome 120, Firefox 115"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Device</label>
                          <select 
                            className="form-control"
                            value={bugReport.device}
                            onChange={(e) => setBugReport({...bugReport, device: e.target.value})}
                          >
                            <option>Desktop</option>
                            <option>Mobile</option>
                            <option>Tablet</option>
                            <option>Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="screenshot-section mb-4">
                      <h5>Screenshot</h5>
                      <div className="screenshot-preview">
                        {bugReport.screenshot ? (
                          <div className="screenshot-container">
                            <img 
                              src={bugReport.screenshot} 
                              alt="Screenshot" 
                              className="img-fluid mb-2"
                            />
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => setBugReport({...bugReport, screenshot: null})}
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div 
                            className="screenshot-upload"
                            onClick={captureScreenshot}
                          >
                            <FaCamera size={32} className="mb-2" />
                            <p>Click to capture screenshot</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="attachments-section">
                      <h5>Attachments</h5>
                      <div className="file-upload-area mb-3">
                        <input 
                          type="file" 
                          id="bug-attachments" 
                          className="d-none" 
                          multiple
                          onChange={handleFileUpload}
                        />
                        <label 
                          htmlFor="bug-attachments" 
                          className="btn btn-outline-secondary btn-block"
                        >
                          <FaUpload className="mr-2" /> Add Files
                        </label>
                        <small className="text-muted">Max file size: 10MB</small>
                      </div>
                      
                      {bugReport.attachments.length > 0 && (
                        <div className="attachments-list">
                          <h6>Attached Files:</h6>
                          <ul className="list-unstyled">
                            {bugReport.attachments.map((file, index) => (
                              <li key={index} className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-truncate" style={{maxWidth: '150px'}}>
                                  {file.name}
                                </span>
                                <button 
                                  className="btn btn-sm btn-link text-danger p-0"
                                  onClick={() => {
                                    const newAttachments = [...bugReport.attachments];
                                    newAttachments.splice(index, 1);
                                    setBugReport({...bugReport, attachments: newAttachments});
                                  }}
                                >
                                  ×
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button 
                    className="btn btn-primary"
                    onClick={submitBugReport}
                    disabled={!bugReport.title || !bugReport.description || !bugReport.steps}
                  >
                    Submit Bug Report
                  </button>
                  <button 
                    className="btn btn-outline-secondary ml-2"
                    onClick={() => setActiveTab('bug-reporting')}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'client-view':
        return (
          <div className="client-view">
            <h2>User Acceptance Testing (UAT)</h2>
            
            <div className="card mb-4">
              <div className="card-header">
                <h3>Test Environment Access</h3>
              </div>
              <div className="card-body">
                <p>Please use the following credentials to access the UAT environment:</p>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>UAT URL</label>
                      <div className="input-group">
                        <input 
                          type="text" 
                          className="form-control" 
                          value="https://uat.example.com"
                          readOnly
                        />
                        <div className="input-group-append">
                          <a 
                            href="https://uat.example.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                          >
                            Open UAT
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Test Account</label>
                      <div className="credentials-box p-3 bg-light rounded">
                        <div className="form-group mb-2">
                          <label className="mb-0 small text-muted">Email</label>
                          <div className="d-flex">
                            <input 
                              type="text" 
                              className="form-control form-control-sm" 
                              value="client@example.com"
                              readOnly
                            />
                            <button 
                              className="btn btn-sm btn-outline-secondary ml-2"
                              onClick={() => {
                                navigator.clipboard.writeText('client@example.com');
                                alert('Email copied to clipboard');
                              }}
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                        <div className="form-group mb-0">
                          <label className="mb-0 small text-muted">Password</label>
                          <div className="d-flex">
                            <input 
                              type="password" 
                              className="form-control form-control-sm" 
                              value="test1234"
                              readOnly
                            />
                            <button 
                              className="btn btn-sm btn-outline-secondary ml-2"
                              onClick={() => {
                                navigator.clipboard.writeText('test1234');
                                alert('Password copied to clipboard');
                              }}
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Test Cases</h3>
                <span className="badge bg-success">UAT Ready</span>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Test Case</th>
                        <th>Status</th>
                        <th>Your Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>TC-001</td>
                        <td>User Registration</td>
                        <td><span className="badge bg-warning">Pending</span></td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary mr-2">Start Test</button>
                        </td>
                      </tr>
                      <tr>
                        <td>TC-002</td>
                        <td>Login Functionality</td>
                        <td><span className="badge bg-warning">Pending</span></td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary mr-2">Start Test</button>
                        </td>
                      </tr>
                      <tr>
                        <td>TC-003</td>
                        <td>Password Reset</td>
                        <td><span className="badge bg-success">Passed</span></td>
                        <td>
                          <button className="btn btn-sm btn-outline-secondary" disabled>Completed</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="card mb-4">
              <div className="card-header">
                <h3>Report an Issue</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label>Issue Title</label>
                  <input type="text" className="form-control" placeholder="Briefly describe the issue" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    placeholder="Please provide detailed information about the issue you encountered"
                  ></textarea>
                </div>
                <div className="form-group">
                  <label>Severity</label>
                  <select className="form-control">
                    <option>Critical - Blocks testing</option>
                    <option>High - Major issue</option>
                    <option>Medium - Minor issue</option>
                    <option>Low - Suggestion</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Screenshot (Optional)</label>
                  <div className="custom-file">
                    <input type="file" className="custom-file-input" id="screenshot-upload" />
                    <label className="custom-file-label" htmlFor="screenshot-upload">Choose file</label>
                  </div>
                </div>
                <button className="btn btn-primary mt-3">Submit Issue</button>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h3>Feedback & Approval</h3>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label>Overall Rating</label>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span 
                        key={star} 
                        className={`star ${star <= clientFeedback.rating ? 'active' : ''}`}
                        onClick={() => setClientFeedback({...clientFeedback, rating: star})}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Additional Comments</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    value={clientFeedback.comments}
                    onChange={(e) => setClientFeedback({...clientFeedback, comments: e.target.value})}
                    placeholder="Any additional feedback or comments..."
                  ></textarea>
                </div>
                <div className="form-check mb-3">
                  <input 
                    type="checkbox" 
                    className="form-check-input" 
                    id="approve-uat"
                    checked={clientFeedback.approved}
                    onChange={(e) => setClientFeedback({...clientFeedback, approved: e.target.checked})}
                  />
                  <label className="form-check-label" htmlFor="approve-uat">
                    I approve the application for production release
                  </label>
                </div>
                <button 
                  className="btn btn-success"
                  onClick={submitClientFeedback}
                >
                  Submit Feedback
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
              className={`nav-item ${activeTab === 'test-environment' ? 'active' : ''}`}
              onClick={() => setActiveTab('test-environment')}
            >
              <FaDesktop className="nav-icon" />
              <span className="nav-text">Test Environment</span>
            </li>
            
            <li 
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <FaChartLine className="nav-icon" />
              <span className="nav-text">Reports</span>
            </li>
            
            <li 
              className="nav-item"
              onClick={() => setActiveTab('client-view')}
            >
              <FaUserTie className="nav-icon" />
              <span className="nav-text">Client View</span>
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
          <button 
            className="btn btn-link sign-out"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
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