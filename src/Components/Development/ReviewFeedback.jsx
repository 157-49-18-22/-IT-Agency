import React, { useState, useEffect, useContext } from 'react';
import { FiMessageSquare, FiCheckCircle, FiAlertCircle, FiClock, FiUser, FiTrash } from 'react-icons/fi';
import { feedbackAPI } from '../../services/api';
import { ProjectContext } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Code.css';

const ReviewFeedback = () => {
    const { currentUser } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [filter, setFilter] = useState('all'); // all, pending, addressed
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchFeedbacks();
    }, [currentUser, filter]);

    const fetchFeedbacks = async () => {
        try {
            setIsLoading(true);
            // Backend filtering can be added here as query params if needed
            const response = await feedbackAPI.getFeedbacks();
            if (response.data.success) {
                setFeedbacks(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching feedbacks", error);
            toast.error("Failed to load feedbacks");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredFeedbacks = feedbacks.filter(f => {
        if (filter === 'all') return true;
        return f.status === filter;
    });

    const getStatusColor = (status) => {
        return status === 'pending' ? '#f59e0b' : '#10b981';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: '#dc3545',
            medium: '#f59e0b',
            low: '#6c757d'
        };
        return colors[priority] || '#6c757d';
    };

    const getTypeIcon = (type) => {
        const icons = {
            'code-review': '👨‍💻',
            'peer-review': '👥',
            'client-feedback': '💼'
        };
        return icons[type] || '📝';
    };

    const handleMarkAddressed = async (id) => {
        try {
            const response = await feedbackAPI.markAsAddressed(id);
            if (response.data.success) {
                toast.success("Feedback marked as addressed");
                setFeedbacks(feedbacks.map(f =>
                    f.id === id ? response.data.data : f
                ));
            }
        } catch (error) {
            console.error("Error marking feedback as addressed", error);
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const response = await feedbackAPI.deleteFeedback(id);
            if (response.data.success) {
                toast.success("Feedback deleted");
                setFeedbacks(feedbacks.filter(f => f.id !== id));
            }
        } catch (error) {
            console.error("Error deleting feedback", error);
            toast.error("Failed to delete feedback");
        }
    }

    const pendingCount = feedbacks.filter(f => f.status === 'pending').length;
    const addressedCount = feedbacks.filter(f => f.status === 'addressed').length;

    if (isLoading) {
        return <div className="loading-spinner">Loading feedback...</div>;
    }

    return (
        <div className="code-container">
            <div className="code-header">
                <div>
                    <h2>Review Feedback</h2>
                    <p>Track and address feedback from code reviews and clients</p>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '12px', border: '2px solid #f59e0b' }}>
                    <div style={{ color: '#856404', fontSize: '14px', marginBottom: '8px' }}>Pending Feedback</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{pendingCount}</div>
                </div>
                <div style={{ background: '#d1f2eb', padding: '20px', borderRadius: '12px', border: '2px solid #10b981' }}>
                    <div style={{ color: '#0c5c42', fontSize: '14px', marginBottom: '8px' }}>Addressed</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{addressedCount}</div>
                </div>
                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '2px solid #667eea' }}>
                    <div style={{ color: '#6c757d', fontSize: '14px', marginBottom: '8px' }}>Total Feedback</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>{feedbacks.length}</div>
                </div>
            </div>

            {/* Filter */}
            <div className="code-toolbar" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setFilter('all')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: filter === 'all' ? '2px solid #667eea' : '1px solid #e5e7eb',
                            background: filter === 'all' ? '#e0e7ff' : 'white',
                            color: filter === 'all' ? '#667eea' : '#6c757d',
                            cursor: 'pointer',
                            fontWeight: filter === 'all' ? '600' : '400'
                        }}
                    >
                        All ({feedbacks.length})
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: filter === 'pending' ? '2px solid #f59e0b' : '1px solid #e5e7eb',
                            background: filter === 'pending' ? '#fff3cd' : 'white',
                            color: filter === 'pending' ? '#f59e0b' : '#6c757d',
                            cursor: 'pointer',
                            fontWeight: filter === 'pending' ? '600' : '400'
                        }}
                    >
                        Pending ({pendingCount})
                    </button>
                    <button
                        onClick={() => setFilter('addressed')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: filter === 'addressed' ? '2px solid #10b981' : '1px solid #e5e7eb',
                            background: filter === 'addressed' ? '#d1f2eb' : 'white',
                            color: filter === 'addressed' ? '#10b981' : '#6c757d',
                            cursor: 'pointer',
                            fontWeight: filter === 'addressed' ? '600' : '400'
                        }}
                    >
                        Addressed ({addressedCount})
                    </button>
                </div>
            </div>

            {/* Feedback List */}
            <div>
                {filteredFeedbacks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                        <FiMessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p>No feedback found for this filter.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredFeedbacks.map(feedback => (
                            <div
                                key={feedback.id}
                                style={{
                                    background: 'white',
                                    border: `2px solid ${getStatusColor(feedback.status)}`,
                                    borderRadius: '12px',
                                    padding: '24px',
                                    position: 'relative'
                                }}
                            >
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '24px' }}>{getTypeIcon(feedback.type)}</span>
                                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{feedback.taskName}</h3>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '12px',
                                                background: getPriorityColor(feedback.priority) + '20',
                                                color: getPriorityColor(feedback.priority),
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase'
                                            }}>
                                                {feedback.priority}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#6c757d' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FiUser size={14} />
                                                {feedback.reviewer?.name || 'Reviewer'}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FiClock size={14} />
                                                {new Date(feedback.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            background: getStatusColor(feedback.status),
                                            color: 'white',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            {feedback.status === 'pending' ? <FiAlertCircle size={14} /> : <FiCheckCircle size={14} />}
                                            {feedback.status === 'pending' ? 'Needs Action' : 'Addressed'}
                                        </span>
                                        {currentUser?.role === 'admin' && (
                                            <button onClick={() => handleDelete(feedback.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545' }}>
                                                <FiTrash />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Feedback Content */}
                                <div style={{
                                    background: '#f8f9fa',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    marginBottom: '16px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                                        <FiMessageSquare size={18} style={{ color: '#667eea', marginTop: '2px', flexShrink: 0 }} />
                                        <p style={{ margin: 0, color: '#495057', lineHeight: '1.6' }}>{feedback.feedback}</p>
                                    </div>
                                </div>

                                {/* Suggestions */}
                                {feedback.suggestions && feedback.suggestions.length > 0 && (
                                    <div>
                                        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#495057' }}>
                                            Suggested Actions:
                                        </h4>
                                        <ul style={{ margin: 0, paddingLeft: '20px', color: '#6c757d' }}>
                                            {typeof feedback.suggestions === 'string' ? JSON.parse(feedback.suggestions).map((s, i) => <li key={i}>{s}</li>) : feedback.suggestions.map((suggestion, idx) => (
                                                <li key={idx} style={{ marginBottom: '8px', lineHeight: '1.5' }}>{suggestion}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Actions */}
                                {feedback.status === 'pending' && (
                                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                                        <button
                                            onClick={() => handleMarkAddressed(feedback.id)}
                                            style={{
                                                padding: '10px 20px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontWeight: '500',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <FiCheckCircle /> Mark as Addressed
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewFeedback;
