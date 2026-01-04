import React, { useState, useEffect } from 'react';
import { FiSend, FiCheck, FiClock, FiEye, FiImage, FiLayers, FiSmartphone, FiX, FiCalendar, FiUser } from 'react-icons/fi';
import api from '../../services/api';
import { API_URL } from '../../config/endpoints';
import { getFullUrl } from '../../utils/urlHelper';
import './DesignDeliverables.css';

export default function DesignDeliverables() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(null);
    const [viewDetailsModal, setViewDetailsModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        fetchProjectsWithDesigns();
    }, []);

    const fetchProjectsWithDesigns = async () => {
        try {
            setLoading(true);

            // Fetch all projects
            const projectsResponse = await api.get('/projects');
            const allProjects = projectsResponse.data?.data || [];

            // Fetch wireframes, mockups, prototypes, and approvals
            const [wireframesRes, mockupsRes, prototypesRes, approvalsRes] = await Promise.all([
                api.get('/wireframes'),
                api.get('/mockups'),
                api.get('/prototypes'),
                api.get('/approvals?type=Design&limit=100')
            ]);

            const wireframes = wireframesRes.data?.data || [];
            const mockups = mockupsRes.data?.data || [];
            const prototypes = prototypesRes.data?.data || [];
            const designApprovals = approvalsRes.data?.data || [];

            // Group designs by project and check for active submissions
            const projectsWithDesigns = allProjects.map(project => {
                const projectWireframes = wireframes.filter(w => w.projectId === project.id);
                const projectMockups = mockups.filter(m => m.projectId === project.id);
                const projectPrototypes = prototypes.filter(p => p.projectId === project.id);

                // Check if this project already has a pending or approved design approval
                const activeApproval = designApprovals.find(a => 
                    String(a.projectId) === String(project.id) && 
                    (a.status === 'Pending' || a.status === 'Approved')
                );

                return {
                    ...project,
                    wireframes: projectWireframes,
                    mockups: projectMockups,
                    prototypes: projectPrototypes,
                    totalDesigns: projectWireframes.length + projectMockups.length + projectPrototypes.length,
                    hasDesigns: projectWireframes.length > 0 || projectMockups.length > 0 || projectPrototypes.length > 0,
                    isSubmitted: !!activeApproval
                };
            }).filter(p => p.hasDesigns && !p.isSubmitted); // Only show projects with designs that aren't submitted yet

            setProjects(projectsWithDesigns);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitToClient = async (project) => {
        if (!window.confirm(`Submit all designs for "${project.name}" to client for approval?`)) {
            return;
        }

        try {
            setSubmitting(project.id);

            // Create approval request
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const approvalData = {
                type: 'Design',
                title: `Design Approval for ${project.name}`,
                description: `Please review and approve the following designs:\n- ${project.wireframes.length} Wireframes\n- ${project.mockups.length} Mockups\n- ${project.prototypes.length} Prototypes`,
                projectId: project.id,
                requestedById: currentUser?.id || 1,
                requestedToId: project.clientId || 1,
                status: 'Pending',
                priority: 'High',
                notes: 'All design deliverables are ready for your review.',
                attachments: [
                    ...project.wireframes.map(w => ({
                        name: w.title,
                        type: 'Wireframe',
                        url: w.imageUrl || w.image_url,
                        size: w.fileSize || w.file_size || '0 KB'
                    })),
                    ...project.mockups.map(m => ({
                        name: m.title,
                        type: 'Mockup',
                        url: m.imageUrl || m.image_url,
                        size: m.fileSize || m.file_size || '0 KB'
                    })),
                    ...project.prototypes.map(p => ({
                        name: p.title,
                        type: 'Prototype',
                        url: p.imageUrl || p.image_url || p.link,
                        size: p.fileSize || p.file_size || '0 KB'
                    }))
                ]
            };

            await api.post('/approvals', approvalData);

            alert('✅ Design submitted to client successfully!');
            fetchProjectsWithDesigns(); // Refresh
        } catch (error) {
            console.error('Error submitting to client:', error);
            alert('❌ Failed to submit designs. Please try again.');
        } finally {
            setSubmitting(null);
        }
    };


    const handleViewDetails = (project) => {
        console.log('Project data:', project);
        console.log('Wireframes:', project.wireframes);
        console.log('Mockups:', project.mockups);
        console.log('Prototypes:', project.prototypes);
        setSelectedProject(project);
        setViewDetailsModal(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusClass = (status) => {
        if (!status) return 'status-draft';
        switch (status.toLowerCase()) {
            case 'approved': return 'status-approved';
            case 'in_review': case 'in review': return 'status-review';
            case 'in_progress': case 'in progress': return 'status-progress';
            case 'draft': default: return 'status-draft';
        }
    };

    if (loading) {
        return (
            <div className="design-deliverables">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading projects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="design-deliverables">
            <div className="deliverables-header">
                <div>
                    <h1>Design Deliverables</h1>
                    <p>Submit your completed designs to clients for approval</p>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="empty-state">
                    <FiImage size={64} className="empty-icon" />
                    <h3>No Design Deliverables Yet</h3>
                    <p>Create wireframes, mockups, or prototypes for your projects to see them here.</p>
                </div>
            ) : (
                <div className="projects-grid">
                    {projects.map(project => (
                        <div
                            key={project.id}
                            className="project-card"
                            onClick={() => handleViewDetails(project)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="project-header">
                                <h3>{project.name}</h3>
                                <span className={`status-badge ${project.status?.toLowerCase()}`}>
                                    {project.status}
                                </span>
                            </div>

                            <div className="project-stats">
                                <div className="stat-item">
                                    <FiLayers className="stat-icon wireframe" />
                                    <div>
                                        <span className="stat-count">{project.wireframes.length}</span>
                                        <span className="stat-label">Wireframes</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <FiImage className="stat-icon mockup" />
                                    <div>
                                        <span className="stat-count">{project.mockups.length}</span>
                                        <span className="stat-label">Mockups</span>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <FiSmartphone className="stat-icon prototype" />
                                    <div>
                                        <span className="stat-count">{project.prototypes.length}</span>
                                        <span className="stat-label">Prototypes</span>
                                    </div>
                                </div>
                            </div>

                            <div className="design-preview">
                                <h4>Recent Designs</h4>
                                <div className="design-thumbnails">
                                    {[...project.wireframes, ...project.mockups, ...project.prototypes]
                                        .slice(0, 3)
                                        .map((design, idx) => (
                                            <div key={idx} className="thumbnail">
                                                {design.imageUrl || design.image_url ? (
                                                    <img src={getFullUrl(design.imageUrl || design.image_url)} alt={design.title} />
                                                ) : (
                                                    <div className="thumbnail-placeholder">
                                                        <FiImage />
                                                    </div>
                                                )}
                                                <span className="thumbnail-title">{design.title}</span>
                                            </div>
                                        ))}
                                    {project.totalDesigns > 3 && (
                                        <div className="thumbnail more">
                                            <span>+{project.totalDesigns - 3} more</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="project-actions">
                                <button
                                    className="btn-view"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewDetails(project);
                                    }}
                                >
                                    <FiEye /> View Designs
                                </button>
                                <button
                                    className="btn-submit"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSubmitToClient(project);
                                    }}
                                    disabled={submitting === project.id}
                                >
                                    {submitting === project.id ? (
                                        <>
                                            <div className="btn-spinner"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <FiSend /> Submit to Client
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Details Modal */}
            {viewDetailsModal && selectedProject && (
                <div className="modal-overlay" onClick={() => setViewDetailsModal(false)}>
                    <div className="modal-content view-details-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '24px', color: '#2d3748' }}>{selectedProject.name}</h2>
                                <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '14px' }}>All Design Deliverables</p>
                            </div>
                            <button onClick={() => setViewDetailsModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#718096' }}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: '24px' }}>
                            {/* Wireframes Section */}
                            {selectedProject.wireframes.length > 0 && (
                                <div className="design-section" style={{ marginBottom: '32px' }}>
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#2d3748' }}>
                                        <FiLayers style={{ color: '#4299e1' }} /> Wireframes ({selectedProject.wireframes.length})
                                    </h3>
                                    <div className="designs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                        {selectedProject.wireframes.map((wireframe) => (
                                            <div key={wireframe.id} className="design-item" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.3s' }}>
                                                <div className="design-image" style={{ height: '180px', background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                    {getFullUrl(wireframe.imageUrl || wireframe.image_url) ? (
                                                        <img
                                                            src={getFullUrl(wireframe.imageUrl || wireframe.image_url)}
                                                            alt={wireframe.title}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => {
                                                                console.error('Failed to load wireframe image:', wireframe);
                                                                e.target.style.display = 'none';
                                                                e.target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>';
                                                            }}
                                                        />
                                                    ) : (
                                                        <FiImage size={48} style={{ color: '#cbd5e0' }} />
                                                    )}
                                                </div>
                                                <div className="design-info" style={{ padding: '16px' }}>
                                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#2d3748' }}>{wireframe.title}</h4>
                                                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#718096', lineHeight: '1.5' }}>{wireframe.description || 'No description'}</p>
                                                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#718096' }}>
                                                        <span className={`status-badge ${getStatusClass(wireframe.status)}`} style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>{wireframe.status}</span>
                                                        <span>v{wireframe.version || '1.0'}</span>
                                                    </div>
                                                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #edf2f7', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#718096' }}>
                                                        <FiCalendar size={12} />
                                                        {formatDate(wireframe.updatedAt || wireframe.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Mockups Section */}
                            {selectedProject.mockups.length > 0 && (
                                <div className="design-section" style={{ marginBottom: '32px' }}>
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#2d3748' }}>
                                        <FiImage style={{ color: '#48bb78' }} /> Mockups ({selectedProject.mockups.length})
                                    </h3>
                                    <div className="designs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                        {selectedProject.mockups.map((mockup) => (
                                            <div key={mockup.id} className="design-item" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.3s' }}>
                                                <div className="design-image" style={{ height: '180px', background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                    {getFullUrl(mockup.imageUrl || mockup.image_url) ? (
                                                        <img src={getFullUrl(mockup.imageUrl || mockup.image_url)} alt={mockup.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { console.error('Failed to load mockup image:', mockup); e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>'; }} />
                                                    ) : (
                                                        <FiImage size={48} style={{ color: '#cbd5e0' }} />
                                                    )}
                                                </div>
                                                <div className="design-info" style={{ padding: '16px' }}>
                                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#2d3748' }}>{mockup.title}</h4>
                                                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#718096', lineHeight: '1.5' }}>{mockup.description || 'No description'}</p>
                                                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#718096' }}>
                                                        <span className={`status-badge ${getStatusClass(mockup.status)}`} style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>{mockup.status || 'draft'}</span>
                                                        <span>{mockup.category}</span>
                                                    </div>
                                                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #edf2f7', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#718096' }}>
                                                        <FiCalendar size={12} />
                                                        {formatDate(mockup.updatedAt || mockup.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Prototypes Section */}
                            {selectedProject.prototypes.length > 0 && (
                                <div className="design-section">
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#2d3748' }}>
                                        <FiSmartphone style={{ color: '#9f7aea' }} /> Prototypes ({selectedProject.prototypes.length})
                                    </h3>
                                    <div className="designs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                        {selectedProject.prototypes.map((prototype) => (
                                            <div key={prototype.id} className="design-item" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.3s' }}>
                                                <div className="design-image" style={{ height: '180px', background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                    {getFullUrl(prototype.imageUrl || prototype.image_url) ? (
                                                        <img
                                                            src={getFullUrl(prototype.imageUrl || prototype.image_url)}
                                                            alt={prototype.title}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            onError={(e) => {
                                                                console.error('Failed to load prototype image:', prototype);
                                                                e.target.style.display = 'none';
                                                                e.target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" stroke-width="2"><rect x="3" y="3" width="7" height="12" rx="1"/></svg>';
                                                            }}
                                                        />
                                                    ) : (
                                                        <FiSmartphone size={48} style={{ color: '#cbd5e0' }} />
                                                    )}
                                                </div>
                                                <div className="design-info" style={{ padding: '16px' }}>
                                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#2d3748' }}>{prototype.title}</h4>
                                                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#718096', lineHeight: '1.5' }}>{prototype.description || 'No description'}</p>
                                                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#718096' }}>
                                                        <span className={`status-badge ${getStatusClass(prototype.status)}`} style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>{prototype.status?.replace('_', ' ')}</span>
                                                        <span>v{prototype.version || '1.0'}</span>
                                                    </div>
                                                    {prototype.link && (
                                                        <a href={prototype.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', color: '#4299e1', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>
                                                            <FiEye size={14} /> View Prototype
                                                        </a>
                                                    )}
                                                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #edf2f7', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#718096' }}>
                                                        <FiCalendar size={12} />
                                                        {formatDate(prototype.updatedAt || prototype.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setViewDetailsModal(false);
                                    handleSubmitToClient(selectedProject);
                                }}
                                className="btn-submit"
                                style={{ padding: '10px 20px', borderRadius: '8px', background: '#4299e1', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}
                            >
                                <FiSend /> Submit to Client
                            </button>
                            <button
                                onClick={() => setViewDetailsModal(false)}
                                style={{ padding: '10px 20px', borderRadius: '8px', background: '#f7fafc', color: '#4a5568', border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: '600' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
