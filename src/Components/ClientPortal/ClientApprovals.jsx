import React, { useState, useEffect, useMemo } from 'react';
import { FiCheck, FiX, FiClock, FiEye, FiDownload, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './ClientApprovals.css';
import { approvalAPI, deliverablesAPI, projectsAPI, testCasesAPI, bugsAPI, uatAPI } from '../../services/api';

// Helper to categorize approvals (Moved outside component for access)
const getCategory = (app) => {
  const source = app.source;
  const type = (app.type || app.approvalType || '').toLowerCase();
  const stage = (app.stage || app.phase || app.stageName || '').toLowerCase();
  const title = (app.title || app.name || '').toLowerCase();
  const description = (app.description || '').toLowerCase();

  // 1. System/Status items like Stage Transitions should only show in 'All'
  // and not clutter the work-specific tabs (UI/UX, Development, Testing)
  if (
    type.includes('transition') ||
    title.includes('move to') ||
    title.includes('stage transition') ||
    type === 'status_change'
  ) {
    return 'Other';
  }

  // 2. Deliverables (Items specifically sent by employees/PMs as work products)
  if (source === 'deliverable') {
    // Check stage/phase first
    if (stage.includes('design') || type.includes('ui/ux')) return 'UI/UX';
    if (stage.includes('development') || type.includes('code')) return 'Development';
    if (stage.includes('test') || stage.includes('uat')) return 'Testing';

    // Then check type/content if stage is generic
    if (type.includes('wireframe') || type.includes('mockup') || type.includes('prototype')) return 'UI/UX';
    if (type.includes('code') || title.includes('code') || title.includes('implementation')) return 'Development';
    if (type.includes('uat') || type.includes('qa') || title.includes('test') || title.includes('bug')) return 'Testing';

    // Default to Development for deliverables if unknown phase (most common work type)
    return 'Development';
  }

  // 3. Keyword-based fallback for any other items
  if (
    stage.includes('test') ||
    type.includes('test') ||
    title.includes('test') ||
    description.includes('test') ||
    type.includes('qa') ||
    title.includes('bug') ||
    title.includes('uat')
  ) {
    return 'Testing';
  }

  if (
    stage.includes('design') ||
    type.includes('design') ||
    title.includes('design') ||
    description.includes('design') ||
    type.includes('wireframe') ||
    type.includes('mockup') ||
    type.includes('prototype') ||
    type.includes('ui/ux')
  ) {
    return 'UI/UX';
  }

  if (
    stage.includes('development') ||
    type.includes('code') ||
    type === 'development' ||
    stage.includes('implementation') ||
    title.includes('code')
  ) {
    return 'Development';
  }

  return 'Other';
};

export default function ClientApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [filter, setFilter] = useState('Pending');
  const [testingDetailsModal, setTestingDetailsModal] = useState(null); // { type: 'testcases'|'bugs'|'uat', approval: {} }
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch details when modal opens
  useEffect(() => {
    if (testingDetailsModal?.approval) {
      const fetchDetails = async () => {
        setModalLoading(true);
        try {
          // Robustly get projectId
          const app = testingDetailsModal.approval;
          // projectId might be direct property or inside project object
          const projectId = app.projectId || (typeof app.project === 'object' ? app.project.id : app.project);

          if (!projectId) {
            console.error('No Project ID found for approval:', app);
            setModalData([]);
            setModalLoading(false);
            return;
          }

          let response;
          if (testingDetailsModal.type === 'testcases') {
            response = await testCasesAPI.getTestCases({ projectId });
          } else if (testingDetailsModal.type === 'bugs') {
            response = await bugsAPI.getBugs({ projectId });
          } else if (testingDetailsModal.type === 'uat') {
            response = await uatAPI.getUATs({ projectId });
          }

          // Handle API response structure (usually { data: [...] } or just [...])
          const data = response?.data?.data || response?.data || [];
          setModalData(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Error fetching details:', error);
          setModalData([]);
        } finally {
          setModalLoading(false);
        }
      };

      fetchDetails();
    } else {
      setModalData([]);
    }
  }, [testingDetailsModal]);

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
          id: d.id,
          uniqueId: `del - ${d.id} `, // Create unique key for React
          title: d.name,
          status: d.status,
          priority: 'Normal', // Default
          stage: d.phase,
          requestedDate: d.createdAt,
          source: 'deliverable', // Flag to use correct API for actions
          attachments: d.fileUrl ? [{
            name: d.fileName,
            url: d.fileUrl,
            type: d.fileType,
            size: d.fileSize || d.file_size // Map file size
          }] : []
        })) : [];

        const legacyWithUniqueIds = Array.isArray(legacyData) ? legacyData.map(d => ({
          ...d,
          uniqueId: `leg - ${d.id} ` // Create unique key for React
        })) : [];

        const merged = [...legacyWithUniqueIds, ...normalizedDeliverables];

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

        // Determine the new status based on category
        let newStatus = 'Approved';
        if (category === 'Testing') {
          newStatus = 'Completed';
        }

        // Use Deliverables API
        await deliverablesAPI.updateDeliverable(id, {
          status: newStatus,
          approvals: [...(approval.approvals || []), {
            by: 'Client',
            date: new Date(),
            feedback: feedback || 'Approved by client'
          }]
        });

        // If Testing deliverable is approved, mark as Completed
        if (category === 'Testing' && approval.projectId) {
          try {
            await projectsAPI.update(approval.projectId, {
              phase: 'Completed',
              status: 'Completed',
              completedAt: new Date().toISOString()
            });
            // Update local state to show as Completed
            setApprovals(prev => prev.map(app =>
              app.id === id ? { ...app, status: 'Completed' } : app
            ));
            alert('✅ Testing approved! Project marked as Completed.');
          } catch (err) {
            console.error('Failed to update project to completed:', err);
            alert('✅ Testing approved, but failed to mark Project as Completed.');
          }
        }
        // If Development deliverable is approved, move Project to Testing phase
        else if (category === 'Development' && approval.projectId) {
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
        // Use Legacy Approval API (for Stage Transitions and Design approvals)
        const category = getCategory(approval);

        // Determine status based on category
        let newStatus = 'Approved';
        if (category === 'Testing') {
          newStatus = 'Completed';
        }

        await approvalAPI.approve(id, {
          status: newStatus,
          approvedAt: new Date().toISOString(),
          feedback: feedback || 'Approved by client'
        });

        // If Testing stage transition is approved, mark project as Completed
        if (category === 'Testing' && approval.projectId) {
          try {
            await projectsAPI.update(approval.projectId, {
              phase: 'Completed',
              status: 'Completed',
              completedAt: new Date().toISOString()
            });
            alert('✅ Testing completed! Project marked as Completed.');
          } catch (err) {
            console.error('Failed to update project to completed:', err);
            alert('✅ Testing approved, but failed to mark Project as Completed.');
          }
        } else {
          alert('✅ Design approved successfully! Developers have been notified.');
        }
      }

      const category = getCategory(approval);
      const finalStatus = category === 'Testing' ? 'Completed' : 'Approved';

      // Update local state to show immediately
      setApprovals(prev => prev.map(app =>
        app.id === id ? { ...app, status: finalStatus } : app
      ));

      // Reload page to refresh data from database
      setTimeout(() => {
        window.location.reload();
      }, 500);

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
    const status = (app.status || '').toLowerCase();
    const activeSubTab = (filter || 'All').toLowerCase();

    const statusMatch = activeSubTab === 'all' ||
      (activeSubTab === 'pending' && (status.includes('pending') || status === 'in review')) ||
      (activeSubTab === 'approved' && status.includes('approved') && status !== 'completed') ||
      (activeSubTab === 'rejected' && status.includes('rejected')) ||
      (activeSubTab === 'completed' && status === 'completed');

    const categoryMatch = categoryFilter === 'All' || getCategory(app) === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const categoryApprovals = approvals.filter(app => categoryFilter === 'All' || getCategory(app) === categoryFilter);

  const counts = {
    Pending: categoryApprovals.filter(a => (a.status || '').toLowerCase().includes('pending') || (a.status || '').toLowerCase() === 'in review').length,
    Approved: categoryApprovals.filter(a => (a.status || '').toLowerCase().includes('approved') && (a.status || '').toLowerCase() !== 'completed').length,
    Rejected: categoryApprovals.filter(a => (a.status || '').toLowerCase().includes('rejected')).length,
    Completed: categoryApprovals.filter(a => (a.status || '').toLowerCase() === 'completed').length
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
            className={`category - tab ${categoryFilter === cat ? 'active' : ''} `}
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
        <div className="stat-badge completed">
          <span className="count">{counts.Completed}</span>
          <span className="label">Total Completed</span>
        </div>
      </div>

      {/* Status Filters */}
      <div className="approval-filters">
        {['Pending', 'Approved', 'Rejected', 'Completed', 'All'].map(f => (
          <button
            key={f}
            className={`filter - btn ${filter === f ? 'active' : ''} `}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Approvals List */}
      <div className="approvals-list">
        {filteredApprovals.map(approval => (
          <div key={approval.uniqueId || approval.id} className={`approval-card ${approval.status.toLowerCase()}`}>
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
                <span className="detail-value">{approval.stage || approval.phase || approval.stageName || 'Final Review'}</span>
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
                <div className="files-grid">
                  {approval.attachments.map((file, idx) => {
                    // Sanitize URL: remove spaces and ensure clean path
                    const rawUrl = (file.url || '').trim();
                    let fullUrl = rawUrl;

                    // Handle different URL types
                    if (!rawUrl || rawUrl === '#' || rawUrl === '#repository') {
                      fullUrl = null;
                    } else if (rawUrl.startsWith('http')) {
                      fullUrl = rawUrl;
                    } else if (rawUrl.startsWith('/') || file.type === 'Wireframe' || file.type === 'Mockup' || file.type === 'Prototype') {
                      // It's a local file path
                      const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://itbackend-p8k1.onrender.com';
                      fullUrl = `${baseUrl}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
                    } else {
                      // It might be an external link without http (e.g. github.com/...)
                      fullUrl = `https://${rawUrl}`;
                    }

                    const isImage = file.type === 'Wireframe' || file.type === 'Mockup' || file.type === 'Prototype' || file.type === 'Image';
                    const isInvalidLink = !fullUrl;

                    return (
                      <div key={idx} className="file-item-card">
                        {isImage && fullUrl ? (
                          <div className="file-preview">
                            <img
                              src={`${fullUrl}?t=${new Date().getTime()}`}
                              alt={file.name}
                              crossOrigin="anonymous"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/150?text=No+Preview';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="file-icon-placeholder">
                            {file.type === 'Code' || file.type === 'Repository' ? '💻' : '📄'}
                          </div>
                        )}
                        <div className="file-info">
                          <span className="type-badge">{file.type}</span>
                          <span className="file-name" title={file.name}>{file.name}</span>
                          <span className="file-size">{file.size || '0 KB'}</span>
                        </div>
                        <button
                          className={`file-download-btn ${isInvalidLink ? 'disabled' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isInvalidLink) {
                              window.open(fullUrl, '_blank');
                            }
                          }}
                          disabled={isInvalidLink}
                          title={isInvalidLink ? "No preview or download available" : "View or Download"}
                        >
                          {isInvalidLink ? 'No Link Available' : <><FiDownload /> View / Download</>}
                        </button>
                      </div>
                    );
                  })}
                </div >
              </div >
            )}

            {
              approval.notes && (
                <div className="approval-notes">
                  <strong>Notes:</strong> {approval.notes}
                </div>
              )
            }

            {
              approval.feedback && (
                <div className="approval-feedback">
                  <strong>Your Feedback:</strong> {approval.feedback}
                </div>
              )
            }

            {/* Testing Preview for Testing approvals */}
            {
              (() => {
                const category = getCategory(approval);
                const isTestingRelated = category === 'Testing' ||
                  approval.type === 'Stage Transition' ||
                  approval.title?.toLowerCase().includes('testing');

                console.log('Approval:', approval.title, 'Category:', category, 'Type:', approval.type, 'Show Testing:', isTestingRelated);

                return isTestingRelated ? (
                  <div className="testing-preview-section">
                    <div className="testing-preview-header">
                      <strong>Testing Status:</strong>
                      <small style={{ marginLeft: '8px', color: '#64748b', fontWeight: 'normal' }}>
                        Click on items to view details
                      </small>
                    </div>
                    <div className="testing-preview-items">
                      <span
                        className="testing-preview-item clickable"
                        onClick={() => setTestingDetailsModal({ type: 'testcases', approval })}
                        title="Click to view test cases"
                      >
                        <FiCheck style={{ color: '#059669' }} />
                        <small>Test Cases</small>
                        <FiEye style={{ color: '#94a3b8', marginLeft: '4px' }} size={14} />
                      </span>
                      <span
                        className="testing-preview-item clickable"
                        onClick={() => setTestingDetailsModal({ type: 'bugs', approval })}
                        title="Click to view bugs"
                      >
                        <FiCheck style={{ color: '#059669' }} />
                        <small>Bugs Resolved</small>
                        <FiEye style={{ color: '#94a3b8', marginLeft: '4px' }} size={14} />
                      </span>
                      <span
                        className="testing-preview-item clickable"
                        onClick={() => setTestingDetailsModal({ type: 'uat', approval })}
                        title="Click to view UAT results"
                      >
                        <FiCheck style={{ color: '#059669' }} />
                        <small>UAT</small>
                        <FiEye style={{ color: '#94a3b8', marginLeft: '4px' }} size={14} />
                      </span>
                    </div>
                    {(approval.title?.includes('INCOMPLETE') || approval.title?.includes('⚠️')) && (
                      <div className="incomplete-warning">
                        <FiX style={{ color: '#f59e0b' }} />
                        <span>Warning: Testing submitted incomplete</span>
                      </div>
                    )}
                  </div>
                ) : null;
              })()
            }

            <div className="approval-actions">
              {(approval.status.includes('Pending') || approval.status === 'In Review') ? (
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
          </div >
        ))}

        {
          filteredApprovals.length === 0 && (
            <div className="empty-state">
              <p>No {filter.toLowerCase()} approvals</p>
            </div>
          )
        }
      </div >

      {/* Modal */}
      {
        selectedApproval && (
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
                    <div><strong>Type:</strong> {selectedApproval.type || selectedApproval.approvalType}</div>
                    <div><strong>Stage:</strong> {selectedApproval.stage || selectedApproval.phase || selectedApproval.stageName || 'Final Review'}</div>
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

                {(selectedApproval.status.includes('Pending') || selectedApproval.status === 'In Review') && (
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

              {(selectedApproval.status.includes('Pending') || selectedApproval.status === 'In Review') && (
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
        )
      }

      {/* Testing Details Modal */}
      {
        testingDetailsModal && (
          <div className="modal-overlay" onClick={() => setTestingDetailsModal(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  {testingDetailsModal.type === 'testcases' && '📋 Test Cases Details'}
                  {testingDetailsModal.type === 'bugs' && '🐛 Bugs Details'}
                  {testingDetailsModal.type === 'uat' && '✅ UAT Details'}
                </h2>
                <button className="modal-close" onClick={() => setTestingDetailsModal(null)}>×</button>
              </div>

              <div className="modal-body">
                <div className="modal-section">
                  <h3>
                    Project: {
                      typeof testingDetailsModal.approval?.project === 'object'
                        ? (testingDetailsModal.approval?.project?.name || 'N/A')
                        : (testingDetailsModal.approval?.project || testingDetailsModal.approval?.title || 'N/A')
                    }
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                    {testingDetailsModal.type === 'testcases' && 'All test cases executed for this project'}
                    {testingDetailsModal.type === 'bugs' && 'All bugs reported and resolved for this project'}
                    {testingDetailsModal.type === 'uat' && 'User Acceptance Testing results for this project'}
                  </p>

                  <div style={{ marginTop: '10px' }}>
                    {modalLoading ? (
                      <div className="loading-spinner">Loading details...</div>
                    ) : modalData.length === 0 ? (
                      <p className="no-data">No data available for this category.</p>
                    ) : (
                      <div className="details-list">
                        {testingDetailsModal.type === 'testcases' && modalData.map((tc, idx) => (
                          <div key={idx} className="detail-card">
                            <div className="detail-header">
                              <h4>#{tc.id} - {tc.title || tc.name}</h4>
                              <div className="badges">
                                <span className={`badge status-${tc.status?.toLowerCase()}`}>{tc.status}</span>
                                <span className={`badge priority-${tc.priority?.toLowerCase()}`}>{tc.priority}</span>
                              </div>
                            </div>
                            {tc.description && <p className="detail-desc"><strong>Description:</strong> {tc.description}</p>}
                            {tc.expectedResult && <p className="detail-desc"><strong>Expected:</strong> {tc.expectedResult}</p>}
                          </div>
                        ))}

                        {testingDetailsModal.type === 'bugs' && modalData.map((bug, idx) => (
                          <div key={idx} className="detail-card bug-card">
                            <div className="detail-header">
                              <h4>#{bug.id} - {bug.title || bug.description?.substring(0, 50)}</h4>
                              <div className="badges">
                                <span className={`badge severity-${bug.severity?.toLowerCase()}`}>{bug.severity}</span>
                                <span className={`badge status-${bug.status?.toLowerCase()}`}>{bug.status}</span>
                              </div>
                            </div>
                            {bug.stepsToReproduce && <p className="detail-desc"><strong>Steps:</strong> {bug.stepsToReproduce}</p>}
                            {bug.actualBehavior && <p className="detail-desc"><strong>Actual:</strong> {bug.actualBehavior}</p>}
                          </div>
                        ))}

                        {testingDetailsModal.type === 'uat' && modalData.map((uat, idx) => (
                          <div key={idx} className="detail-card uat-card">
                            <div className="detail-header">
                              <h4>#{uat.id} - {uat.title || uat.scenario}</h4>
                              <span className={`badge status-${uat.status?.toLowerCase()}`}>{uat.status}</span>
                            </div>
                            {uat.feedback && <p className="detail-desc"><strong>Feedback:</strong> {uat.feedback}</p>}
                            {uat.testedBy && <p className="detail-meta">Tested by: {uat.testedBy.name || uat.testedBy}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setTestingDetailsModal(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}


