import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiEye, FiDownload, FiMessageCircle } from 'react-icons/fi';
import './ClientApprovals.css';
import { approvalAPI } from '../../services/api';

export default function ClientApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setLoading(true);
        const response = await approvalAPI.getAll();
        setApprovals(response.data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApprovals();
  }, []);

  const [selectedApproval, setSelectedApproval] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [filter, setFilter] = useState('Pending');

  if (loading) return <div className="loading">Loading...</div>;

  const handleApprove = async (id) => {
    try {
      await approvalAPI.approve(id, {});
      const response = await approvalAPI.getAll();
      setApprovals(response.data || []);
    } catch (error) {
      alert('Error');
    }
  };

  const handleApproveWithFeedback = (id) => {
    if (!feedback.trim()) {
      alert('Please provide feedback');
      return;
    }
    setApprovals(prev => prev.map(app => 
      app.id === id ? { ...app, status: 'Approved', approvedDate: new Date().toISOString().split('T')[0], feedback } : app
    ));
    setSelectedApproval(null);
    setFeedback('');
  };

  const handleReject = (id) => {
    if (!feedback.trim()) {
      alert('Please provide reason for rejection');
      return;
    }
    setApprovals(prev => prev.map(app => 
      app.id === id ? { ...app, status: 'Rejected', rejectedDate: new Date().toISOString().split('T')[0], feedback } : app
    ));
    setSelectedApproval(null);
    setFeedback('');
  };

  const filteredApprovals = approvals.filter(app => 
    filter === 'All' || app.status === filter
  );

  const counts = {
    Pending: approvals.filter(a => a.status === 'Pending').length,
    Approved: approvals.filter(a => a.status === 'Approved').length,
    Rejected: approvals.filter(a => a.status === 'Rejected').length
  };

  return (
    <div className="client-approvals">
      <div className="approvals-header">
        <div>
          <h1>Approvals</h1>
          <p>Review and approve project deliverables and stage transitions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="approval-stats">
        <div className="stat-badge pending">
          <span className="count">{counts.Pending}</span>
          <span className="label">Pending</span>
        </div>
        <div className="stat-badge approved">
          <span className="count">{counts.Approved}</span>
          <span className="label">Approved</span>
        </div>
        <div className="stat-badge rejected">
          <span className="count">{counts.Rejected}</span>
          <span className="label">Rejected</span>
        </div>
      </div>

      {/* Filters */}
      <div className="approval-filters">
        {['Pending', 'Approved', 'Rejected', 'All'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Approvals List */}
      <div className="approvals-list">
        {filteredApprovals.map(approval => (
          <div key={approval.id} className={`approval-card ${approval.status.toLowerCase()}`}>
            <div className="approval-header-row">
              <div className="approval-meta">
                <span className={`type-badge ${approval.type.toLowerCase().replace(' ', '-')}`}>
                  {approval.type}
                </span>
                <span className={`priority-badge ${approval.priority.toLowerCase()}`}>
                  {approval.priority}
                </span>
                <span className="approval-id">#{approval.id}</span>
              </div>
              <div className={`status-badge ${approval.status.toLowerCase()}`}>
                {approval.status}
              </div>
            </div>

            <h3 className="approval-title">{approval.title}</h3>
            <p className="approval-description">{approval.description}</p>

            <div className="approval-details">
              <div className="detail-item">
                <span className="detail-label">Stage:</span>
                <span className="detail-value">{approval.stage}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Requested by:</span>
                <span className="detail-value">{approval.requestedBy}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Requested:</span>
                <span className="detail-value">{approval.requestedDate}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Due:</span>
                <span className="detail-value">{approval.dueDate}</span>
              </div>
            </div>

            {approval.files.length > 0 && (
              <div className="approval-files">
                <div className="files-label">Attachments:</div>
                {approval.files.map((file, idx) => (
                  <div key={idx} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{file.size}</span>
                    <button className="file-download"><FiDownload /></button>
                  </div>
                ))}
              </div>
            )}

            {approval.notes && (
              <div className="approval-notes">
                <strong>Notes:</strong> {approval.notes}
              </div>
            )}

            {approval.feedback && (
              <div className="approval-feedback">
                <strong>Your Feedback:</strong> {approval.feedback}
              </div>
            )}

            <div className="approval-actions">
              {approval.status === 'Pending' ? (
                <>
                  <button className="btn-view" onClick={() => setSelectedApproval(approval)}>
                    <FiEye /> Review & Respond
                  </button>
                  <button className="btn-approve" onClick={() => {
                    setSelectedApproval(approval);
                    setFeedback('');
                  }}>
                    <FiCheck /> Approve
                  </button>
                  <button className="btn-reject" onClick={() => {
                    setSelectedApproval(approval);
                    setFeedback('');
                  }}>
                    <FiX /> Request Changes
                  </button>
                </>
              ) : (
                <button className="btn-view" onClick={() => setSelectedApproval(approval)}>
                  <FiEye /> View Details
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredApprovals.length === 0 && (
          <div className="empty-state">
            <p>No {filter.toLowerCase()} approvals</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedApproval && (
        <div className="modal-overlay" onClick={() => setSelectedApproval(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedApproval.title}</h2>
              <button className="modal-close" onClick={() => setSelectedApproval(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h3>Description</h3>
                <p>{selectedApproval.description}</p>
              </div>

              <div className="modal-section">
                <h3>Details</h3>
                <div className="modal-details-grid">
                  <div><strong>Type:</strong> {selectedApproval.type}</div>
                  <div><strong>Stage:</strong> {selectedApproval.stage}</div>
                  <div><strong>Priority:</strong> {selectedApproval.priority}</div>
                  <div><strong>Status:</strong> {selectedApproval.status}</div>
                  <div><strong>Requested by:</strong> {selectedApproval.requestedBy}</div>
                  <div><strong>Due Date:</strong> {selectedApproval.dueDate}</div>
                </div>
              </div>

              {selectedApproval.notes && (
                <div className="modal-section">
                  <h3>Notes from Team</h3>
                  <p>{selectedApproval.notes}</p>
                </div>
              )}

              {selectedApproval.status === 'Pending' && (
                <div className="modal-section">
                  <h3>Your Feedback</h3>
                  <textarea
                    className="feedback-textarea"
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="Provide your feedback or approval comments..."
                    rows="4"
                  />
                </div>
              )}

              {selectedApproval.feedback && (
                <div className="modal-section">
                  <h3>Your Previous Feedback</h3>
                  <p>{selectedApproval.feedback}</p>
                </div>
              )}
            </div>

            {selectedApproval.status === 'Pending' && (
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setSelectedApproval(null)}>
                  Cancel
                </button>
                <button className="btn-reject-modal" onClick={() => handleReject(selectedApproval.id)}>
                  <FiX /> Request Changes
                </button>
                <button className="btn-approve-modal" onClick={() => handleApprove(selectedApproval.id)}>
                  <FiCheck /> Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
