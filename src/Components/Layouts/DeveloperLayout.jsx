import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FaHome, FaCode, FaCalendarAlt, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './DeveloperLayout.css';

const DeveloperLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="developer-layout">
      <aside className="developer-sidebar">
        <div className="sidebar-logo">
          <h2>Dev Portal</h2>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/dashboard" className="nav-link">
                <FaHome className="nav-icon" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/development" className="nav-link">
                <FaCode className="nav-icon" />
                <span>Development</span>
              </Link>
            </li>
            <li>
              <Link to="/calendar" className="nav-link">
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
      </aside>
      
      <main className="developer-main">
        <Outlet />
      </main>
    </div>
  );
};

export default DeveloperLayout;
