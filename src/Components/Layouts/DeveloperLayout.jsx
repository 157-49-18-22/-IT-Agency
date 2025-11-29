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
  FaSearch
} from 'react-icons/fa';
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
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    tasks: true,
    development: true,
    deliverables: true,
    collaboration: true,
    myProjects: true
  });

  // Load projects and tasks for the current user
  useEffect(() => {
    if (currentUser?.id) {
      const projects = getProjectsByUser(currentUser.id);
      setMyProjects(projects);
      // Additional initialization can be done here
    }
  }, [currentUser, getProjectsByUser]);

  // Handle phase completion
  const handleCompletePhase = () => {
    // TODO: Save any final development phase data
    
    // Mark phase as completed
    setPhaseCompleted(true);
    
    // Notify parent component
    if (onComplete) {
      onComplete();
    }
  };

  // Check if all sprints are completed
  const checkPhaseCompletion = useCallback(() => {
    // TODO: Replace with actual check for completed sprints
    const allSprintsCompleted = true; // mock value
    setPhaseCompleted(allSprintsCompleted);
  }, []);

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
                    <Link to="/deliverables/checklist">
                      <FaCheckSquare className="submenu-icon" />
                      <span>Submission Checklist</span>
                    </Link>
                  </li>
                  <li className={isActive('/deliverables/review')}>
                    <Link to="/deliverables/review">
                      <FaSearch className="submenu-icon" />
                      <span>Code Review</span>
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
        <Outlet />
      </main>
    </div>
  );
};

export default DeveloperLayout;
