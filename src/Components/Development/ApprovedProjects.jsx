import React, { useState, useEffect } from 'react';
import { FiCheck, FiClock, FiEye, FiDownload } from 'react-icons/fi';
import axios from 'axios';
import './ApprovedProjects.css';

export default function ApprovedProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApprovedProjects();
    }, []);

    const fetchApprovedProjects = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            // Fetch approved approvals
            const approvalsRes = await axios.get('/api/approvals?status=Approved', config);
            const approvedApprovals = approvalsRes.data?.data || approvalsRes.data || [];

            // Group by project
            const projectMap = new Map();
            approvedApprovals.forEach(approval => {
                if (approval.projectId) {
                    if (!projectMap.has(approval.projectId)) {
                        projectMap.set(approval.projectId, {
                            id: approval.projectId,
                            name: approval.project?.name || `Project ${approval.projectId}`,
                            approvals: [],
                            approvedDate: approval.approvedAt,
                            attachments: []
                        });
                    }
                    const project = projectMap.get(approval.projectId);
                    project.approvals.push(approval);
                    if (approval.attachments) {
                        project.attachments.push(...approval.attachments);
                    }
                }
            });

            setProjects(Array.from(projectMap.values()));
        } catch (error) {
            console.error('Error fetching approved projects:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="approved-projects">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading approved projects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="approved-projects">
            <div className="projects-header">
                <div>
                    <h1>My Approved Projects</h1>
                    <p>Projects with client-approved designs ready for development</p>
                </div>
                <div className="projects-count">
                    <FiCheck className="count-icon" />
                    <span>{projects.length} Approved</span>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="empty-state">
                    <FiClock size={64} className="empty-icon" />
                    <h3>No Approved Projects Yet</h3>
                    <p>Projects will appear here once clients approve the designs.</p>
                </div>
            ) : (
                <div className="projects-grid">
                    {projects.map(project => (
                        <div key={project.id} className="project-card">
                            <div className="project-header">
                                <h3>{project.name}</h3>
                                <span className="approved-badge">
                                    <FiCheck /> Approved
                                </span>
                            </div>

                            <div className="project-info">
                                <div className="info-item">
                                    <span className="info-label">Approved On:</span>
                                    <span className="info-value">
                                        {new Date(project.approvedDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Design Files:</span>
                                    <span className="info-value">{project.attachments.length} files</span>
                                </div>
                            </div>

                            <div className="design-files">
                                <h4>Design Deliverables</h4>
                                <div className="files-list">
                                    {project.attachments.slice(0, 5).map((file, idx) => (
                                        <div key={idx} className="file-item">
                                            <span className="file-type">{file.type}</span>
                                            <span className="file-name">{file.name}</span>
                                            <button
                                                className="file-action"
                                                onClick={() => file.url && window.open(file.url, '_blank')}
                                                title="View Design"
                                            >
                                                <FiEye />
                                            </button>
                                        </div>
                                    ))}
                                    {project.attachments.length > 5 && (
                                        <div className="more-files">
                                            +{project.attachments.length - 5} more files
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="project-actions">
                                <button className="btn-primary">
                                    <FiCheck /> Start Development
                                </button>
                                <button className="btn-secondary">
                                    <FiDownload /> Download All
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
