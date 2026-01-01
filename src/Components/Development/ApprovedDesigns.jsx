import React, { useState, useEffect } from 'react';
import { FiImage, FiLayers, FiSmartphone, FiDownload, FiEye, FiChevronDown, FiX } from 'react-icons/fi';
import api from '../../services/api'; // Use centralized api service
import './ApprovedDesigns.css';

export default function ApprovedDesigns() {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [activeTab, setActiveTab] = useState('wireframes');
    const [designs, setDesigns] = useState({
        wireframes: [],
        mockups: [],
        prototypes: []
    });
    const [loading, setLoading] = useState(true);
    const [selectedDesign, setSelectedDesign] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchApprovedProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            fetchDesigns(selectedProject.id);
        }
    }, [selectedProject]);

    const fetchApprovedProjects = async () => {
        try {
            setLoading(true);

            // Use centralized api to fetch approved projects
            const approvalsRes = await api.get('/approvals?status=Approved');
            const approvedApprovals = approvalsRes.data?.data || approvalsRes.data || [];

            const projectMap = new Map();
            approvedApprovals.forEach(approval => {
                if (approval.projectId && !projectMap.has(approval.projectId)) {
                    projectMap.set(approval.projectId, {
                        id: approval.projectId,
                        name: approval.project?.name || `Project ${approval.projectId}`,
                        approvedDate: approval.approvedAt
                    });
                }
            });

            const projectsList = Array.from(projectMap.values());
            setProjects(projectsList);

            if (projectsList.length > 0) {
                setSelectedProject(projectsList[0]);
            }
        } catch (error) {
            console.error('Error fetching approved projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDesigns = async (projectId) => {
        try {
            // Use centralized api for parallel requests
            const [wireframesRes, mockupsRes, prototypesRes] = await Promise.all([
                api.get(`/wireframes?projectId=${projectId}`),
                api.get(`/mockups?projectId=${projectId}`),
                api.get(`/prototypes?projectId=${projectId}`)
            ]);

            setDesigns({
                wireframes: wireframesRes.data?.data || wireframesRes.data || [],
                mockups: mockupsRes.data?.data || mockupsRes.data || [],
                prototypes: prototypesRes.data?.data || prototypesRes.data || []
            });
        } catch (error) {
            console.error('Error fetching designs:', error);
        }
    };

    const handleProjectChange = (e) => {
        const project = projects.find(p => p.id === parseInt(e.target.value));
        setSelectedProject(project);
    };

    const handleViewDesign = (design) => {
        setSelectedDesign(design);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedDesign(null);
    };

    const renderDesigns = () => {
        const currentDesigns = designs[activeTab] || [];

        if (currentDesigns.length === 0) {
            return (
                <div className="empty-designs">
                    <FiImage size={64} className="empty-icon" />
                    <h3>No {activeTab} found</h3>
                    <p>Approved designs will appear here once available</p>
                </div>
            );
        }

        return (
            <div className="designs-grid">
                {currentDesigns.map((design) => (
                    <div key={design.id} className="design-card">
                        <div className="design-image">
                            {design.imageUrl ? (
                                <img src={design.imageUrl} alt={design.title} />
                            ) : (
                                <div className="image-placeholder">
                                    <FiImage size={48} />
                                </div>
                            )}
                        </div>
                        <div className="design-info">
                            <h4>{design.title}</h4>
                            {design.description && (
                                <p className="design-description">{design.description}</p>
                            )}
                            <div className="design-meta">
                                <span className="design-date">
                                    {new Date(design.createdAt).toLocaleDateString()}
                                </span>
                                {design.version && (
                                    <span className="design-version">v{design.version}</span>
                                )}
                            </div>
                        </div>
                        <div className="design-actions">
                            <button
                                className="action-btn view"
                                onClick={() => handleViewDesign(design)}
                                title="View Details"
                            >
                                <FiEye /> View
                            </button>
                            <button
                                className="action-btn download"
                                onClick={() => design.imageUrl && window.open(design.imageUrl, '_blank')}
                                title="Download"
                            >
                                <FiDownload /> Download
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="approved-designs">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading approved designs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="approved-designs">
            <div className="designs-header">
                <div>
                    <h1>Design Files & Specs</h1>
                    <p>Access approved wireframes, mockups, and prototypes</p>
                </div>
            </div>

            <div className="project-selector">
                <label htmlFor="project-select">Select Project:</label>
                <div className="select-wrapper">
                    <select
                        id="project-select"
                        value={selectedProject?.id || ''}
                        onChange={handleProjectChange}
                    >
                        {projects.length === 0 ? (
                            <option value="">No approved projects</option>
                        ) : (
                            projects.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))
                        )}
                    </select>
                    <FiChevronDown className="select-icon" />
                </div>
            </div>

            {selectedProject && (
                <>
                    <div className="design-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'wireframes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('wireframes')}
                        >
                            <FiLayers />
                            Wireframes ({designs.wireframes.length})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'mockups' ? 'active' : ''}`}
                            onClick={() => setActiveTab('mockups')}
                        >
                            <FiImage />
                            Mockups ({designs.mockups.length})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'prototypes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('prototypes')}
                        >
                            <FiSmartphone />
                            Prototypes ({designs.prototypes.length})
                        </button>
                    </div>

                    <div className="designs-content">
                        {renderDesigns()}
                    </div>
                </>
            )}

            {!selectedProject && projects.length === 0 && (
                <div className="empty-state">
                    <FiImage size={64} className="empty-icon" />
                    <h3>No Approved Projects</h3>
                    <p>Projects will appear here once clients approve the designs</p>
                </div>
            )}

            {/* Detail Modal */}
            {showModal && selectedDesign && (
                <div className="design-modal-overlay" onClick={closeModal}>
                    <div className="design-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>
                            <FiX />
                        </button>

                        <div className="modal-content">
                            <div className="modal-image">
                                {selectedDesign.imageUrl ? (
                                    <img src={selectedDesign.imageUrl} alt={selectedDesign.title} />
                                ) : (
                                    <div className="image-placeholder-large">
                                        <FiImage size={80} />
                                    </div>
                                )}
                            </div>

                            <div className="modal-details">
                                <h2>{selectedDesign.title}</h2>

                                <div className="detail-section">
                                    <h3>Description</h3>
                                    <p>{selectedDesign.description || 'No description provided'}</p>
                                </div>

                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Version:</span>
                                        <span className="detail-value">{selectedDesign.version || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Created:</span>
                                        <span className="detail-value">
                                            {new Date(selectedDesign.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Status:</span>
                                        <span className="detail-value status-approved">Approved</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Type:</span>
                                        <span className="detail-value">{activeTab.slice(0, -1)}</span>
                                    </div>
                                </div>

                                {selectedDesign.notes && (
                                    <div className="detail-section">
                                        <h3>Notes</h3>
                                        <p>{selectedDesign.notes}</p>
                                    </div>
                                )}

                                <div className="modal-actions">
                                    <button
                                        className="btn-download"
                                        onClick={() => selectedDesign.imageUrl && window.open(selectedDesign.imageUrl, '_blank')}
                                    >
                                        <FiDownload /> Download Design
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
