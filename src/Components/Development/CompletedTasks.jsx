import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTrophy, FaChartLine } from 'react-icons/fa';
import axios from 'axios';
import './TaskPages.css';

const CompletedTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/tasks?status=completed');
            setTasks(response.data.tasks || response.data || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]);
        } finally {
            setIsLoading(false);
        }
    };

    const totalHours = tasks.reduce((sum, task) => sum + (task.actual_hours || 0), 0);

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
                    <h1>Completed Tasks</h1>
                    <p>Your accomplishments and completed work</p>
                </div>
                <div className="header-stats">
                    <div className="stat-badge" style={{ background: 'linear-gradient(135deg, #28a745, #20c997)' }}>
                        <span className="stat-number">{tasks.length}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                    <div className="stat-badge" style={{ background: 'linear-gradient(135deg, #17a2b8, #138496)' }}>
                        <span className="stat-number">{Math.round(totalHours)}h</span>
                        <span className="stat-label">Total Time</span>
                    </div>
                </div>
            </div>

            <div className="tasks-grid">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <div key={task.id} className="task-card">
                            <div className="task-header">
                                <h3>{task.task_name}</h3>
                                <span className="status-badge" style={{ background: '#28a745' }}>
                                    <FaCheckCircle /> Completed
                                </span>
                            </div>

                            <div className="task-description">
                                <p>{task.task_description}</p>
                            </div>

                            <div className="task-meta">
                                <div className="meta-item">
                                    <FaCheckCircle />
                                    <span>Completed: {task.completion_date ? new Date(task.completion_date).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                {task.actual_hours && (
                                    <div className="meta-item">
                                        <FaChartLine />
                                        <span>{task.actual_hours}h spent</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <FaTrophy size={64} />
                        <h3>No completed tasks yet</h3>
                        <p>Complete tasks to see your achievements here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompletedTasks;
