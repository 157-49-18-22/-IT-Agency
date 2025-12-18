import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaPlus, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import './TaskPages.css';

const Blockers = () => {
    const [blockers, setBlockers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newBlocker, setNewBlocker] = useState({
        title: '',
        description: '',
        priority: 'medium',
        taskId: ''
    });

    useEffect(() => {
        fetchBlockers();
    }, []);

    const fetchBlockers = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/tasks?status=blocked');
            setBlockers(response.data.tasks || response.data || []);
        } catch (error) {
            console.error('Error fetching blockers:', error);
            setBlockers([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResolve = async (blockerId) => {
        try {
            await axios.patch(`/api/tasks/${blockerId}/status`, { status: 'in progress' });
            fetchBlockers();
        } catch (error) {
            console.error('Error resolving blocker:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="task-page-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading blockers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="task-page-container">
            <div className="page-header">
                <div className="header-content">
                    <h1>Blockers</h1>
                    <p>Track and resolve issues blocking your progress</p>
                </div>
                <div className="header-stats">
                    <div className="stat-badge" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
                        <span className="stat-number">{blockers.length}</span>
                        <span className="stat-label">Active Blockers</span>
                    </div>
                </div>
            </div>

            <div className="tasks-grid">
                {blockers.length > 0 ? (
                    blockers.map((blocker) => (
                        <div key={blocker.id} className="task-card" style={{ borderLeft: '4px solid #dc3545' }}>
                            <div className="task-header">
                                <h3>{blocker.task_name}</h3>
                                <span className="status-badge" style={{ background: '#dc3545' }}>
                                    <FaExclamationTriangle /> Blocked
                                </span>
                            </div>

                            <div className="task-description">
                                <p>{blocker.task_description}</p>
                            </div>

                            <div className="task-meta">
                                <div className="meta-item">
                                    <FaExclamationTriangle />
                                    <span>Priority: {blocker.priority}</span>
                                </div>
                            </div>

                            <div className="task-actions">
                                <button
                                    className="action-btn success"
                                    onClick={() => handleResolve(blocker.id)}
                                >
                                    <FaCheckCircle /> Mark Resolved
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <FaCheckCircle size={64} style={{ color: '#28a745' }} />
                        <h3>No blockers! 🎉</h3>
                        <p>All tasks are progressing smoothly</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blockers;
