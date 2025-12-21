import React, { useState, useEffect } from 'react';
import { FiSend, FiCheck, FiClock, FiEye, FiImage, FiLayers, FiSmartphone } from 'react-icons/fi';
import axios from 'axios';
import './DesignDeliverables.css';

export default function DesignDeliverables() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(null);

    useEffect(() => {
        fetchProjectsWithDesigns();
    }, []);

    const fetchProjectsWithDesigns = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            // Fetch all projects
            const projectsResponse = await axios.get('/api/projects', config);
            const allProjects = projectsResponse.data?.data || [];

            // Fetch wireframes, mockups, and prototypes
            const [wireframesRes, mockupsRes, prototypesRes] = await Promise.all([
                axios.get('/api/wireframes', config),
                axios.get('/api/mockups', config),
                axios.get('/api/prototypes', config)
            ]);

            const wireframes = wireframesRes.data?.data || [];
            const mockups = mockupsRes.data?.data || [];
            const prototypes = prototypesRes.data?.data || [];

            // Group designs by project
            const projectsWithDesigns = allProjects.map(project => {
                const projectWireframes = wireframes.filter(w => w.projectId === project.id);
                const projectMockups = mockups.filter(m => m.projectId === project.id);
                const projectPrototypes = prototypes.filter(p => p.projectId === project.id);

                return {
                    ...project,
                    wireframes: projectWireframes,
                    mockups: projectMockups,
                    prototypes: projectPrototypes,
                    totalDesigns: projectWireframes.length + projectMockups.length + projectPrototypes.length,
                    hasDesigns: projectWireframes.length > 0 || projectMockups.length > 0 || projectPrototypes.length > 0
                };
            }).filter(p => p.hasDesigns); // Only show projects with designs

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
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

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
                        url: w.imageUrl,
                        size: '0 KB'
                    })),
                    ...project.mockups.map(m => ({
                        name: m.title,
                        type: 'Mockup',
                        url: m.imageUrl,
                        size: '0 KB'
                    })),
                    ...project.prototypes.map(p => ({
                        name: p.title,
                        type: 'Prototype',
                        url: p.imageUrl || p.link,
                        size: '0 KB'
                    }))
                ]
            };

            await axios.post('/api/approvals', approvalData, config);

            alert('✅ Design submitted to client successfully!');
            fetchProjectsWithDesigns(); // Refresh
        } catch (error) {
            console.error('Error submitting to client:', error);
            alert('❌ Failed to submit designs. Please try again.');
        } finally {
            setSubmitting(null);
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
                        <div key={project.id} className="project-card">
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
                                                {design.imageUrl ? (
                                                    <img src={design.imageUrl} alt={design.title} />
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
                                    onClick={() => window.location.href = `/design/wireframes?project=${project.id}`}
                                >
                                    <FiEye /> View Designs
                                </button>
                                <button
                                    className="btn-submit"
                                    onClick={() => handleSubmitToClient(project)}
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
        </div>
    );
}
