import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaChartLine, 
  FaUsers, 
  FaFileAlt,
  FaCode,
  FaBug,
  FaCheckCircle,
  FaProjectDiagram,
  FaTasks,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaClipboardCheck,
  FaTools,
  FaFileContract,
  FaUserTie,
  FaRegClock,
  FaBell,
  FaComments,
  FaHistory,
  FaFolderOpen,
  FaExchangeAlt,
  FaUserCircle
} from 'react-icons/fa';
import './Sidebar.css';

import { Outlet } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({
    projects: false,
    departments: true,
    uiUx: false,
    development: false,
    testing: false,
    reports: false,
    client: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = async () => {
    try {
      // Clear all auth related data
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Optional: Call logout API if you have one
      try {
        await authAPI.logout();
      } catch (apiError) {
        console.warn('Logout API error:', apiError);
        // Continue with logout even if API call fails
      }
      
      // Redirect to login page
      navigate('/', { replace: true });
      
      // Force a full page reload to ensure all application state is cleared
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, still try to redirect to login
      navigate('/');
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-logo">
          <h2>IT Agency PMS</h2>
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
            <span className="user-name">Admin User</span>
            <span className="user-role">Administrator</span>
          </div>
          <FaChevronDown className="dropdown-arrow" />
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className={isActive('/dashboard')}>
              <Link to="/dashboard">
                <FaHome className="nav-icon" />
                <span>Dashboard</span>
              </Link>
            </li>

            {/* Projects Section */}
            <li className={`nav-section ${expandedSections.projects ? 'expanded' : ''}`}>
              <div className="section-header" onClick={() => toggleSection('projects')}>
                <FaProjectDiagram className="nav-icon" />
                <span>Projects</span>
                {expandedSections.projects ? <FaChevronDown /> : <FaChevronRight />}
              </div>
              {expandedSections.projects && (
                <ul className="submenu">
                  <li className={isActive('/projects')}>
                    <Link to="/projects">All Projects</Link>
                  </li>
                  <li className={isActive('/projects/active')}>
                    <Link to="/projects/active">Active</Link>
                  </li>
                  <li className={isActive('/projects/completed')}>
                    <Link to="/projects/completed">Completed</Link>
                  </li>
                  <li className={isActive('/projects/new')}>
                    <Link to="/projects/new">+ New Project</Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Departments Section */}
            <li className={`nav-section ${expandedSections.departments ? 'expanded' : ''}`}>
              <div className="section-header" onClick={() => toggleSection('departments')}>
                <FaUsers className="nav-icon" />
                <span>Departments</span>
                {expandedSections.departments ? <FaChevronDown /> : <FaChevronRight />}
              </div>
              {expandedSections.departments && (
                <ul className="submenu">
                  <li className={isActive('/departments/my-tasks')}>
                    <Link to="/departments/my-tasks">My Tasks</Link>
                  </li>
                  <li className={isActive('/departments/development')}>
                    <Link to="/departments/development">Development</Link>
                  </li>
                  <li className={isActive('/departments/ui-ux')}>
                    <Link to="/departments/ui-ux">UI/UX Design</Link>
                  </li>
                  <li className={isActive('/departments/testing')}>
                    <Link to="/departments/testing">Testing</Link>
                  </li>
                </ul>
              )}
            </li>

            {/* UI/UX Phase */}
            <li className={`nav-section ${expandedSections.uiUx ? 'expanded' : ''}`}>
              <div className="section-header" onClick={() => toggleSection('uiUx')}>
                <FaFileAlt className="nav-icon" />
                <span>UI/UX Design</span>
                {expandedSections.uiUx ? <FaChevronDown /> : <FaChevronRight />}
              </div>
              {expandedSections.uiUx && (
                <ul className="submenu">
                  <li><Link to="/uiux/wireframes">Wireframes</Link></li>
                  <li><Link to="/uiux/mockups">Mockups</Link></li>
                  <li><Link to="/uiux/prototypes">Prototypes</Link></li>
                  <li><Link to="/uiux/design-system">Design System</Link></li>
                  <li><Link to="/uiux/client-approval">Client Approval</Link></li>
                </ul>
              )}
            </li>

            {/* Development Phase */}
            <li className={`nav-section ${expandedSections.development ? 'expanded' : ''}`}>
              <div className="section-header" onClick={() => toggleSection('development')}>
                <FaCode className="nav-icon" />
                <span>Development</span>
                {expandedSections.development ? <FaChevronDown /> : <FaChevronRight />}
              </div>
              {expandedSections.development && (
                <ul className="submenu">
                  <li className={isActive('/development/backlog')}><Link to="/development/backlog">Backlog</Link></li>
                  <li className={isActive('/development/sprints')}><Link to="/development/sprints">Sprints</Link></li>
                  <li className={isActive('/development/code')}><Link to="/development/code">Code</Link></li>
                  <li className={isActive('/development/deployment')}><Link to="/development/deployment">Deployment</Link></li>
                  <li className={isActive('/development/task')}><Link to="/development/task">Tasks</Link></li>
                  <li className={isActive('/development/version')}><Link to="/development/version">Version</Link></li>
                </ul>
              )}
            </li>

            {/* Testing Phase */}
            <li className={`nav-section ${expandedSections.testing ? 'expanded' : ''}`}>
              <div className="section-header" onClick={() => toggleSection('testing')}>
                <FaBug className="nav-icon" />
                <span>Testing</span>
                {expandedSections.testing ? <FaChevronDown /> : <FaChevronRight />}
              </div>
              {expandedSections.testing && (
                <ul className="submenu">
                  <li><Link to="/testing/Cases">Test Cases</Link></li>
                  <li><Link to="/testing/Runs">Test Runs</Link></li>
                  <li><Link to="/testing/Bug">Bug Reports</Link></li>
                  <li><Link to="/testing/Uat">UAT</Link></li>
                  <li><Link to="/testing/Performance">Performance Testing</Link></li>
                </ul>
              )}
            </li>

            {/* Team */}
            <li className={isActive('/team')}>
              <Link to="/team">
                <FaUsers className="nav-icon" />
                <span>Team</span>
              </Link>
            </li>

            <li className={isActive('/clients')}>
              <Link to="/clients">
                <FaUserTie className="nav-icon" />
                <span>Clients</span>
              </Link>
            </li>

            {/* Approvals */}
            <li className={isActive('/approvals')}>
              <Link to="/approvals">
                <FaClipboardCheck className="nav-icon" />
                <span>Approvals</span>
              </Link>
            </li>

            {/* Deliverables / Files */}
            <li className={isActive('/files')}>
              <Link to="/files">
                <FaFolderOpen className="nav-icon" />
                <span>Deliverables</span>
              </Link>
            </li>

            {/* Messages */}
            <li className={isActive('/messages')}>
              <Link to="/messages">
                <FaComments className="nav-icon" />
                <span>Messages</span>
              </Link>
            </li>

            {/* Notifications */}
            <li className={isActive('/notifications')}>
              <Link to="/notifications">
                <FaBell className="nav-icon" />
                <span>Notifications</span>
              </Link>
            </li>

            {/* Activity */}
            <li className={isActive('/activity')}>
              <Link to="/activity">
                <FaHistory className="nav-icon" />
                <span>Activity</span>
              </Link>
            </li>

            <li className={isActive('/tasks')}>
              <Link to="/tasks">
                <FaTasks className="nav-icon" />
                <span>Tasks</span>
              </Link>
            </li>

            <li className={isActive('/calendar')}>
              <Link to="/calendar">
                <FaCalendarAlt className="nav-icon" />
                <span>Calendar</span>
              </Link>
            </li>

            <li className={isActive('/time-tracking')}>
              <Link to="/time-tracking">
                <FaRegClock className="nav-icon" />
                <span>Time Tracking</span>
              </Link>
            </li>

            {/* Reports Section */}
            <li className={`nav-section ${expandedSections.reports ? 'expanded' : ''}`}>
              <div className="section-header" onClick={() => toggleSection('reports')}>
                <FaChartLine className="nav-icon" />
                <span>Reports</span>
                {expandedSections.reports ? <FaChevronDown /> : <FaChevronRight />}
              </div>
              {expandedSections.reports && (
                <ul className="submenu">
                  <li><Link to="/reports/project-progress">Project Progress</Link></li>
                  <li><Link to="/reports/team-performance">Team Performance</Link></li>
                  <li><Link to="/reports/financial">Financial Reports</Link></li>
                  <li><Link to="/reports/custom">Custom Reports</Link></li>
                </ul>
              )}
            </li>

            {/* Stage Management */}
            <li className={isActive('/stage-transition')}>
              <Link to="/stage-transition">
                <FaExchangeAlt className="nav-icon" />
                <span>Stage Transition</span>
              </Link>
            </li>

            {/* Client Portal Section */}
            <li className={`nav-section ${expandedSections.client ? 'expanded' : ''}`}>
              <div className="section-header" onClick={() => toggleSection('client')}>
                <FaUserCircle className="nav-icon" />
                <span>Client Portal</span>
                {expandedSections.client ? <FaChevronDown /> : <FaChevronRight />}
              </div>
              {expandedSections.client && (
                <ul className="submenu">
                  <li><Link to="/client/dashboard">Client Dashboard</Link></li>
                  <li><Link to="/client/approvals">Client Approvals</Link></li>
                </ul>
              )}
            </li>

          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="logout-icon" />
            Logout
          </button>
        </div>
      </div>
      
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Sidebar;