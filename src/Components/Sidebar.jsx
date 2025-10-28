import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHouse as FaHome, 
  FaChartLine, 
  FaUsers, 
  FaBox, 
  FaClipboardList as FaClipboard,
  FaGear as FaCog, 
  FaRightFromBracket as FaSignOutAlt,
  FaChevronDown 
} from 'react-icons/fa6';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>Admin Panel</h2>
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
          <li className="active">
            <Link to="/dashboard">
              <FaHome className="nav-icon" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/analytics">
              <FaChartLine className="nav-icon" />
              <span>Analytics</span>
            </Link>
          </li>
          <li>
            <Link to="/users">
              <FaUsers className="nav-icon" />
              <span>Users</span>
            </Link>
          </li>
          <li>
            <Link to="/products">
              <FaBox className="nav-icon" />
              <span>Products</span>
            </Link>
          </li>
          <li>
            <Link to="/orders">
              <FaClipboard className="nav-icon" />
              <span>Orders</span>
            </Link>
          </li>
          <li>
            <Link to="/settings">
              <FaCog className="nav-icon" />
              <span>Settings</span>
            </Link>
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