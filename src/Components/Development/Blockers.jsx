import React, { useState, useEffect, useContext } from 'react';
import { FaExclamationTriangle, FaPlus, FaCheckCircle, FaTrash, FaClock, FaUser, FaProjectDiagram } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { blockerAPI } from '../../services/api';
import { ProjectContext } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import './Blockers.css';

const Blockers = () => {
    const { currentUser } = useAuth();
    const { getProjectsByUser, projects: allProjects } = useContext(ProjectContext);

    const [blockers, setBlockers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [myProjects, setMyProjects] = useState([]);

    const [newBlocker, setNewBlocker] = useState({
        title: '',
        description: '',
        priority: 'medium',
        projectId: '',
        taskId: ''
    });

    useEffect(() => {
        const fetchProjects = async () => {
            let availableProjects = [];

            if (currentUser?.id) {
                availableProjects = getProjectsByUser(currentUser.id);
            }

            if ((!availableProjects || availableProjects.length === 0) && allProjects?.length > 0) {
                availableProjects = allProjects;
            }

            if (!availableProjects || availableProjects.length === 0) {
                try {
                    const token = localStorage.getItem('token');
                    if (token) {
                        const response = await fetch(import.meta.env.VITE_API_URL + '/projects', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const data = await response.json();
                        if (data.success) {
                            availableProjects = data.data;
                        } else if (Array.isArray(data)) {
                            availableProjects = data;
                        } else if (data.data) {
                            availableProjects = data.data;
                        }
                    }
                } catch (err) {
                    console.warn('Fallback project fetch failed', err);
                }
            }

            setMyProjects(availableProjects || []);

            if (availableProjects && availableProjects.length > 0) {
                setNewBlocker(prev => ({
                    ...prev,
                    projectId: prev.projectId || availableProjects[0].id
                }));
            }

            fetchBlockers();
        };

        fetchProjects();
    }, [currentUser, getProjectsByUser, allProjects]);

    const fetchBlockers = async () => {
        try {
            setIsLoading(true);
            const response = await blockerAPI.getBlockers();
            if (response.data.success) {
                setBlockers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching blockers:', error);
            toast.error('Failed to load blockers');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await blockerAPI.createBlocker(newBlocker);
            if (response.data.success) {
                toast.success('Blocker reported successfully');
                setBlockers([response.data.data, ...blockers]);
                setShowAddModal(false);
                setNewBlocker({
                    title: '',
                    description: '',
                    priority: 'medium',
                    projectId: myProjects[0]?.id || '',
                    taskId: ''
                });
            }
        } catch (error) {
            console.error('Error creating blocker:', error);
            toast.error('Failed to report blocker');
        }
    };

    const handleResolve = async (blockerId) => {
        try {
            const response = await blockerAPI.updateBlockerStatus(blockerId, 'resolved');
            if (response.data.success) {
                toast.success('Blocker marked as resolved');
                setBlockers(blockers.map(b =>
                    b.id === blockerId ? response.data.data : b
                ));
            }
        } catch (error) {
            console.error('Error resolving blocker:', error);
            toast.error('Failed to resolve blocker');
        }
    };

    const handleDelete = async (blockerId) => {
        if (!window.confirm('Are you sure you want to delete this blocker?')) return;

        try {
            const response = await blockerAPI.deleteBlocker(blockerId);
            if (response.data.success) {
                toast.success('Blocker deleted');
                setBlockers(blockers.filter(b => b.id !== blockerId));
            }
        } catch (error) {
            console.error('Error deleting blocker:', error);
            toast.error('Failed to delete blocker');
        }
    };

    if (isLoading) {
        return (
            <div className="blocker-page-wrapper">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p style={{ color: '#64748b' }}>Loading blockers...</p>
                </div>
            </div>
        );
    }

    const activeCount = blockers.filter(b => b.status === 'open').length;

    return (
        <div className="blocker-page-wrapper">
            <div className="blocker-header">
                <div className="header-title-section">
                    <h1>Blockers</h1>
                    <p>Track and resolve critical issues blocking development</p>
                </div>

                <div className="stats-container">
                    <div className="stat-card">
                        <div className="stat-icon-wrapper">
                            <FaExclamationTriangle size={18} />
                        </div>
                        <div className="stat-info">
                            <span className="count">{activeCount}</span>
                            <span className="label">Active Issues</span>
                        </div>
                    </div>

                    <button
                        className="add-blocker-btn"
                        onClick={() => setShowAddModal(true)}
                        title="Report New Blocker"
                    >
                        <FaPlus size={20} />
                    </button>
                </div>
            </div>

            <div className="blockers-grid">
                {blockers.length > 0 ? (
                    blockers.map((blocker) => (
                        <div key={blocker.id} className={`blocker-card status-${blocker.status}`}>
                            <div className="blocker-card-header">
                                <div className="blocker-main-info">
                                    <div className="project-tag">
                                        <FaProjectDiagram size={10} style={{ marginRight: '5px' }} />
                                        {blocker.project?.projectName || blocker.project?.name || 'Unnamed Project'}
                                    </div>
                                    <h3>{blocker.title}</h3>
                                </div>
                                <div className={`priority-tag priority-${blocker.priority}`}>
                                    {blocker.priority}
                                </div>
                            </div>

                            <p className="blocker-body">{blocker.description}</p>

                            <div className="blocker-meta-grid">
                                <div className="meta-box">
                                    <span className="meta-label">Reported By</span>
                                    <div className="meta-value">
                                        <div className="reporter-avatar">
                                            {blocker.reporter?.name?.charAt(0) || <FaUser size={8} />}
                                        </div>
                                        {blocker.reporter?.name || 'Unknown'}
                                    </div>
                                </div>
                                <div className="meta-box">
                                    <span className="meta-label">Reported On</span>
                                    <div className="meta-value">
                                        <FaClock size={12} style={{ color: '#94a3b8' }} />
                                        {new Date(blocker.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            <div className="blocker-footer">
                                {blocker.status === 'resolved' ? (
                                    <div className="resolved-badge">
                                        <FaCheckCircle /> Resolved
                                    </div>
                                ) : (
                                    <button
                                        className="resolve-btn"
                                        onClick={() => handleResolve(blocker.id)}
                                    >
                                        <FaCheckCircle size={14} /> Mark Resolved
                                    </button>
                                )}

                                {(currentUser?.id === blocker.reportedBy || currentUser?.role === 'admin') && (
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(blocker.id)}
                                        title="Delete Blocker"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="modern-empty-state">
                        <div className="empty-icon-box">
                            <FaCheckCircle />
                        </div>
                        <h3>All Clear! 🎉</h3>
                        <p>No active blockers reported. Development is cruising!</p>
                    </div>
                )}
            </div>

            {/* Premium Add Blocker Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="blocker-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
                        <div className="modal-header-gradient">
                            <h2>Report New Blocker</h2>
                            <button className="close-modal-btn" onClick={() => setShowAddModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="blocker-form">
                            <div className="form-field">
                                <label>Target Project</label>
                                <select
                                    value={newBlocker.projectId}
                                    onChange={(e) => setNewBlocker({ ...newBlocker, projectId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Project</option>
                                    {myProjects.map(p => (
                                        <option key={p.id} value={p.id}>{p.projectName || p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-field">
                                <label>Blocker Title</label>
                                <input
                                    type="text"
                                    placeholder="Briefly describe the issue..."
                                    value={newBlocker.title}
                                    onChange={(e) => setNewBlocker({ ...newBlocker, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label>Detailed Description</label>
                                <textarea
                                    placeholder="What exactly is holding you up?"
                                    value={newBlocker.description}
                                    onChange={(e) => setNewBlocker({ ...newBlocker, description: e.target.value })}
                                    rows="4"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-field">
                                    <label>Priority Level</label>
                                    <select
                                        value={newBlocker.priority}
                                        onChange={(e) => setNewBlocker({ ...newBlocker, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Estimated Delay (Optional)</label>
                                    <input type="text" placeholder="e.g. 2 days" />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowAddModal(false)} className="btn-ghost">Discard</button>
                                <button type="submit" className="btn-report">Report Blocker</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};


export default Blockers;
