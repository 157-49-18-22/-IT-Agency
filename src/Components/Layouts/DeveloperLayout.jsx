import React, { useState, useContext, useEffect, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaCode, 
  FaCalendarAlt, 
  FaSignOutAlt, 
  FaChevronDown, 
  FaChevronRight,
  FaTasks,
  FaCodeBranch,
  FaServer,
  FaRocket,
  FaClipboardList,
  FaProjectDiagram,
  FaCheckCircle,
  FaClock,
  FaUsers,
  FaFileCode,
  FaCheckSquare,
  FaUpload,
  FaComments,
  FaTools,
  FaBook,
  FaExclamationTriangle,
  FaDatabase,
  FaPlug,
  FaVial,
  FaSearch,
  FaStopwatch,
  FaChartLine,
  FaFileAlt,
  FaUserCheck,
  FaHistory,
  FaRegClock,
  FaPlay,
  FaPause,
  FaStop,
  FaFileDownload,
  FaFileImport,
  FaFileExport,
  FaClipboardCheck,
  FaFileSignature,
  FaFileWord,
  FaFileExcel,
  FaFilePdf,
  FaFileImage,
  FaFileArchive,
  FaFileAudio,
  FaFileVideo,
  FaCodeBranch as FaCodeMerge,
  FaFileCode as FaFileCodeIcon,
  FaFileAlt as FaFileAltIcon,
  FaFileWord as FaFileWordIcon,
  FaFileExcel as FaFileExcelIcon,
  FaFilePdf as FaFilePdfIcon,
  FaFileImage as FaFileImageIcon,
  FaFileArchive as FaFileArchiveIcon,
  FaFileAudio as FaFileAudioIcon,
  FaFileVideo as FaFileVideoIcon,
  FaFileDownload as FaFileDownloadIcon,
  FaFileUpload as FaFileUploadIcon,
  FaFileImport as FaFileImportIcon,
  FaFileExport as FaFileExportIcon
} from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { useAuth } from '../../context/AuthContext';
import { ProjectContext } from '../../context/ProjectContext';
import './DeveloperLayout.css';
import { Box, Button } from '@mui/material';

