import React, { useState, useContext, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Button,
    TextField,
    IconButton,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid
} from '@mui/material';
import {
    FaProjectDiagram,
    FaTasks,
    FaClock,
    FaPlus,
    FaSearch,
    FaFilter,
    FaSort,
    FaRegClipboard,
    FaCheck,
    FaArrowRight,
    FaRegClock,
    FaRegStopCircle,
    FaRegComment,
    FaRegEye,
    FaHistory,
    FaClipboardCheck,
    FaUpload,
    FaCloudUploadAlt,
    FaTimes,
    FaPencilRuler,
    FaImage,
    FaMobileAlt,
    FaDownload,
    FaShareAlt,
    FaComments,
    FaPaperclip,
    FaAt,
    FaRegCheckCircle,
    FaRegCalendarAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { ProjectContext } from '../../context/ProjectContext';
import uiuxService from '../../services/uiuxService';
import './UIDashboard.css';

const UIDashboard = () => {
    const { currentUser } = useAuth();
    const { getProjectsByUser } = useContext(ProjectContext);

    // State
    const [uiuxProjects, setUiuxProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [comments, setComments] = useState([]);
    const [totalHoursLogged, setTotalHoursLogged] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Deliverables Mock Data (since UILayout had it mocked)
    const [mockDeliverables, setMockDeliverables] = useState([
        { id: 1, name: 'Wireframes', status: 'In Progress', type: 'wireframe', files: 2, lastUpdated: '2 hours ago' },
        { id: 2, name: 'Mockups', status: 'Not Started', type: 'mockup', files: 0, lastUpdated: 'Yesterday' },
        { id: 3, name: 'Prototype', status: 'Not Started', type: 'prototype', files: 0, lastUpdated: '3 days ago' },
    ]);

    const [currentDate] = useState(new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }));

    // Helper Functions
    const fetchTasks = async () => {
        try {
            // Mocking task fetch if service fails or just to be safe as we don't have projectId prop here easily unless we fetch all user tasks
            // Ideally we fetch tasks for ALL projects assigned to this user
            const response = await uiuxService.getProjects(); // Just fetching projects for now
            setUiuxProjects(response.data || []);

            // For demo, let's generate some dummy tasks if API returns empty
            const demoTasks = [
                { id: 1, title: 'Homepage Wireframe', status: 'In Progress', priority: 'High', dueDate: '2024-01-20', assignedTo: 'Me', progress: 45, timeSpent: '4h' },
                { id: 2, title: 'Login Flow', status: 'Completed', priority: 'Medium', dueDate: '2024-01-15', assignedTo: 'Me', progress: 100, timeSpent: '8h' },
                { id: 3, title: 'Dashboard Mockup', status: 'To Do', priority: 'High', dueDate: '2024-01-25', assignedTo: 'Me', progress: 0, timeSpent: '0h' },
                { id: 4, title: 'Mobile Responsive Check', status: 'In Review', priority: 'Low', dueDate: '2024-01-22', assignedTo: 'John', progress: 80, timeSpent: '2h' },
            ];
            setTasks(demoTasks);
            setTotalHoursLogged(14.5);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div className="ui-dashboard-container">
            {/* Top Stats Bar */}
            <div className="top-bar-stats">
                <div className="page-title">
                    <h1>UI/UX Dashboard</h1>
                    <p className="subtitle">Welcome back, {currentUser?.name || 'Designer'}</p>
                </div>
                <div className="dashboard-stats">
                    <div className="stat-pill">
                        <FaRegClock className="icon" />
                        <span>{totalHoursLogged}h Tracked</span>
                    </div>
                    <div className="stat-pill">
                        <FaRegCheckCircle className="icon" />
                        <span>{tasks.filter(t => t.status === 'Completed').length}/{tasks.length} Tasks</span>
                    </div>
                    <div className="stat-pill">
                        <FaRegCalendarAlt className="icon" />
                        <span>{currentDate}</span>
                    </div>
                </div>
            </div>

            {/* Main Cards */}
            <div className="dashboard-cards-grid">
                <div className="dashboard-card project-card">
                    <div className="card-icon-wrapper blue">
                        <FaProjectDiagram />
                    </div>
                    <div className="card-info">
                        <h3>Active Projects</h3>
                        <span className="card-value">{uiuxProjects.length || 3}</span>
                    </div>
                </div>

                <div className="dashboard-card task-card">
                    <div className="card-icon-wrapper green">
                        <FaTasks />
                    </div>
                    <div className="card-info">
                        <h3>My Tasks</h3>
                        <span className="card-value">{tasks.filter(t => t.assignedTo === 'Me').length}</span>
                    </div>
                </div>

                <div className="dashboard-card due-card">
                    <div className="card-icon-wrapper orange">
                        <FaClock />
                    </div>
                    <div className="card-info">
                        <h3>Due Soon</h3>
                        <span className="card-value">
                            {tasks.filter(t => t.status !== 'Completed').length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="dashboard-content-grid">
                {/* Left Column: Tasks */}
                <div className="main-column">
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2><FaTasks /> Active Tasks</h2>
                            <Link to="/tasks" className="btn-text">View All</Link>
                        </div>
                        <div className="tasks-list-modern">
                            {tasks.map(task => (
                                <div key={task.id} className="task-item-modern">
                                    <div className={`status-indicator ${task.priority.toLowerCase()}`}></div>
                                    <div className="task-main">
                                        <h4>{task.title}</h4>
                                        <span className="task-meta">{task.status} • Due {task.dueDate}</span>
                                    </div>
                                    <div className="task-progress-mini">
                                        <span className="time">{task.timeSpent}</span>
                                        <LinearProgress variant="determinate" value={task.progress} className="progress-bar" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Deliverables & Activity */}
                <div className="side-column">
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2><FaClipboardCheck /> Recent Deliverables</h2>
                            <button className="btn-icon-small"><FaPlus /></button>
                        </div>
                        <div className="deliverables-list-mini">
                            {mockDeliverables.map(d => (
                                <div key={d.id} className="deliverable-item-mini">
                                    <div className="del-icon">
                                        {d.type === 'wireframe' ? <FaPencilRuler /> : d.type === 'mockup' ? <FaImage /> : <FaMobileAlt />}
                                    </div>
                                    <div className="del-info">
                                        <h4>{d.name}</h4>
                                        <span>{d.lastUpdated}</span>
                                    </div>
                                    <span className={`status-badge-mini ${d.status.toLowerCase().replace(' ', '-')}`}>{d.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2><FaComments /> Team Chat</h2>
                        </div>
                        <div className="empty-state-mini">
                            <p>No new messages</p>
                            <button className="btn-primary-small">Start Discussion</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UIDashboard;
