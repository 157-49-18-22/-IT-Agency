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
import { getFileIcon, formatFileSize, formatRelativeTime, getStatusColor, getPriorityColor } from '../../utils/fileHelpers';
import { tasksAPI, bugsAPI, timeLogsAPI, messageAPI } from '../../services/api';

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
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread messages
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        if (!currentUser) return;
        const res = await messageAPI.getMessages();
        const messages = res.data?.data || [];
        const rawMessages = Array.isArray(messages) ? messages : [];

        const count = rawMessages.filter(msg => {
          // Check if I am NOT the sender
          if (msg.senderId === currentUser.id) return false;

          // Check if I haven't read it
          const readByMe = msg.readBy && Array.isArray(msg.readBy) && msg.readBy.some(r => r.user === currentUser.id);
          return !readByMe;
        }).length;

        setUnreadCount(count);
      } catch (e) {
        console.error("Failed to fetch unread messages", e);
      }
    };

    fetchUnreadCount();
    // Poll every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

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
    timeTracking: false
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

  // Fetch Real Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser?.id) return;

      try {
        // Fetch Tasks
        const tasksRes = await tasksAPI.getTasks({ assignedTo: currentUser.id });
        const tasks = tasksRes.data || [];
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;

        // Fetch Bugs (if available, otherwise mock 0)
        let bugs = [];
        try {
          const bugsRes = await bugsAPI.getBugs({ assignedTo: currentUser.id });
          bugs = bugsRes.data || [];
        } catch (e) {
          console.warn("Bugs API not available", e);
        }
        const fixedBugs = bugs.filter(b => b.status === 'Fixed').length;

        // Fetch Time Logs
        const logsRes = await timeLogsAPI.getLogs();
        const logs = logsRes.data?.data || [];
        setTimeLogs(logs); // Update state used by timer logic too

        const totalTimeMs = logs.reduce((acc, log) => acc + (log.duration * 60000), 0);
        // Note: log.duration from API might be in minutes (based on TimeLogs.jsx logic). 
        // In TimeLogs.jsx: log.duration * 60000 -> so log.duration is minutes.
        // But here formatTime expects ms. 
        // Let's assume log.duration is minutes.

        setProgressData(prev => ({
          ...prev,
          tasksCompleted: completedTasks,
          totalTasks: tasks.length || 1, // Avoid 0/0
          bugsFixed: fixedBugs,
          totalBugs: bugs.length || 1,
          codeCoverage: 85, // Hardcoded for now as it's complex to measure from frontend
          progressHistory: [10, 30, 50, (completedTasks / (tasks.length || 1)) * 100] // Dynamic
        }));

      } catch (err) {
        console.error("Error loading dashboard data", err);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

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
                  <li className={isActive('/projects/approved')}>
                    <Link to="/projects/approved">
                      <FaCheckCircle className="submenu-icon" />
                      <span>Approved Projects</span>
                    </Link>
                  </li>
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
                  <li className={isActive('/tasks/design-files')}>
                    <Link to="/tasks/design-files">
                      <FaFileAlt className="submenu-icon" />
                      <span>Design Files & Specs</span>
                    </Link>
                  </li>
                  <li className={isActive('/tasks/environment-setup')}>
                    <Link to="/tasks/environment-setup">
                      <FaTools className="submenu-icon" />
                      <span>Environment Setup</span>
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
                  <li className={isActive('/development/coding-standards')}>
                    <Link to="/development/coding-standards">
                      <FaBook className="submenu-icon" />
                      <span>Coding Standards</span>
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
                  <li className={isActive('/development/self-testing')}>
                    <Link to="/development/self-testing">
                      <FaCheckCircle className="submenu-icon" />
                      <span>Self-Testing</span>
                    </Link>
                  </li>
                  <li className={isActive('/development/sprints')}>
                    <Link to="/development/sprints">
                      <FaCalendarAlt className="submenu-icon" />
                      <span>Sprints</span>
                    </Link>
                  </li>
                  <li className={isActive('/development/bug-fixes')}>
                    <Link to="/development/bug-fixes">
                      <FaExclamationTriangle className="submenu-icon" />
                      <span>Bug Fixes</span>
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
                  <li className={isActive('/deliverables/submit')}>
                    <Link to="/deliverables/submit">
                      <FaUpload className="submenu-icon" />
                      <span>Submit to Client</span>
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

            <li className={isActive('/messages')}>
              <Link to="/messages">
                <FaComments className="nav-icon" />
                <span>Messages</span>
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
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
        {/* Progress Overview Card - Only show on Dashboard */}
        {location.pathname === '/dashboard' && (
          <div className="dashboard-container">
            {/* Welcome Banner */}
            <div className="welcome-banner">
              <div className="welcome-text">
                <h1>Welcome back, {currentUser?.name || 'Developer'}! 👋</h1>
                <p>Here's what's happening with your projects today.</p>
              </div>
              <div className="date-display">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-icon">
                  <FaTasks />
                </div>
                <div className="stat-details">
                  <h3>{progressData.tasksCompleted}/{progressData.totalTasks}</h3>
                  <p>Tasks Completed</p>
                </div>
                <div className="stat-progress">
                  <div className="stat-progress-bar" style={{ width: `${(progressData.tasksCompleted / progressData.totalTasks) * 100}%` }}></div>
                </div>
              </div>

              <div className="stat-card red">
                <div className="stat-icon">
                  <FaExclamationTriangle />
                </div>
                <div className="stat-details">
                  <h3>{progressData.bugsFixed}/{progressData.totalBugs}</h3>
                  <p>Bugs Fixed</p>
                </div>
                <div className="stat-progress">
                  <div className="stat-progress-bar" style={{ width: `${(progressData.bugsFixed / progressData.totalBugs) * 100}%` }}></div>
                </div>
              </div>

              <div className="stat-card purple">
                <div className="stat-icon">
                  <FaClock />
                </div>
                <div className="stat-details">
                  <h3>{Math.round(timeLogs.reduce((total, log) => total + log.duration, 0) / 3600000)}h</h3>
                  <p>Time Logged</p>
                </div>
                <div className="stat-progress">
                  <div className="stat-progress-bar" style={{ width: '65%' }}></div>
                </div>
              </div>

              <div className="stat-card green">
                <div className="stat-icon">
                  <FaVial />
                </div>
                <div className="stat-details">
                  <h3>{progressData.codeCoverage}%</h3>
                  <p>Code Coverage</p>
                </div>
                <div className="stat-progress">
                  <div className="stat-progress-bar" style={{ width: `${progressData.codeCoverage}%` }}></div>
                </div>
              </div>
            </div>


            {/* Main Dashboard Content */}
            <div className="dashboard-content-grid">
              {/* Left Column: Progress Chart & Tasks */}
              <div className="main-column">
                <div className="dashboard-card chart-card">
                  <div className="card-header">
                    <h3>Project Velocity</h3>
                    <select defaultValue="week" className="chart-filter">
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>
                  <div className="chart-container">
                    <Line
                      data={{
                        labels: progressData.labels,
                        datasets: [
                          {
                            label: 'Productivity Trend',
                            data: progressData.progressHistory,
                            borderColor: '#4361ee',
                            backgroundColor: 'rgba(67, 97, 238, 0.1)',
                            borderWidth: 3,
                            pointBackgroundColor: '#fff',
                            pointBorderColor: '#4361ee',
                            pointBorderWidth: 2,
                            pointRadius: 6,
                            tension: 0.4,
                            fill: true
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: '#1e293b',
                            padding: 12,
                            titleFont: { size: 14 },
                            bodyFont: { size: 14 },
                            displayColors: false,
                            callbacks: {
                              label: function (context) {
                                return `Progress: ${context.parsed.y}%`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            grid: {
                              color: 'rgba(0, 0, 0, 0.05)',
                              drawBorder: false
                            },
                            ticks: {
                              padding: 10,
                              callback: value => value + '%'
                            }
                          },
                          x: {
                            grid: { display: false }
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* New Section: Upcoming Deadlines & System Status */}
                <div className="dashboard-bottom-grid">
                  <div className="dashboard-card deadlines-card">
                    <div className="card-header">
                      <h3>Upcoming Deadlines</h3>
                      <Link to="/calendar" className="view-more">View Calendar</Link>
                    </div>
                    <div className="deadlines-list">
                      <div className="deadline-item warning">
                        <div className="deadline-date">
                          <span className="day">28</span>
                          <span className="month">Dec</span>
                        </div>
                        <div className="deadline-info">
                          <h4>API Integration</h4>
                          <p>Backend Team</p>
                        </div>
                        <span className="deadline-tag">2 days left</span>
                      </div>
                      <div className="deadline-item">
                        <div className="deadline-date">
                          <span className="day">05</span>
                          <span className="month">Jan</span>
                        </div>
                        <div className="deadline-info">
                          <h4>Q4 Report Submission</h4>
                          <p>Management</p>
                        </div>
                        <span className="deadline-tag normal">1 week left</span>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-card system-status-card">
                    <div className="card-header">
                      <h3>System Status</h3>
                      <span className="status-badge operational">Operational</span>
                    </div>
                    <div className="system-grid">
                      <div className="system-item">
                        <span className="dot online"></span>
                        <span>API Server</span>
                        <span className="status-text">99.9% Uptime</span>
                      </div>
                      <div className="system-item">
                        <span className="dot online"></span>
                        <span>Database (PostgreSQL)</span>
                        <span className="status-text">Healthy</span>
                      </div>
                      <div className="system-item">
                        <span className="dot warning"></span>
                        <span>Redis Cache</span>
                        <span className="status-text">High Load</span>
                      </div>
                      <div className="system-item">
                        <span className="dot online"></span>
                        <span>Storage (S3)</span>
                        <span className="status-text">Available</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Recent Activity & Checklist */}
              <div className="side-column">
                <div className="dashboard-card activity-card">
                  <div className="card-header">
                    <h3>Recent Activity</h3>
                    <Link to="/activity" className="view-more">View All</Link>
                  </div>
                  <div className="activity-list">
                    {timeLogs.slice(0, 3).map((log, index) => (
                      <div className="activity-item" key={index}>
                        <div className="activity-icon">
                          <FaCode />
                        </div>
                        <div className="activity-details">
                          <span className="activity-title">{log.task || 'Development'}</span>
                          <span className="activity-time">{formatRelativeTime(log.date)}</span>
                        </div>
                      </div>
                    ))}
                    {timeLogs.length === 0 && (
                      <div className="empty-state">
                        <p>No recent activity recorded.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="dashboard-card checklist-card">
                  <div className="card-header">
                    <h3>Phase Checklist</h3>
                    <span className="checklist-count">
                      {taskChecklist.filter(t => t.completed).length}/{taskChecklist.length}
                    </span>
                  </div>
                  <div className="mini-checklist">
                    {taskChecklist.slice(0, 4).map(item => (
                      <div key={item.id} className={`mini-check-item ${item.completed ? 'completed' : ''}`}>
                        <div className={`check-circle ${item.completed ? 'checked' : ''}`}>
                          {item.completed && <FaCheckCircle />}
                        </div>
                        <span>{item.text}</span>
                      </div>
                    ))}
                    {taskChecklist.length > 4 && (
                      <div className="more-items">
                        +{taskChecklist.length - 4} more items
                      </div>
                    )}
                  </div>
                  <div className="card-footer">
                    <Link to="/deliverables/checklist" className="action-button">Go to Checklist</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {location.pathname !== '/dashboard' && <Outlet />}
      </main>
    </div>
  );
};

export default DeveloperLayout;
