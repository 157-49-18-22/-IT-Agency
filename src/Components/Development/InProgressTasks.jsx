import React, { useState, useEffect } from 'react';
import { FaClock, FaCheckCircle, FaPause, FaPlay, FaStop } from 'react-icons/fa';
import axios from 'axios';
import './TaskPages.css';

const InProgressTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTimer, setActiveTimer] = useState(null);
    const [elapsedTime, setElapsedTime] = useState({});

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/tasks?status=in progress');
            setTasks(response.data.tasks || response.data || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteTask = async (taskId) => {
        try {
            await axios.patch(`/api/tasks/${taskId}/status`, { status: 'review' });
            fetchTasks();
        } catch (error) {
            console.error('Error completing task:', error);
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
                    <h1>In Progress Tasks</h1>
                    <p>Tasks you're currently working on</p>
                </div>
                <div className="header-stats">
                    <div className="stat-badge in-progress">
                        <span className="stat-number">{tasks.length}</span>
                        <span className="stat-label">Active</span>
                    </div>
                </div>
            </div>

            <div className="tasks-grid">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <div key={task.id} className="task-card">
                            <div className="task-header">
                                <h3>{task.task_name}</h3>
                                <span className="status-badge" style={{ background: '#ffc107' }}>
                                    In Progress
                                </span>
                            </div>

                            <div className="task-description">
                                <p>{task.task_description}</p>
                            </div>

                            <div className="task-meta">
                                <div className="meta-item">
                                    <FaClock />
                                    <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No deadline'}</span>
                                </div>
                            </div>

                            <div className="task-actions">
                                <button
                                    className="action-btn success"
                                    onClick={() => handleCompleteTask(task.id)}
                                >
                                    <FaCheckCircle /> Submit for Review
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <FaClock size={64} />
                        <h3>No tasks in progress</h3>
                        <p>Start working on assigned tasks to see them here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InProgressTasks;
