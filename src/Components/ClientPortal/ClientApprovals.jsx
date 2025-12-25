import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiEye, FiDownload, FiMessageCircle } from 'react-icons/fi';
import './ClientApprovals.css';
import { approvalAPI, deliverablesAPI, projectsAPI } from '../../services/api';

// Helper to categorize approvals (Moved outside component for access)
const getCategory = (app) => {
  const type = (app.type || '').toLowerCase();
  const stage = (app.stage || app.phase || '').toLowerCase();
  const title = (app.title || app.name || '').toLowerCase();

  // Check strict Design keywords
  if (stage.includes('design') || type.includes('design') || title.includes('design') ||
    type.includes('wireframe') || type.includes('mockup') || type.includes('prototype') || type.includes('ui/ux')) {
    return 'UI/UX';
  }

  if (stage.includes('development') || type.includes('code') || type === 'development' || stage.includes('implementation')) {
    return 'Development';
  }

  if (stage.includes('test') || type.includes('test') || type.includes('qa')) {
    return 'Testing';
  }

  // Fallback based on source if available
  if (app.source === 'deliverable' && (app.phase === 'Development' || app.type === 'Code')) return 'Development';

  // Legacy approval default fallback
  if (!app.source && !stage && !type) return 'UI/UX';
  if (!stage) return 'UI/UX';

  return 'Other';
};

