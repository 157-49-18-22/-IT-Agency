import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaStar, FaComment } from 'react-icons/fa';
import './ClientPortal.css';

const FeedbackApproval = () => {
    const [pendingApprovals] = useState([
        { id: 1, title: 'Homepage Mockup v2', type: 'Mockup', stage: 'UI/UX', date: '2024-01-15', preview: 'mockup.jpg' },
        { id: 2, title: 'Dashboard Feature', type: 'Feature', stage: 'Development', date: '2024-02-10', preview: null },
        { id: 3, title: 'Login Flow', type: 'Prototype', stage: 'UI/UX', date: '2024-01-18', preview: 'prototype.jpg' }
    ]);

    const [selectedItem, setSelectedItem] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0);

    const handleApprove = (id) => {
        alert(`Approved item ${id}`);
        setSelectedItem(null);
    };

    const handleReject = (id) => {
        if (!feedback) {
            alert('Please provide feedback for rejection');
            return;
        }
        alert(`Rejected item ${id} with feedback`);
        setSelectedItem(null);
        setFeedback('');
    };

    return (
        <div className="feedback-approval-page">
            <div className="page-header">
                <h1>Feedback & Approval</h1>
                <p>Review and approve deliverables</p>
            </div>

            {/* Pending Approvals */}
            <div className="pending-approvals">
                <h3>Pending Approvals ({pendingApprovals.length})</h3>
                <div className="approvals-grid">
                    {pendingApprovals.map(item => (
                        <div key={item.id} className="approval-card">
                            <div className="approval-preview">
                                {item.preview ? (
                                    <div className="preview-placeholder">Preview</div>
                                ) : (
                                    <div className="preview-placeholder no-preview">No Preview</div>
                                )}
                            </div>
                            <div className="approval-info">
                                <h4>{item.title}</h4>
                                <p className="approval-meta">
                                    <span className="type-badge">{item.type}</span>
                                    <span className="stage-badge">{item.stage}</span>
                                </p>
                                <p className="approval-date">{new Date(item.date).toLocaleDateString()}</p>
                            </div>
                            <div className="approval-actions">
                                <button className="btn-review" onClick={() => setSelectedItem(item)}>
                                    Review
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Review Modal */}
            {selectedItem && (
                <div className="review-modal-overlay" onClick={() => setSelectedItem(null)}>
                    <div className="review-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Review: {selectedItem.title}</h3>
                            <button className="close-btn" onClick={() => setSelectedItem(null)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="preview-section">
                                <div className="large-preview">
                                    {selectedItem.preview ? 'Preview Image' : 'No Preview Available'}
                                </div>
                            </div>

                            <div className="rating-section">
                                <h4>Rate this deliverable</h4>
                                <div className="stars">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <FaStar
                                            key={star}
                                            className={star <= rating ? 'star active' : 'star'}
                                            onClick={() => setRating(star)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="feedback-section">
                                <h4>Feedback / Comments</h4>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Provide your feedback here..."
                                    rows="4"
                                ></textarea>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-approve" onClick={() => handleApprove(selectedItem.id)}>
                                <FaCheckCircle /> Approve
                            </button>
                            <button className="btn-reject" onClick={() => handleReject(selectedItem.id)}>
                                <FaTimesCircle /> Request Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approval History */}
            <div className="approval-history">
                <h3>Approval History</h3>
                <div className="history-list">
                    <div className="history-item approved">
                        <FaCheckCircle className="history-icon" />
                        <div className="history-content">
                            <h4>Homepage Wireframe</h4>
                            <p>Approved on Jan 8, 2024</p>
                            <p className="history-comment"><FaComment /> "Looks great! Approved."</p>
                        </div>
                    </div>
                    <div className="history-item approved">
                        <FaCheckCircle className="history-icon" />
                        <div className="history-content">
                            <h4>Dashboard Mockup</h4>
                            <p>Approved on Jan 15, 2024</p>
                            <p className="history-comment"><FaComment /> "Perfect design!"</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackApproval;