const DeveloperLayout = ({ projectId, onComplete }) => {
  const { logout, currentUser } = useAuth();
  const { getProjectsByUser } = useContext(ProjectContext);
  const [myProjects, setMyProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('sprints');
  const [phaseCompleted, setPhaseCompleted] = useState(false);
  const [timeLogs, setTimeLogs] = useState([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  
  // Progress tracking data
  const [progressData, setProgressData] = useState({
    tasksCompleted: 12,
    totalTasks: 20,
    codeCoverage: 78,
    bugsFixed: 8,
    totalBugs: 10,
    progressHistory: [30, 45, 60, 78],
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    tasks: true,
    development: true,
    deliverables: true,
    collaboration: true,
    myProjects: true,
    timeTracking: true
  });

  // Task checklist state
  const [taskChecklist, setTaskChecklist] = useState([
    { id: 1, text: 'Code written and commented', completed: true },
    { id: 2, text: 'Unit tests created', completed: true },
    { id: 3, text: 'Code reviewed by peer', completed: false },
    { id: 4, text: 'Feature tested locally', completed: false },
    { id: 5, text: 'Documentation updated', completed: false },
    { id: 6, text: 'Pull request created', completed: false },
    { id: 7, text: 'No critical bugs present', completed: false }
  ]);

  // Toggle checklist item
  const toggleChecklistItem = (id) => {
    setTaskChecklist(taskChecklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  // Time tracking functions
  const startTimer = () => {
    if (!isTimerRunning) {
      const startTime = Date.now() - elapsedTime;
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
      setTimerInterval(interval);
      setIsTimerRunning(true);
    }
  };

  const pauseTimer = () => {
    clearInterval(timerInterval);
    setIsTimerRunning(false);
  };

  const stopTimer = () => {
    clearInterval(timerInterval);
    setIsTimerRunning(false);
    // Save the time log
    const newLog = {
      id: Date.now(),
      date: new Date().toISOString(),
      duration: elapsedTime,
      task: 'Development work',
      description: 'Working on feature implementation'
    };
    setTimeLogs([...timeLogs, newLog]);
    setElapsedTime(0);
  };

  const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Load projects and tasks for the current user
  useEffect(() => {
    if (currentUser?.id) {
      const projects = getProjectsByUser(currentUser.id);
      setMyProjects(projects);
      // Load time logs from localStorage or API
      const savedTimeLogs = localStorage.getItem(`timeLogs_${currentUser.id}`);
      if (savedTimeLogs) {
        setTimeLogs(JSON.parse(savedTimeLogs));
      }
    }
    
    // Cleanup interval on unmount
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [currentUser, getProjectsByUser]);
  
  // Save time logs when they change
  useEffect(() => {
    if (currentUser?.id && timeLogs.length > 0) {
      localStorage.setItem(`timeLogs_${currentUser.id}`, JSON.stringify(timeLogs));
    }
  }, [timeLogs, currentUser]);

  // Handle phase completion
  const handleCompletePhase = () => {
    // Check if all checklist items are completed
    const allChecklistItemsCompleted = taskChecklist.every(item => item.completed);
    
    if (!allChecklistItemsCompleted) {
      alert('Please complete all checklist items before marking the phase as complete.');
      return;
    }
    
    // Save final development phase data
    const completionData = {
      completedAt: new Date().toISOString(),
      totalTasks: progressData.totalTasks,
      tasksCompleted: progressData.tasksCompleted,
      codeCoverage: progressData.codeCoverage,
      bugsFixed: progressData.bugsFixed,
      totalBugs: progressData.totalBugs,
      timeSpent: timeLogs.reduce((total, log) => total + log.duration, 0)
    };
    
    console.log('Phase completion data:', completionData);
    
    // Mark phase as completed
    setPhaseCompleted(true);
    
    // Notify parent component
    if (onComplete) {
      onComplete(completionData);
    }
  };

  // Check if all sprints are completed
  const checkPhaseCompletion = useCallback(() => {
    // Check if all tasks are completed and all checklist items are checked
    const tasksComplete = progressData.tasksCompleted >= progressData.totalTasks;
    const allChecklistItemsCompleted = taskChecklist.every(item => item.completed);
    const allSprintsCompleted = tasksComplete && allChecklistItemsCompleted;
    
    setPhaseCompleted(allSprintsCompleted);
    return allSprintsCompleted;
  }, [progressData, taskChecklist]);

  useEffect(() => {
    checkPhaseCompletion();
  }, [checkPhaseCompletion]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-logo">
          <h2>Dev Portal</h2>
        </div>
        
        <div className="user-profile">
          <div className="user-avatar">
            <img 
              src="https://via.placeholder.com/40" 
              alt="User" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2NjYyIgZD0iTTEyLDEyQzE0LjIxLDEyIDE2LDEwLjIxIDE2LDhTMTQuMjEsNCAxMiw0UzgsNS43OSA4LDhTOS43OSwxMiAxMiwxMk0xMiwxNEM3LjU4LDE0IDQsMTUuNzkgNCwxOFYyMEgyMFYxOEMyMCwxNS43OSAxNi40MiwxNCAxMiwxNFoiLz48L3N2Zz4=';
              }}
            />
          </div>
          <div className="user-info">
            <span className="user-name">{currentUser?.name || 'Developer'}</span>
            <span className="user-role">Developer</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li className={isActive('/dashboard')}>
              <Link to="/dashboard">
                <FaHome className="nav-icon" />
                <span>Dashboard</span>
              </Link>
            </li>

            {/* My Projects Section */}
            <li className={`nav-section ${expandedSections.myProjects ? 'expanded' : ''}`}>
              <div className="section-header" onClick={() => toggleSection('myProjects')}>
                <FaProjectDiagram className="nav-icon" />
                <span>My Projects</span>
                {expandedSections.myProjects ? <FaChevronDown /> : <FaChevronRight />}
              </div>
              {expandedSections.myProjects && (
                <ul className="submenu">
                  {myProjects.length > 0 ? (
                    myProjects.map(project => (
                      <li key={project.id} className={isActive(`/projects/${project.id}`)}>
                        <Link to={`/projects/${project.id}`}>
                          <span className="project-name">{project.projectName || 'Unnamed Project'}</span>
                          {project.status === 'in-progress' && (
                            <span className="project-status in-progress">In Progress</span>
                          )}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="no-projects">No projects assigned</li>
                  )}
                </ul>
              )}
            </li>

            {/* Task Management Section */}
            <li className={`nav-section ${expandedSections.tasks ? 'expanded' : ''}`}>
              <div className="section-header" onClick={() => toggleSection('tasks')}>
                <FaTasks className="nav-icon" />
                <span>Task Management</span>
                {expandedSections.tasks ? <FaChevronDown /> : <FaChevronRight />}
              </div>
              {expandedSections.tasks && (
                <ul className="submenu">
                  <li className={isActive('/tasks/assigned')}>
                    <Link to="/tasks/assigned">
                      <FaCheckCircle className="submenu-icon" />
                      <span>Assigned Tasks</span>
                    </Link>
                  </li>
                  <li className={isActive('/tasks/in-progress')}>
                    <Link to="/tasks/in-progress">
                      <FaClock className="submenu-icon" />
                      <span>In Progress</span>
                    </Link>
                  </li>
                  <li className={isActive('/tasks/completed')}>
                    <Link to="/tasks/completed">
                      <FaCheckSquare className="submenu-icon" />
                      <span>Completed</span>
                    </Link>
                  </li>
                  <li className={isActive('/tasks/blockers')}>
                    <Link to="/tasks/blockers">
                      <FaExclamationTriangle className="submenu-icon" />
                      <span>Blockers</span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Development Work Section */}
            <li className={`nav-section ${expandedSections.development ? 'expanded' : ''}`}>
              <div className="section-header" onClick={() => toggleSection('development')}>
                <FaCode className="nav-icon" />
                <span>Development</span>
                {expandedSections.development ? <FaChevronDown /> : <FaChevronRight />}
              </div>
              {expandedSections.development && (
                <ul className="submenu">
                  <li className={isActive('/development/code')}>
                    <Link to="/development/code">
                      <FaFileCode className="submenu-icon" />
                      <span>Code Editor</span>
                    </Link>
                  </li>
                  <li className={isActive('/development/apis')}>
                    <Link to="/development/apis">
                      <FaCodeBranch className="submenu-icon" />
                      <span>API Endpoints</span>
                    </Link>
                  </li>
                  <li className={isActive('/development/database')}>
                    <Link to="/development/database">
                      <FaDatabase className="submenu-icon" />
                      <span>Database</span>
                    </Link>
                  </li>
                  <li className={isActive('/development/integrations')}>
                    <Link to="/development/integrations">
                      <FaPlug className="submenu-icon" />
                      <span>Integrations</span>
                    </Link>
                  </li>
                  <li className={isActive('/development/testing')}>
                    <Link to="/development/testing">
                      <FaVial className="submenu-icon" />
                      <span>Testing</span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Deliverables Section */}
            <li className={`nav-section ${expandedSections.deliverables ? 'expanded' : ''}`}>
              <div className="section-header" onClick={() => toggleSection('deliverables')}>
                <FaUpload className="nav-icon" />
                <span>Deliverables</span>
                {expandedSections.deliverables ? <FaChevronDown /> : <FaChevronRight />}
              </div>
              {expandedSections.deliverables && (
                <ul className="submenu">
                  <li className={isActive('/deliverables/checklist')}>
                    <Link to="/deliverables/checklist" className="checklist-link">
                      <FaCheckSquare className="submenu-icon" />
                      <div className="menu-item-content">
                        <span>Submission Checklist</span>
                        <span className="checklist-progress">
                          {taskChecklist.filter(item => item.completed).length}/{taskChecklist.length}
                        </span>
                      </div>
                    </Link>
                  </li>
                  <li className={isActive('/deliverables/code-review')}>
                    <Link to="/deliverables/code-review">
                      <FaCodeMerge className="submenu-icon" />
                      <span>Code Review</span>
                    </Link>
                  </li>
                  <li className={isActive('/deliverables/peer-review')}>
                    <Link to="/deliverables/peer-review">
                      <FaUserCheck className="submenu-icon" />
                      <span>Peer Review</span>
                    </Link>
                  </li>
                  <li className={isActive('/deliverables/history')}>
                    <Link to="/deliverables/history">
                      <FaHistory className="submenu-icon" />
                      <span>Version History</span>
                    </Link>
                  </li>
                  <li className={isActive('/deliverables/feedback')}>
                    <Link to="/deliverables/feedback">
                      <FaComments className="submenu-icon" />
                      <span>Review Feedback</span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Time Tracking Section */}
            <li className={`nav-section ${expandedSections.timeTracking ? 'expanded' : ''}`}>
              <div className="section-header" onClick={() => toggleSection('timeTracking')}>
                <FaStopwatch className="nav-icon" />
                <span>Time Tracking</span>
                {expandedSections.timeTracking ? <FaChevronDown /> : <FaChevronRight />}
              </div>
              {expandedSections.timeTracking && (
                <div className="time-tracking-widget">
                  <div className="timer-display">
                    {formatTime(elapsedTime)}
                  </div>
                  <div className="timer-controls">
                    {!isTimerRunning ? (
                      <button onClick={startTimer} className="timer-button start">
                        <FaPlay />
                      </button>
                    ) : (
                      <button onClick={pauseTimer} className="timer-button pause">
                        <FaPause />
                      </button>
                    )}
                    <button onClick={stopTimer} className="timer-button stop">
                      <FaStop />
                    </button>
                  </div>
                  <div className="time-logs-summary">
                    <span>Today: {timeLogs.length} logs</span>
                    <Link to="/time-logs" className="view-all">View All</Link>
                  </div>
                </div>
              )}
            </li>

            {/* Collaboration Section */}
            <li className={`nav-section ${expandedSections.collaboration ? 'expanded' : ''}`}>
              <div className="section-header" onClick={() => toggleSection('collaboration')}>
                <FaUsers className="nav-icon" />
                <span>Collaboration</span>
                {expandedSections.collaboration ? <FaChevronDown /> : <FaChevronRight />}
              </div>
              {expandedSections.collaboration && (
                <ul className="submenu">
                  <li className={isActive('/collaboration/standup')}>
                    <Link to="/collaboration/standup">
                      <FaCalendarAlt className="submenu-icon" />
                      <span>Daily Standup</span>
                    </Link>
                  </li>
                  <li className={isActive('/collaboration/code-reviews')}>
                    <Link to="/collaboration/code-reviews">
                      <FaCodeBranch className="submenu-icon" />
                      <span>Code Reviews</span>
                    </Link>
                  </li>
                  <li className={isActive('/collaboration/discussions')}>
                    <Link to="/collaboration/discussions">
                      <FaComments className="submenu-icon" />
                      <span>Discussions</span>
                    </Link>
                  </li>
                  <li className={isActive('/collaboration/documentation')}>
                    <Link to="/collaboration/documentation">
                      <FaBook className="submenu-icon" />
                      <span>Documentation</span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            <li className={isActive('/calendar')}>
              <Link to="/calendar">
                <FaCalendarAlt className="nav-icon" />
                <span>Calendar</span>
              </Link>
            </li>
          </ul>
          
          <div className="logout-section">
            <button onClick={handleLogout} className="logout-button">
              <FaSignOutAlt className="nav-icon" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>
      
      <main className="main-content">
        {/* Progress Overview Card */}
        <div className="progress-overview">
          <div className="progress-card">
            <h3>Project Progress</h3>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ width: `${(progressData.tasksCompleted / progressData.totalTasks) * 100}%` }}
              ></div>
            </div>
            <div className="progress-stats">
              <span>{progressData.tasksCompleted}/{progressData.totalTasks} tasks</span>
              <span>{Math.round((progressData.tasksCompleted / progressData.totalTasks) * 100)}% complete</span>
            </div>
            
            <div className="progress-chart">
              <Line
                data={{
                  labels: progressData.labels,
                  datasets: [
                    {
                      label: 'Progress',
                      data: progressData.progressHistory,
                      borderColor: 'rgba(75, 192, 192, 1)',
                      backgroundColor: 'rgba(75, 192, 192, 0.2)',
                      tension: 0.4,
                      fill: true
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: function(value) {
                          return value + '%';
                        }
                      }
                    }
                  }
                }}
              />
            </div>
            
            <div className="progress-metrics">
              <div className="metric">
                <span className="metric-label">Code Coverage</span>
                <span className="metric-value">{progressData.codeCoverage}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Bugs Fixed</span>
                <span className="metric-value">{progressData.bugsFixed}/{progressData.totalBugs}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Time Logged</span>
                <span className="metric-value">
                  {Math.round(timeLogs.reduce((total, log) => total + log.duration, 0) / 3600000)}h
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <Outlet />
      </main>
    </div>
  );
};

export default DeveloperLayout;