export default function ClientApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [filter, setFilter] = useState('Pending');

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setLoading(true);
        // Fetch legacy approvals (UI/UX)
        const legacyResponse = await approvalAPI.getAll().catch(err => ({ data: [] }));
        const legacyData = legacyResponse.data?.data || legacyResponse.data || [];

        // Fetch new deliverables (Development)
        const deliverablesResponse = await deliverablesAPI.getDeliverables().catch(err => ({ data: [] }));
        const deliverablesData = deliverablesResponse.data?.data || deliverablesResponse.data || [];

        console.log('Legacy Data:', legacyData);
        console.log('Deliverables Data:', deliverablesData);

        // Normalize deliverables to match approval structure
        const normalizedDeliverables = Array.isArray(deliverablesData) ? deliverablesData.map(d => ({
          ...d,
          id: d.id, // Ensure ID uniqueness if possible, or handle collision
          title: d.name,
          status: d.status,
          priority: 'Normal', // Default
          stage: d.phase,
          requestedDate: d.createdAt,
          source: 'deliverable', // Flag to use correct API for actions
          attachments: d.fileUrl ? [{ name: d.fileName, url: d.fileUrl, type: d.fileType }] : []
        })) : [];

        const merged = [...(Array.isArray(legacyData) ? legacyData : []), ...normalizedDeliverables];

        // Sort by date desc
        merged.sort((a, b) => new Date(b.createdAt || b.requestedDate) - new Date(a.createdAt || a.requestedDate));

        setApprovals(merged);
      } catch (error) {
        console.error('Error fetching approvals:', error);
        setApprovals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApprovals();
  }, []);



  if (loading) return <div className="loading">Loading...</div>;

  const handleApprove = async (id) => {
    try {
      const approval = approvals.find(a => a.id === id);

      if (approval.source === 'deliverable') {
        const category = getCategory(approval);

        // Use Deliverables API
        await deliverablesAPI.updateDeliverable(id, {
          status: 'Approved',
          approvals: [...(approval.approvals || []), {
            by: 'Client',
            date: new Date(),
            feedback: feedback || 'Approved by client'
          }]
        });

        // If Development deliverable is approved, move Project to Testing phase
        if (category === 'Development' && approval.projectId) {
          try {
            await projectsAPI.update(approval.projectId, { phase: 'Testing', status: 'Testing' });
            alert('✅ Deliverable approved! Project moved to Testing phase.');
          } catch (err) {
            console.error('Failed to update project phase:', err);
            alert('✅ Deliverable approved, but failed to update Project phase.');
          }
        } else {
          alert('✅ Deliverable approved successfully!');
        }
      } else {
        // Use Legacy Approval API
        await approvalAPI.approve(id, {
          status: 'Approved',
          approvedAt: new Date().toISOString(),
          feedback: feedback || 'Approved by client'
        });
        alert('✅ Design approved successfully! Developers have been notified.');
      }

      // Refresh both lists logic is in fetchApprovals, so verify triggering re-fetch?
      // For now, let's manually update local state or reload. 
      // Ideally call fetchApprovals() again, but it's inside useEffect. 
      // We can move fetch logic outside useEffect or essentially just reload window or filter local state.

      setApprovals(prev => prev.map(app =>
        app.id === id ? { ...app, status: 'Approved' } : app
      ));

    } catch (error) {
      console.error('Approval error:', error);
      alert('❌ Failed to approve. Please try again.');
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





  const filteredApprovals = approvals.filter(app => {
    const statusMatch = filter === 'All' || app.status.includes(filter) || (filter === 'Pending' && app.status === 'Pending Approval');
    const categoryMatch = categoryFilter === 'All' || getCategory(app) === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const counts = {
    Pending: approvals.filter(a => a.status.includes('Pending')).length,
    Approved: approvals.filter(a => a.status.includes('Approved')).length,
    Rejected: approvals.filter(a => a.status.includes('Rejected')).length
  };

  return (
    <div className="client-approvals">
      <div className="approvals-header">
        <div>
          <h1>Approvals</h1>
          <p>Review and approve project deliverables and stage transitions</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {['All', 'UI/UX', 'Development', 'Testing'].map(cat => (
          <button
            key={cat}
            className={`category-tab ${categoryFilter === cat ? 'active' : ''}`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="approval-stats">
        <div className="stat-badge pending">
          <span className="count">{counts.Pending}</span>
          <span className="label">Total Pending</span>
        </div>
        <div className="stat-badge approved">
          <span className="count">{counts.Approved}</span>
          <span className="label">Total Approved</span>
        </div>
        <div className="stat-badge rejected">
          <span className="count">{counts.Rejected}</span>
          <span className="label">Total Rejected</span>
        </div>
      </div>

      {/* Status Filters */}
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
                <span className={`priority-badge ${(approval.priority || 'Normal').toLowerCase()}`}>
                  {approval.priority || 'Normal'}
                </span>
                <span className="approval-id">#{approval.id}</span>
              </div>
              <div className={`status-badge ${approval.status.toLowerCase()}`}>
                {approval.status}
              </div>
            </div>

            <h3 className="approval-title">{approval.title || approval.name}</h3>
            <p className="approval-description">{approval.description}</p>

            <div className="approval-details">
              <div className="detail-item">
                <span className="detail-label">Stage:</span>
                <span className="detail-value">{approval.stage || approval.phase || 'Design Review'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Requested by:</span>
                <span className="detail-value">{approval.requestedBy?.name || approval.requestedBy || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Requested:</span>
                <span className="detail-value">{approval.requestedDate || new Date(approval.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Due:</span>
                <span className="detail-value">{approval.dueDate ? new Date(approval.dueDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>

            {approval.attachments && approval.attachments.length > 0 && (
              <div className="approval-files">
                <div className="files-label">Attachments ({approval.attachments.length}):</div>
                {approval.attachments.map((file, idx) => (
                  <div key={idx} className="file-item">
                    <span className="type-badge">{file.type}</span>
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{file.size || '0 KB'}</span>
                    <button
                      className="file-download"
                      onClick={() => file.url && window.open(file.url, '_blank')}
                      title="View/Download"
                    >
                      <FiDownload />
                    </button>
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
              {approval.status.includes('Pending') ? (
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
              <h2>{selectedApproval.title || selectedApproval.name}</h2>
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
                  <div><strong>Stage:</strong> {selectedApproval.stage || selectedApproval.phase}</div>
                  <div><strong>Priority:</strong> {selectedApproval.priority || 'Normal'}</div>
                  <div><strong>Status:</strong> {selectedApproval.status}</div>
                  <div><strong>Requested by:</strong> {selectedApproval.requestedBy?.name || selectedApproval.requestedBy || 'N/A'}</div>
                  <div><strong>Due Date:</strong> {selectedApproval.dueDate ? new Date(selectedApproval.dueDate).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>

              {selectedApproval.notes && (
                <div className="modal-section">
                  <h3>Notes from Team</h3>
                  <p>{selectedApproval.notes}</p>
                </div>
              )}

              {selectedApproval.status.includes('Pending') && (
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

            {selectedApproval.status.includes('Pending') && (
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



