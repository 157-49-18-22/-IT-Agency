import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  FaRegClock
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    projects: false,
    uiUx: false,
    development: false,
    testing: false,
    team: false,
    reports: false
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

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>IT Agency PMS</h2>
      </div>
      
      <div className="user-profile">
        <div className="user-avatar">
          <img src="https://via.placeholder.com/40" alt="User" />
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
                <li className={isActive('/projects/create')}>
                  <Link to="/projects/create">+ New Project</Link>
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
                <li><Link to="/testing/Bug">Bug Reports</Link></li>
                <li><Link to="/testing/Uat">UAT</Link></li>
                <li><Link to="/testing/Performance">Performance Testing</Link></li>
              </ul>
            )}
          </li>

          {/* Team & Resources */}
          <li className={`nav-section ${expandedSections.team ? 'expanded' : ''}`}>
            <Link to="/team" className="section-header">
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

          
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn">
          <FaSignOutAlt className="logout-icon" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;