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
import { projectsAPI } from '../../services/api';
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
            setIsLoading(true);

            // Fetch Projects - Use projectsAPI to get ALL projects, not just UI/UX specific ones
            const projectsResponse = await projectsAPI.getProjects();
            let fetchedProjects = [];

            // Robust data extraction
            if (projectsResponse.data) {
                if (Array.isArray(projectsResponse.data)) {
                    fetchedProjects = projectsResponse.data;
                } else if (Array.isArray(projectsResponse.data.data)) {
                    fetchedProjects = projectsResponse.data.data;
                } else if (Array.isArray(projectsResponse.data.projects)) {
                    fetchedProjects = projectsResponse.data.projects;
                }
            }

            setUiuxProjects(fetchedProjects);

            // Fetch User Tasks
            let fetchedTasks = [];
            try {
                // Try to get user tasks if the endpoint exists
                const tasksResponse = await uiuxService.getUserTasks();
                fetchedTasks = Array.isArray(tasksResponse.data) ? tasksResponse.data : (tasksResponse.data?.data || []);
            } catch (taskErr) {
                console.warn("Could not fetch user tasks, trying project tasks...");
            }

            setTasks(fetchedTasks);

            // Calculate total hours if available in task data
            const totalHours = fetchedTasks.reduce((acc, task) => {
                // assuming task.timeSpent is a string like "4h" or number
                const hours = parseFloat(task.timeSpent) || 0;
                return acc + hours;
            }, 0);
            setTotalHoursLogged(totalHours);

        } catch (err) {
            console.error("Error loading dashboard data:", err);
            setError("Failed to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const activeProjectsCount = uiuxProjects.filter(p => !['Completed', 'Cancelled', 'Archived'].includes(p.status)).length;

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
                        <span className="card-value">{activeProjectsCount}</span>
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
                            {tasks.length > 0 ? (
                                tasks.map(task => (
                                    <div key={task.id || Math.random()} className="task-item-modern">
                                        <div className={`status-indicator ${task.priority?.toLowerCase() || 'medium'}`}></div>
                                        <div className="task-main">
                                            <h4>{task.title || task.name || 'Untitled Task'}</h4>
                                            <span className="task-meta">{task.status || 'Pending'} • Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Date'}</span>
                                        </div>
                                        <div className="task-progress-mini">
                                            <span className="time">{task.timeSpent || '0h'}</span>
                                            <LinearProgress variant="determinate" value={task.progress || 0} className="progress-bar" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-tasks-message">
                                    <p>No active tasks found.</p>
                                </div>
                            )}
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
