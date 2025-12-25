import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './PeerReview.css';

const PeerReview = () => {
    const { currentUser } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewFeedback, setReviewFeedback] = useState({
        rating: 5,
        codeQuality: 5,
        documentation: 5,
        testCoverage: 5,
        comments: '',
        suggestions: ''
    });

    // Mock data
    const mockReviews = [
        {
            id: 1,
            developer: 'John Doe',
            reviewedBy: currentUser?.name || 'You',
            module: 'User Authentication',
            description: 'Implemented JWT-based authentication with refresh tokens',
            status: 'pending',
            submittedDate: '2024-12-22',
            codeQuality: null,
            documentation: null,
            testCoverage: null,
            overallRating: null,
            comments: [],
            files: [
                'auth.controller.js',
                'auth.service.js',
                'jwt.middleware.js',
                'auth.routes.js'
            ]
        },
        {
            id: 2,
            developer: 'Sarah Williams',
            reviewedBy: 'Mike Johnson',
            module: 'Payment Gateway Integration',
            description: 'Integrated Stripe payment gateway with webhook support',
            status: 'completed',
            submittedDate: '2024-12-20',
            reviewedDate: '2024-12-21',
            codeQuality: 9,
            documentation: 8,
            testCoverage: 7,
            overallRating: 8,
            comments: [
                {
                    author: 'Mike Johnson',
                    text: 'Great implementation! Consider adding more error handling.',
                    timestamp: '2024-12-21 10:30'
                }
            ],
            files: [
                'payment.controller.js',
                'stripe.service.js',
                'webhook.handler.js'
            ]
        },
        {
            id: 3,
            developer: 'Alex Chen',
            reviewedBy: currentUser?.name || 'You',
            module: 'Email Notification System',
            description: 'Built email notification system with template support',
            status: 'in-review',
            submittedDate: '2024-12-23',
            codeQuality: null,
            documentation: null,
            testCoverage: null,
            overallRating: null,
            comments: [],
            files: [
                'email.service.js',
                'templates/welcome.html',
                'templates/reset-password.html'
            ]
        }
    ];

    useEffect(() => {
        setReviews(mockReviews);
    }, []);

    const handleSubmitReview = (e) => {
        e.preventDefault();
        const overallRating = Math.round(
            (reviewFeedback.codeQuality + reviewFeedback.documentation + reviewFeedback.testCoverage) / 3
        );

        console.log('Submitting peer review:', {
            reviewId: selectedReview.id,
            ...reviewFeedback,
            overallRating
        });

        setShowReviewModal(false);
        setSelectedReview(null);
        setReviewFeedback({
            rating: 5,
            codeQuality: 5,
            documentation: 5,
            testCoverage: 5,
            comments: '',
            suggestions: ''
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { class: 'status-pending', icon: '⏳', text: 'Pending Review' },
            'in-review': { class: 'status-in-review', icon: '👀', text: 'In Review' },
            completed: { class: 'status-completed', icon: '✅', text: 'Completed' }
        };
        const badge = badges[status] || badges.pending;
        return (
            <span className={`status-badge ${badge.class}`}>
                <span className="badge-icon">{badge.icon}</span>
                {badge.text}
            </span>
        );
    };

    const getRatingColor = (rating) => {
        if (rating >= 8) return 'rating-excellent';
        if (rating >= 6) return 'rating-good';
        if (rating >= 4) return 'rating-average';
        return 'rating-poor';
    };

    return (
        <div className="peer-review-container">
            <div className="peer-review-header">
                <div className="header-content">
                    <h1>
                        <span className="icon">👥</span>
                        Peer Review
                    </h1>
                    <p className="subtitle">Collaborate with team members to improve code quality</p>
                </div>
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
                <div className="stat-card in-review">
                    <div className="stat-icon">👀</div>
                    <div className="stat-content">
                        <h3>{reviews.filter(r => r.status === 'in-review').length}</h3>
                        <p>In Review</p>
                    </div>
                </div>
                <div className="stat-card completed">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{reviews.filter(r => r.status === 'completed').length}</h3>
                        <p>Completed</p>
                    </div>
                </div>
                <div className="stat-card average">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-content">
                        <h3>
                            {reviews.filter(r => r.overallRating).length > 0
                                ? (reviews.reduce((sum, r) => sum + (r.overallRating || 0), 0) /
                                    reviews.filter(r => r.overallRating).length).toFixed(1)
                                : 'N/A'}
                        </h3>
                        <p>Average Rating</p>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="reviews-list">
                <h2 className="section-title">
                    <span className="icon">📋</span>
                    Reviews
                </h2>

                {reviews.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📝</div>
                        <h3>No peer reviews found</h3>
                        <p>There are no peer reviews available at the moment.</p>
                    </div>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div className="review-title-section">
                                    <div>
                                        <h3>{review.module}</h3>
                                        <p className="review-developer">
                                            <span className="icon">👤</span>
                                            Developer: <strong>{review.developer}</strong>
                                        </p>
                                    </div>
                                    {getStatusBadge(review.status)}
                                </div>
                            </div>

                            <p className="review-description">{review.description}</p>

                            <div className="review-meta">
                                <div className="meta-item">
                                    <span className="icon">📅</span>
                                    <span>Submitted: {review.submittedDate}</span>
                                </div>
                                {review.reviewedDate && (
                                    <div className="meta-item">
                                        <span className="icon">✅</span>
                                        <span>Reviewed: {review.reviewedDate}</span>
                                    </div>
                                )}
                                <div className="meta-item">
                                    <span className="icon">👁️</span>
                                    <span>Reviewer: {review.reviewedBy}</span>
                                </div>
                            </div>

                            <div className="files-section">
                                <h4>
                                    <span className="icon">📁</span>
                                    Files ({review.files.length})
                                </h4>
                                <div className="files-list">
                                    {review.files.map((file, index) => (
                                        <span key={index} className="file-tag">
                                            <span className="icon">📄</span>
                                            {file}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {review.status === 'completed' && review.overallRating && (
                                <div className="ratings-section">
                                    <h4>
                                        <span className="icon">⭐</span>
                                        Review Ratings
                                    </h4>
                                    <div className="ratings-grid">
                                        <div className="rating-item">
                                            <span className="rating-label">Code Quality</span>
                                            <div className={`rating-value ${getRatingColor(review.codeQuality)}`}>
                                                {review.codeQuality}/10
                                            </div>
                                        </div>
                                        <div className="rating-item">
                                            <span className="rating-label">Documentation</span>
                                            <div className={`rating-value ${getRatingColor(review.documentation)}`}>
                                                {review.documentation}/10
                                            </div>
                                        </div>
                                        <div className="rating-item">
                                            <span className="rating-label">Test Coverage</span>
                                            <div className={`rating-value ${getRatingColor(review.testCoverage)}`}>
                                                {review.testCoverage}/10
                                            </div>
                                        </div>
                                        <div className="rating-item overall">
                                            <span className="rating-label">Overall Rating</span>
                                            <div className={`rating-value ${getRatingColor(review.overallRating)}`}>
                                                {review.overallRating}/10
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {review.comments.length > 0 && (
                                <div className="comments-section">
                                    <h4>
                                        <span className="icon">💬</span>
                                        Comments
                                    </h4>
                                    {review.comments.map((comment, index) => (
                                        <div key={index} className="comment-item">
                                            <div className="comment-header">
                                                <strong>{comment.author}</strong>
                                                <span className="comment-time">{comment.timestamp}</span>
                                            </div>
                                            <p>{comment.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="review-actions">
                                {review.status === 'pending' && review.reviewedBy === (currentUser?.name || 'You') && (
                                    <button
                                        className="btn-primary"
                                        onClick={() => {
                                            setSelectedReview(review);
                                            setShowReviewModal(true);
                                        }}
                                    >
                                        <span className="icon">✍️</span>
                                        Start Review
                                    </button>
                                )}
                                {review.status === 'in-review' && review.reviewedBy === (currentUser?.name || 'You') && (
                                    <button
                                        className="btn-primary"
                                        onClick={() => {
                                            setSelectedReview(review);
                                            setShowReviewModal(true);
                                        }}
                                    >
                                        <span className="icon">✍️</span>
                                        Continue Review
                                    </button>
                                )}
                                <button className="btn-secondary">
                                    <span className="icon">👁️</span>
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedReview && (
                <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Review: {selectedReview.module}</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowReviewModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmitReview}>
                            <div className="form-section">
                                <h3>Rate the Code</h3>

                                <div className="form-group">
                                    <label>
                                        Code Quality ({reviewFeedback.codeQuality}/10)
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={reviewFeedback.codeQuality}
                                        onChange={(e) => setReviewFeedback({
                                            ...reviewFeedback,
                                            codeQuality: parseInt(e.target.value)
                                        })}
                                        className="rating-slider"
                                    />
                                    <div className="slider-labels">
                                        <span>Poor</span>
                                        <span>Excellent</span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>
                                        Documentation ({reviewFeedback.documentation}/10)
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={reviewFeedback.documentation}
                                        onChange={(e) => setReviewFeedback({
                                            ...reviewFeedback,
                                            documentation: parseInt(e.target.value)
                                        })}
                                        className="rating-slider"
                                    />
                                    <div className="slider-labels">
                                        <span>Poor</span>
                                        <span>Excellent</span>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>
                                        Test Coverage ({reviewFeedback.testCoverage}/10)
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={reviewFeedback.testCoverage}
                                        onChange={(e) => setReviewFeedback({
                                            ...reviewFeedback,
                                            testCoverage: parseInt(e.target.value)
                                        })}
                                        className="rating-slider"
                                    />
                                    <div className="slider-labels">
                                        <span>Poor</span>
                                        <span>Excellent</span>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Feedback</h3>

                                <div className="form-group">
                                    <label>Comments</label>
                                    <textarea
                                        value={reviewFeedback.comments}
                                        onChange={(e) => setReviewFeedback({
                                            ...reviewFeedback,
                                            comments: e.target.value
                                        })}
                                        placeholder="Provide detailed feedback on the code..."
                                        rows="4"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Suggestions for Improvement</label>
                                    <textarea
                                        value={reviewFeedback.suggestions}
                                        onChange={(e) => setReviewFeedback({
                                            ...reviewFeedback,
                                            suggestions: e.target.value
                                        })}
                                        placeholder="Suggest improvements or best practices..."
                                        rows="4"
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowReviewModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Submit Review
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PeerReview;
