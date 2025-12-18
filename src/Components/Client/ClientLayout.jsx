import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FaHome, FaChartLine, FaFileAlt, FaComments,
    FaBell, FaCheckCircle, FaSignOutAlt, FaUser,
    FaPalette, FaCode, FaVial, FaDownload
} from 'react-icons/fa';
import './ClientPortal.css';

const ClientLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, currentUser } = useAuth();

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="client-portal">
            {/* Sidebar */}
            <div className={`client-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
                <div className="sidebar-header">
                    <h2>Client Portal</h2>
                    <button className="sidebar-toggle" onClick={toggleSidebar}>
                        {sidebarOpen ? '«' : '»'}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        <li className={isActive('/client/dashboard')}>
                            <Link to="/client/dashboard">
                                <FaHome className="nav-icon" />
                                <span className="nav-text">Dashboard</span>
                            </Link>
                        </li>

                        <li className={isActive('/client/progress')}>
                            <Link to="/client/progress">
                                <FaChartLine className="nav-icon" />
                                <span className="nav-text">Project Progress</span>
                            </Link>
                        </li>

                        <li className="nav-section-header">
                            <span>Stage Monitoring</span>
                        </li>

                        <li className={isActive('/client/uiux-monitoring')}>
                            <Link to="/client/uiux-monitoring">
                                <FaPalette className="nav-icon" />
                                <span className="nav-text">UI/UX Design</span>
                            </Link>
                        </li>

                        <li className={isActive('/client/development-monitoring')}>
                            <Link to="/client/development-monitoring">
                                <FaCode className="nav-icon" />
                                <span className="nav-text">Development</span>
                            </Link>
                        </li>

                        <li className={isActive('/client/testing-monitoring')}>
                            <Link to="/client/testing-monitoring">
                                <FaVial className="nav-icon" />
                                <span className="nav-text">Testing</span>
                            </Link>
                        </li>

                        <li className="nav-section-header">
                            <span>Actions</span>
                        </li>

                        <li className={isActive('/client/deliverables')}>
                            <Link to="/client/deliverables">
                                <FaFileAlt className="nav-icon" />
                                <span className="nav-text">Deliverables</span>
                            </Link>
                        </li>

                        <li className={isActive('/client/feedback')}>
                            <Link to="/client/feedback">
                                <FaComments className="nav-icon" />
                                <span className="nav-text">Feedback & Approval</span>
                            </Link>
                        </li>

                        <li className={isActive('/client/messages')}>
                            <Link to="/client/messages">
                                <FaComments className="nav-icon" />
                                <span className="nav-text">Messages</span>
                            </Link>
                        </li>

                        <li className={isActive('/client/notifications')}>
                            <Link to="/client/notifications">
                                <FaBell className="nav-icon" />
                                <span className="nav-text">Notifications</span>
                                <span className="badge">3</span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile">
                        <div className="user-avatar">
                            <FaUser />
                        </div>
                        <div className="user-info">
                            <h4>{currentUser?.name || 'Client Name'}</h4>
                            <p>Client</p>
                        </div>
                    </div>
                    <button className="btn-logout" onClick={handleLogout}>
                        <FaSignOutAlt /> Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="client-main-content">
                <Outlet />
            </div>
        </div>
    );
};

export default ClientLayout;
