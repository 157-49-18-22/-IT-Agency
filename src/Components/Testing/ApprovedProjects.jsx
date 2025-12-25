import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../../services/api';
import { FiCheckCircle, FiClock, FiPlay, FiAlertCircle } from 'react-icons/fi';
import './ApprovedProjects.css';

export default function ApprovedProjects() {
    const [projects, setProjects] = useState({ testing: [], development: [], others: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApprovedProjects = async () => {
            try {
                setLoading(true);
                // Fetch all projects
                const response = await projectsAPI.getProjects().catch(err => {
                    console.error(err);
                    if (err.response && err.response.status === 403) {
                        setError("You don't have permission to view projects.");
                    }
                    return { data: [] };
                });

                const allProjects = response.data?.data || response.data || [];
                console.log('Fetched Projects:', allProjects);

                const testing = [];
                const development = [];
                const others = [];

                allProjects.forEach(p => {
                    const phase = (p.phase || '').toLowerCase();
                    const status = (p.status || '').toLowerCase();

                    if (phase === 'testing' || status === 'testing') {
                        testing.push(p);
                    } else if (phase.includes('development') || phase.includes('implementation') || phase.includes('code')) {
                        development.push(p);
                    } else {
                        others.push(p);
                    }
                });

                setProjects({ testing, development, others });
            } catch (error) {
                console.error('Error fetching approved projects:', error);
                setError("Failed to load projects.");
            } finally {
                setLoading(false);
            }
        };

        fetchApprovedProjects();
    }, []);

    const handleStartTesting = async (projectId) => {
        if (window.confirm('Are you sure you want to move this project to Testing phase?')) {
            try {
                await projectsAPI.update(projectId, { phase: 'Testing', status: 'Testing' });
                alert('✅ Project moved to Testing Phase!');
                // Refresh list (simplified reload)
                window.location.reload();
            } catch (error) {
                console.error('Error moving project:', error);
                alert('❌ Failed to update project.');
            }
        }
    };

    if (loading) return <div className="loading">Loading projects...</div>;
    if (error) return <div className="loading error-text">{error}</div>;

    const totalProjects = projects.testing.length + projects.development.length + projects.others.length;

    return (
        <div className="approved-projects-container">
            <h2>Project Intake for Testing</h2>
            <p className="subtitle">Overview of all active projects available for testing.</p>

            {totalProjects === 0 && (
                <div className="empty-state">
                    <FiAlertCircle size={48} className="mb-3 text-muted" />
                    <p>No projects found in the system. Please check with Admin if projects are assigned to you.</p>
                </div>
            )}

            {/* Testing Phase Projects */}
            {projects.testing.length > 0 && (
                <>
                    <h3 className="section-title">Ready for Testing</h3>
                    <div className="projects-grid mb-4">
                        {projects.testing.map(project => (
                            <div key={project.id} className="project-card">
                                <div className="card-header">
                                    <h3>{project.name}</h3>
                                    <span className="phase-badge testing">Testing Phase</span>
                                </div>
                                <div className="card-body">
                                    <p>{project.description || 'No description available.'}</p>
                                    <div className="project-meta">
                                        <div className="meta-item"><span className="label">Category:</span><span className="value">{project.category || 'N/A'}</span></div>
                                        <div className="meta-item"><span className="label">Status:</span><span className="value text-success">Active</span></div>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <button className="btn-start-testing">
                                        <FiPlay /> Continue Testing
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Development Projects */}
            {projects.development.length > 0 && (
                <>
                    <h3 className="section-title mt-4">In Development (Pull to Testing)</h3>
                    <div className="projects-grid mb-4">
                        {projects.development.map(project => (
                            <div key={project.id} className="project-card dev-card">
                                <div className="card-header">
                                    <h3>{project.name}</h3>
                                    <span className="phase-badge development">Development</span>
                                </div>
                                <div className="card-body">
                                    <p>{project.description}</p>
                                    <div className="project-meta">
                                        <div className="meta-item"><span className="label">Manager:</span><span className="value">{project.manager?.name || 'N/A'}</span></div>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <button className="btn-start-testing btn-secondary" onClick={() => handleStartTesting(project.id)}>
                                        <FiPlay /> Start Testing (Manual)
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Other Projects */}
            {projects.others.length > 0 && (
                <>
                    <h3 className="section-title mt-4">Other Phases (Design / Planning)</h3>
                    <div className="projects-grid">
                        {projects.others.map(project => (
                            <div key={project.id} className="project-card other-card">
                                <div className="card-header">
                                    <h3>{project.name}</h3>
                                    <span className="phase-badge other">{project.phase || project.status || 'Unknown'}</span>
                                </div>
                                <div className="card-body">
                                    <p>{project.description}</p>
                                    <div className="project-meta">
                                        <div className="meta-item"><span className="label">Category:</span><span className="value">{project.category || 'N/A'}</span></div>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <button className="btn-start-testing btn-outline" onClick={() => handleStartTesting(project.id)}>
                                        <FiPlay /> Force to Testing
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

        </div>
    );
}
