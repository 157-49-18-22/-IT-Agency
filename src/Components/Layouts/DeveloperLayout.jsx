import React, { useState } from 'react';
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
  FaClipboardList
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './DeveloperLayout.css';

const DeveloperLayout = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    development: true
  });

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

            {/* Development Section */}
            <li className={`nav-section ${expandedSections.development ? 'expanded' : ''}`}>
              <div className="section-header" onClick={() => toggleSection('development')}>
                <FaCode className="nav-icon" />
                <span>Development</span>
                {expandedSections.development ? <FaChevronDown /> : <FaChevronRight />}
              </div>
              {expandedSections.development && (
                <ul className="submenu">
                  <li className={isActive('/development/backlog')}>
                    <Link to="/development/backlog">
                      <FaTasks className="submenu-icon" />
                      <span>Backlog</span>
                    </Link>
                  </li>
                  <li className={isActive('/development/sprints')}>
                    <Link to="/development/sprints">
                      <FaRocket className="submenu-icon" />
                      <span>Sprints</span>
                    </Link>
                  </li>
                  <li className={isActive('/development/tasks')}>
                    <Link to="/development/tasks">
                      <FaClipboardList className="submenu-icon" />
                      <span>Tasks</span>
                    </Link>
                  </li>
                  <li className={isActive('/development/code')}>
                    <Link to="/development/code">
                      <FaCodeBranch className="submenu-icon" />
                      <span>Code</span>
                    </Link>
                  </li>
                  <li className={isActive('/development/deployment')}>
                    <Link to="/development/deployment">
                      <FaServer className="submenu-icon" />
                      <span>Deployment</span>
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
