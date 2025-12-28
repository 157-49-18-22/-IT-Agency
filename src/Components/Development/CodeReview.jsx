import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { codeReviewAPI } from '../../services/api';
import './CodeReview.css';

const CodeReview = () => {
    const { currentUser } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
    const [showNewReviewModal, setShowNewReviewModal] = useState(false);
    const [newReview, setNewReview] = useState({
        title: '',
        description: '',
        codeUrl: '',
        branch: '',
        files: []
    });

    const fetchReviews = async () => {
        try {
            const response = await codeReviewAPI.getAll();
            if (response.data && response.data.success) {
                setReviews(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const filteredReviews = reviews.filter(review => {
        if (filter === 'all') return true;
        return review.status === filter;
    });

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        try {
            const response = await codeReviewAPI.create({
                ...newReview,
                author: currentUser?.name || 'Current User'
            });
            if (response.data && response.data.success) {
                setShowNewReviewModal(false);
                setNewReview({ title: '', description: '', codeUrl: '', branch: '', files: [] });
                fetchReviews(); // Refresh list
            }
        } catch (error) {
            console.error('Failed to create review:', error);
            alert('Failed to create review request');
        }
    };

    const handleReviewAction = async (reviewId, action) => {
        try {
            const status = action === 'approve' ? 'approved' : 'rejected';
            const response = await codeReviewAPI.updateStatus(reviewId, status);
            if (response.data && response.data.success) {
                fetchReviews(); // Refresh list
            }
        } catch (error) {
            console.error('Failed to update review status:', error);
            alert('Failed to update review status');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { class: 'status-pending', icon: '⏳', text: 'Pending' },
            approved: { class: 'status-approved', icon: '✅', text: 'Approved' },
            rejected: { class: 'status-rejected', icon: '❌', text: 'Rejected' }
        };
        const badge = badges[status] || badges.pending;
        return (
            <span className={`status-badge ${badge.class}`}>
                <span className="badge-icon">{badge.icon}</span>
                {badge.text}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            high: { class: 'priority-high', text: 'High' },
            medium: { class: 'priority-medium', text: 'Medium' },
            low: { class: 'priority-low', text: 'Low' }
        };
        const badge = badges[priority] || badges.medium;
        return <span className={`priority-badge ${badge.class}`}>{badge.text}</span>;
    };

    return (
        <div className="code-review-container">
            <div className="code-review-header">
                <div className="header-content">
                    <h1>
                        <span className="icon">🔍</span>
                        Code Review
                    </h1>
                    <p className="subtitle">Review and approve code changes before merging</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => setShowNewReviewModal(true)}
                >
                    <span className="icon">➕</span>
                    Request Review
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <h3>{reviews.filter(r => r.status === 'pending').length}</h3>
                        <p>Pending Reviews</p>
                    </div>
                </div>
                <div className="stat-card approved">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{reviews.filter(r => r.status === 'approved').length}</h3>
                        <p>Approved</p>
                    </div>
                </div>
                <div className="stat-card rejected">
                    <div className="stat-icon">❌</div>
                    <div className="stat-content">
                        <h3>{reviews.filter(r => r.status === 'rejected').length}</h3>
                        <p>Rejected</p>
                    </div>
                </div>
                <div className="stat-card total">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <h3>{reviews.length}</h3>
                        <p>Total Reviews</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Reviews
                    </button>
                    <button
                        className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
                        onClick={() => setFilter('approved')}
                    >
                        Approved
                    </button>
                    <button
                        className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
                        onClick={() => setFilter('rejected')}
                    >
                        Rejected
                    </button>
                </div>
            </div>

            {/* Reviews List */}
            <div className="reviews-list">
                {filteredReviews.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📝</div>
                        <h3>No reviews found</h3>
                        <p>There are no code reviews matching your filter criteria.</p>
                    </div>
                ) : (
                    filteredReviews.map(review => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div className="review-title-section">
                                    <h3>{review.title}</h3>
                                    <div className="review-badges">
                                        {getStatusBadge(review.status)}
                                        {getPriorityBadge(review.priority)}
                                    </div>
                                </div>
                                <div className="review-meta">
                                    <span className="meta-item">
                                        <span className="icon">👤</span>
                                        {review.author}
                                    </span>
                                    <span className="meta-item">
                                        <span className="icon">👁️</span>
                                        {review.reviewer}
                                    </span>
                                    <span className="meta-item">
                                        <span className="icon">📅</span>
                                        {review.updatedAt}
                                    </span>
                                </div>
                            </div>

                            <p className="review-description">{review.description}</p>

                            <div className="review-stats">
                                <div className="stat-item">
                                    <span className="icon">📁</span>
                                    <span>{review.filesChanged} files</span>
                                </div>
                                <div className="stat-item success">
                                    <span className="icon">➕</span>
                                    <span>{review.linesAdded} added</span>
                                </div>
                                <div className="stat-item danger">
                                    <span className="icon">➖</span>
                                    <span>{review.linesRemoved} removed</span>
                                </div>
                                <div className="stat-item">
                                    <span className="icon">💬</span>
                                    <span>{review.comments} comments</span>
                                </div>
                            </div>

                            <div className="review-footer">
                                <div className="branch-info">
                                    <span className="icon">🌿</span>
                                    <code>{review.branch}</code>
                                </div>
                                <div className="review-actions">
                                    <a
                                        href={review.codeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-secondary"
                                    >
                                        <span className="icon">🔗</span>
                                        View Code
                                    </a>
                                    {review.status === 'pending' && (
                                        <>
                                            <button
                                                className="btn-success"
                                                onClick={() => handleReviewAction(review.id, 'approve')}
                                            >
                                                <span className="icon">✅</span>
                                                Approve
                                            </button>
                                            <button
                                                className="btn-danger"
                                                onClick={() => handleReviewAction(review.id, 'reject')}
                                            >
                                                <span className="icon">❌</span>
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* New Review Modal */}
            {showNewReviewModal && (
                <div className="modal-overlay" onClick={() => setShowNewReviewModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Request Code Review</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowNewReviewModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmitReview}>
                            <div className="form-group">
                                <label>Review Title *</label>
                                <input
                                    type="text"
                                    value={newReview.title}
                                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                                    placeholder="e.g., Authentication Module Review"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description *</label>
                                <textarea
                                    value={newReview.description}
                                    onChange={(e) => setNewReview({ ...newReview, description: e.target.value })}
                                    placeholder="Describe what needs to be reviewed..."
                                    rows="4"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Branch Name *</label>
                                <input
                                    type="text"
                                    value={newReview.branch}
                                    onChange={(e) => setNewReview({ ...newReview, branch: e.target.value })}
                                    placeholder="e.g., feature/new-feature"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Pull Request URL</label>
                                <input
                                    type="url"
                                    value={newReview.codeUrl}
                                    onChange={(e) => setNewReview({ ...newReview, codeUrl: e.target.value })}
                                    placeholder="https://github.com/..."
                                />
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowNewReviewModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Submit Review Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeReview;
