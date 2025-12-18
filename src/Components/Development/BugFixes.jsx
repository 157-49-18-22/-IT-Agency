import React, { useState, useEffect } from 'react';
import {
    FaBug, FaCheckCircle, FaClock, FaExclamationTriangle,
    FaFilter, FaSearch, FaEdit, FaComments
} from 'react-icons/fa';
import axios from 'axios';
import './BugFixes.css';

const BugFixes = () => {
    const [bugs, setBugs] = useState([]);
    const [filteredBugs, setFilteredBugs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterSeverity, setFilterSeverity] = useState('all');
    const [selectedBug, setSelectedBug] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [fixComment, setFixComment] = useState('');

    useEffect(() => {
        fetchBugs();
    }, []);

    useEffect(() => {
        filterBugs();
    }, [bugs, searchTerm, filterStatus, filterSeverity]);

    const fetchBugs = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/bugs');
            const bugsData = response.data.bugs || response.data || [];
            // Filter only assigned bugs to current developer
            const assignedBugs = bugsData.filter(bug => bug.assignedTo === localStorage.getItem('userId'));
            setBugs(assignedBugs);
        } catch (error) {
            console.error('Error fetching bugs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterBugs = () => {
        let filtered = [...bugs];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(bug =>
                bug.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                bug.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(bug => bug.status === filterStatus);
        }

        // Severity filter
        if (filterSeverity !== 'all') {
            filtered = filtered.filter(bug => bug.severity === filterSeverity);
        }

        setFilteredBugs(filtered);
    };

    const handleUpdateStatus = async (bugId, newStatus) => {
        try {
            await axios.put(`/api/bugs/${bugId}`, { status: newStatus });
            fetchBugs();
        } catch (error) {
            console.error('Error updating bug status:', error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!fixComment.trim()) return;

        try {
            await axios.post(`/api/bugs/${selectedBug.id}/comments`, {
                comment: fixComment,
                type: 'fix_update'
            });
            setFixComment('');
            setShowModal(false);
            fetchBugs();
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'critical': return '#dc3545';
            case 'high': return '#fd7e14';
            case 'medium': return '#ffc107';
            case 'low': return '#28a745';
            default: return '#6c757d';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'open': return '#dc3545';
            case 'in progress': return '#ffc107';
            case 'resolved': return '#28a745';
            case 'closed': return '#6c757d';
            case 'reopened': return '#fd7e14';
            default: return '#6c757d';
        }
    };

    const getBugStats = () => {
        return {
            total: bugs.length,
            open: bugs.filter(b => b.status === 'open').length,
            inProgress: bugs.filter(b => b.status === 'in progress').length,
            resolved: bugs.filter(b => b.status === 'resolved').length,
            critical: bugs.filter(b => b.severity === 'critical').length
        };
    };

    const stats = getBugStats();

    if (isLoading) {
        return (
            <div className="bug-fixes-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading bugs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bug-fixes-container">
            <div className="page-header">
                <div className="header-content">
                    <h1>Bug Fixes</h1>
                    <p>Track and resolve assigned bugs</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon total">
                        <FaBug />
                    </div>
                    <div className="stat-info">
                        <h3>{stats.total}</h3>
                        <p>Total Bugs</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon open">
                        <FaExclamationTriangle />
                    </div>
                    <div className="stat-info">
                        <h3>{stats.open}</h3>
                        <p>Open</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon in-progress">
                        <FaClock />
                    </div>
                    <div className="stat-info">
                        <h3>{stats.inProgress}</h3>
                        <p>In Progress</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon resolved">
                        <FaCheckCircle />
                    </div>
                    <div className="stat-info">
                        <h3>{stats.resolved}</h3>
                        <p>Resolved</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Search bugs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <FaFilter />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="in progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                    <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
                        <option value="all">All Severity</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            {/* Bugs List */}
            <div className="bugs-list">
                {filteredBugs.length > 0 ? (
                    filteredBugs.map((bug) => (
                        <div key={bug.id} className="bug-card">
                            <div className="bug-header">
                                <div className="bug-title-section">
                                    <h3>{bug.title}</h3>
                                    <div className="bug-badges">
                                        <span
                                            className="severity-badge"
                                            style={{ background: getSeverityColor(bug.severity) }}
                                        >
                                            {bug.severity}
                                        </span>
                                        <span
                                            className="status-badge"
                                            style={{ background: getStatusColor(bug.status) }}
                                        >
                                            {bug.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bug-description">
                                <p>{bug.description}</p>
                            </div>

                            <div className="bug-details">
                                <div className="detail-item">
                                    <label>Reported By:</label>
                                    <span>{bug.reportedBy?.name || 'Unknown'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Reported Date:</label>
                                    <span>{new Date(bug.createdAt).toLocaleDateString()}</span>
                                </div>
                                {bug.stepsToReproduce && (
                                    <div className="detail-item full-width">
                                        <label>Steps to Reproduce:</label>
                                        <p>{bug.stepsToReproduce}</p>
                                    </div>
                                )}
                            </div>

                            <div className="bug-actions">
                                <button
                                    className="action-btn primary"
                                    onClick={() => {
                                        setSelectedBug(bug);
                                        setShowModal(true);
                                    }}
                                >
                                    <FaEdit /> Add Update
                                </button>
                                {bug.status === 'open' && (
                                    <button
                                        className="action-btn warning"
                                        onClick={() => handleUpdateStatus(bug.id, 'in progress')}
                                    >
                                        <FaClock /> Start Working
                                    </button>
                                )}
                                {bug.status === 'in progress' && (
                                    <button
                                        className="action-btn success"
                                        onClick={() => handleUpdateStatus(bug.id, 'resolved')}
                                    >
                                        <FaCheckCircle /> Mark Resolved
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <FaBug size={64} />
                        <h3>No bugs found</h3>
                        <p>
                            {bugs.length === 0
                                ? 'No bugs assigned to you yet'
                                : 'No bugs match your filters'}
                        </p>
                    </div>
                )}
            </div>

            {/* Add Comment Modal */}
            {showModal && selectedBug && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add Fix Update</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <h3>{selectedBug.title}</h3>
                            <form onSubmit={handleAddComment}>
                                <div className="form-group">
                                    <label>Update Comment</label>
                                    <textarea
                                        value={fixComment}
                                        onChange={(e) => setFixComment(e.target.value)}
                                        placeholder="Describe what you've done to fix this bug..."
                                        rows="5"
                                        required
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        <FaComments /> Add Comment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BugFixes;
