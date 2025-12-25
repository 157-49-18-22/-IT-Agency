import React, { useState, useEffect } from 'react';
import { FiPackage, FiCheck, FiX, FiClock, FiDownload, FiEye } from 'react-icons/fi';
import { deliverablesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './ClientPortal.css';

const DeliverablesView = () => {
    const [deliverables, setDeliverables] = useState([]);
    const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDeliverables();
    }, []);

    const fetchDeliverables = async () => {
        try {
            setIsLoading(true);
            const response = await deliverablesAPI.getDeliverables();
            if (response.data.success) {
                setDeliverables(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching deliverables:', error);
            toast.error('Failed to load deliverables');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            const response = await deliverablesAPI.updateDeliverable(id, { status: 'approved' });
            if (response.data.success) {
                toast.success('Deliverable approved successfully');
                setDeliverables(deliverables.map(d =>
                    d.id === id ? { ...d, status: 'approved' } : d
                ));
            }
        } catch (error) {
            console.error('Error approving deliverable:', error);
            toast.error('Failed to approve deliverable');
        }
    };

    const handleReject = async (id) => {
        try {
            const response = await deliverablesAPI.updateDeliverable(id, { status: 'rejected' });
            if (response.data.success) {
                toast.success('Deliverable rejected');
                setDeliverables(deliverables.map(d =>
                    d.id === id ? { ...d, status: 'rejected' } : d
                ));
            }
        } catch (error) {
            console.error('Error rejecting deliverable:', error);
            toast.error('Failed to reject deliverable');
        }
    };

    const filteredDeliverables = deliverables.filter(d => {
        if (filter === 'all') return true;
        return d.status === filter;
    });

    const getStatusColor = (status) => {
        const colors = {
            pending: '#f59e0b',
            approved: '#10b981',
            rejected: '#ef4444',
            draft: '#6b7280'
        };
        return colors[status] || '#6b7280';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <FiClock />,
            approved: <FiCheck />,
            rejected: <FiX />
        };
        return icons[status] || <FiPackage />;
    };

    if (isLoading) {
        return <div className="loading-spinner">Loading deliverables...</div>;
    }

    return (
        <div className="client-portal-container">
            <div className="portal-header">
                <div>
                    <h1>Deliverables</h1>
                    <p>Review and approve project deliverables</p>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div className="stat-label">Pending Review</div>
                    <div className="stat-value">{deliverables.filter(d => d.status === 'pending').length}</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <div className="stat-label">Approved</div>
                    <div className="stat-value">{deliverables.filter(d => d.status === 'approved').length}</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div className="stat-label">Rejected</div>
                    <div className="stat-value">{deliverables.filter(d => d.status === 'rejected').length}</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #667eea' }}>
                    <div className="stat-label">Total</div>
                    <div className="stat-value">{deliverables.length}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-tabs">
                <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    All ({deliverables.length})
                </button>
                <button
                    className={filter === 'pending' ? 'active' : ''}
                    onClick={() => setFilter('pending')}
                >
                    Pending ({deliverables.filter(d => d.status === 'pending').length})
                </button>
                <button
                    className={filter === 'approved' ? 'active' : ''}
                    onClick={() => setFilter('approved')}
                >
                    Approved ({deliverables.filter(d => d.status === 'approved').length})
                </button>
                <button
                    className={filter === 'rejected' ? 'active' : ''}
                    onClick={() => setFilter('rejected')}
                >
                    Rejected ({deliverables.filter(d => d.status === 'rejected').length})
                </button>
            </div>

            {/* Deliverables List */}
            <div className="deliverables-grid">
                {filteredDeliverables.length === 0 ? (
                    <div className="empty-state">
                        <FiPackage size={48} />
                        <p>No deliverables found</p>
                    </div>
                ) : (
                    filteredDeliverables.map(deliverable => (
                        <div key={deliverable.id} className="deliverable-card">
                            <div className="deliverable-header">
                                <div>
                                    <h3>{deliverable.title || deliverable.name || 'Deliverable'}</h3>
                                    <p className="project-name">{deliverable.project?.name || 'Unknown Project'}</p>
                                </div>
                                <span
                                    className="status-badge"
                                    style={{
                                        background: getStatusColor(deliverable.status) + '20',
                                        color: getStatusColor(deliverable.status)
                                    }}
                                >
                                    {getStatusIcon(deliverable.status)}
                                    {deliverable.status}
                                </span>
                            </div>

                            <div className="deliverable-content">
                                <div className="info-row">
                                    <span className="label">Phase:</span>
                                    <span className="value">{deliverable.phase || 'Development'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Submitted by:</span>
                                    <span className="value">{deliverable.uploadedBy?.name || 'Developer'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">Date:</span>
                                    <span className="value">
                                        {new Date(deliverable.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                {deliverable.description && (
                                    <div className="description">
                                        <p>{deliverable.description}</p>
                                    </div>
                                )}
                            </div>

                            {deliverable.status === 'pending' && (
                                <div className="deliverable-actions">
                                    <button
                                        className="btn-approve"
                                        onClick={() => handleApprove(deliverable.id)}
                                    >
                                        <FiCheck /> Approve
                                    </button>
                                    <button
                                        className="btn-reject"
                                        onClick={() => handleReject(deliverable.id)}
                                    >
                                        <FiX /> Reject
                                    </button>
                                </div>
                            )}

                            {deliverable.fileUrl && (
                                <div className="deliverable-footer">
                                    <a
                                        href={deliverable.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-download"
                                    >
                                        <FiDownload /> Download
                                    </a>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DeliverablesView;
