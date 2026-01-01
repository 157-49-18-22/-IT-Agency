import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaClock, FaExclamationCircle, FaFilter, FaSearch, FaPlay, FaPause } from 'react-icons/fa';
import axios from 'axios';
import './TaskPages.css';

const AssignedTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        filterTasks();
    }, [tasks, searchTerm, filterPriority, filterStatus]);

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/tasks/assigned');
            setTasks(response.data.tasks || response.data || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filterTasks = () => {
        let filtered = [...tasks];

        if (searchTerm) {
            filtered = filtered.filter(task =>
                task.task_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.task_description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterPriority !== 'all') {
            filtered = filtered.filter(task => task.priority === filterPriority);
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(task => task.status === filterStatus);
        }

        setFilteredTasks(filtered);
    };

    const handleStatusUpdate = async (taskId, newStatus) => {
        try {
            await axios.patch(`/api/tasks/${taskId}/status`, { status: newStatus });
            fetchTasks();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return '#dc3545';
            case 'medium': return '#ffc107';
            case 'low': return '#28a745';
            default: return '#6c757d';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'not started': return '#6c757d';
            case 'in progress': return '#ffc107';
            case 'review': return '#17a2b8';
            case 'completed': return '#28a745';
            case 'blocked': return '#dc3545';
            default: return '#6c757d';
        }
    };

    if (isLoading) {
        return (
            <div className="task-page-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="task-page-container">
            <div className="page-header">
                <div className="header-content">
                    <h1>Assigned Tasks</h1>
                    <p>Manage your assigned development tasks</p>
                </div>
                <div className="header-stats">
                    <div className="stat-badge">
                        <span className="stat-number">{tasks.length}</span>
                        <span className="stat-label">Total</span>
                    </div>
                    <div className="stat-badge in-progress">
                        <span className="stat-number">{tasks.filter(t => t.status === 'in progress').length}</span>
                        <span className="stat-label">In Progress</span>
                    </div>
                </div>
            </div>

            <div className="filters-bar">
                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <FaFilter />
                    <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                        <option value="all">All Priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="not started">Not Started</option>
                        <option value="in progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                    </select>
                </div>
            </div>

            <div className="tasks-grid">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                        <div key={task.id} className="task-card">
                            <div className="task-header">
                                <h3>{task.task_name}</h3>
                                <div className="task-badges">
                                    <span
                                        className="priority-badge"
                                        style={{ background: getPriorityColor(task.priority) }}
                                    >
                                        {task.priority}
                                    </span>
                                    <span
                                        className="status-badge"
                                        style={{ background: getStatusColor(task.status) }}
                                    >
                                        {task.status}
                                    </span>
                                </div>
                            </div>

                            <div className="task-description">
                                <p>{task.task_description}</p>
                            </div>

                            <div className="task-meta">
                                <div className="meta-item">
                                    <FaClock />
                                    <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No deadline'}</span>
                                </div>
                                {task.estimated_hours && (
                                    <div className="meta-item">
                                        <FaClock />
                                        <span>{task.estimated_hours}h estimated</span>
                                    </div>
                                )}
                            </div>

                            <div className="task-actions">
                                {task.status === 'not started' && (
                                    <button
                                        className="action-btn primary"
                                        onClick={() => handleStatusUpdate(task.id, 'in progress')}
                                    >
                                        <FaPlay /> Start Task
                                    </button>
                                )}
                                {task.status === 'in progress' && (
                                    <>
                                        <button
                                            className="action-btn warning"
                                            onClick={() => handleStatusUpdate(task.id, 'review')}
                                        >
                                            <FaCheckCircle /> Submit for Review
                                        </button>
                                        <button
                                            className="action-btn danger"
                                            onClick={() => handleStatusUpdate(task.id, 'blocked')}
                                        >
                                            <FaExclamationCircle /> Mark Blocked
                                        </button>
                                    </>
                                )}
                                {task.status === 'blocked' && (
                                    <button
                                        className="action-btn success"
                                        onClick={() => handleStatusUpdate(task.id, 'in progress')}
                                    >
                                        <FaPlay /> Resume Task
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <FaCheckCircle size={64} />
                        <h3>No tasks found</h3>
                        <p>
                            {tasks.length === 0
                                ? 'No tasks assigned to you yet'
                                : 'No tasks match your filters'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignedTasks;

