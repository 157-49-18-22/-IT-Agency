import React, { useState, useEffect, useContext } from 'react';
import { FaExclamationTriangle, FaPlus, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { blockerAPI } from '../../services/api';
import { ProjectContext } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import './TaskPages.css';

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

            // 1. Try getting projects from Context (User specific)
            if (currentUser?.id) {
                availableProjects = getProjectsByUser(currentUser.id);
            }

            // 2. Fallback to All Context Projects
            if ((!availableProjects || availableProjects.length === 0) && allProjects?.length > 0) {
                availableProjects = allProjects;
            }

            // 3. Final Fallback: Fetch directly from API
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

            // Set default selection
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
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="header-stats">
                        <div className="stat-badge" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
                            <span className="stat-number">{blockers.filter(b => b.status === 'open').length}</span>
                            <span className="stat-label">Active Blockers</span>
                        </div>
                    </div>
                    <button
                        className="action-btn primary"
                        onClick={() => setShowAddModal(true)}
                        style={{
                            background: '#dc3545',
                            color: 'white',
                            height: '50px',
                            width: '50px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            boxShadow: '0 4px 6px rgba(220, 53, 69, 0.2)'
                        }}
                        title="Report New Blocker"
                    >
                        <FaPlus size={20} />
                    </button>
                </div>
            </div>

            <div className="tasks-grid">
                {blockers.length > 0 ? (
                    blockers.map((blocker) => (
                        <div key={blocker.id} className="task-card" style={{ borderLeft: `4px solid ${blocker.status === 'resolved' ? '#28a745' : '#dc3545'}` }}>
                            <div className="task-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h3>{blocker.title}</h3>
                                    {blocker.project && (
                                        <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: '#f0f0f0', color: '#666' }}>
                                            {blocker.project.name}
                                        </span>
                                    )}
                                </div>
                                <span className="status-badge" style={{ background: blocker.status === 'resolved' ? '#28a745' : '#dc3545' }}>
                                    {blocker.status === 'resolved' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                                    {blocker.status}
                                </span>
                            </div>

                            <div className="task-description">
                                <p>{blocker.description}</p>
                            </div>

                            <div className="task-meta">
                                <div className="meta-item">
                                    <FaExclamationTriangle />
                                    <span>Priority: {blocker.priority}</span>
                                </div>
                                <div className="meta-item">
                                    <span>Reported by: {blocker.reporter?.name || 'Unknown'}</span>
                                </div>
                            </div>

                            <div className="task-actions">
                                {blocker.status !== 'resolved' && (
                                    <button
                                        className="action-btn success"
                                        onClick={() => handleResolve(blocker.id)}
                                    >
                                        <FaCheckCircle /> Mark Resolved
                                    </button>
                                )}
                                {(currentUser?.id === blocker.reportedBy || currentUser?.role === 'admin') && (
                                    <button
                                        className="action-btn delete"
                                        onClick={() => handleDelete(blocker.id)}
                                        style={{ background: 'none', color: '#dc3545', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}
                                    >
                                        <FaTrash />
                                    </button>
                                )}
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

            {/* Add Blocker Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>Report Blocker</h2>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Project *</label>
                                <select
                                    value={newBlocker.projectId}
                                    onChange={(e) => setNewBlocker({ ...newBlocker, projectId: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                                >
                                    {myProjects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name || p.projectName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Blocker Title *</label>
                                <input
                                    type="text"
                                    value={newBlocker.title}
                                    onChange={(e) => setNewBlocker({ ...newBlocker, title: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Description *</label>
                                <textarea
                                    value={newBlocker.description}
                                    onChange={(e) => setNewBlocker({ ...newBlocker, description: e.target.value })}
                                    rows="4"
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Priority</label>
                                <select
                                    value={newBlocker.priority}
                                    onChange={(e) => setNewBlocker({ ...newBlocker, priority: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>

                            <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" className="btn-primary" style={{ background: '#dc3545', color: 'white' }}>Report Blocker</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Blockers;
