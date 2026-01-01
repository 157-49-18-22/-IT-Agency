import React, { useState, useEffect, useContext } from 'react';
import { FiPackage, FiSend, FiCheck, FiClock, FiCode, FiTrello } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ProjectContext } from '../../context/ProjectContext';
import { deliverablesAPI, codeAPI, sprintAPI, projectsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './Code.css';

const DeveloperDeliverables = () => {
    const { currentUser } = useAuth();
    const { getProjectsByUser } = useContext(ProjectContext);

    const [eligibleProjects, setEligibleProjects] = useState([]);
    const [submittedDeliverables, setSubmittedDeliverables] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [submitData, setSubmitData] = useState({
        title: '',
        description: '',
        notes: '',
        repositoryUrl: ''
    });

    useEffect(() => {
        if (currentUser?.id) {
            checkEligibleProjects();
            fetchSubmittedDeliverables();
        }
    }, [currentUser]);

    const checkEligibleProjects = async () => {
        try {
            setIsLoading(true);
            let allProjects = [];

            // 1. Priority: Context (User assigned projects)
            const contextProjects = getProjectsByUser(currentUser.id);
            if (contextProjects && contextProjects.length > 0) {
                allProjects = contextProjects;
            }

            // 2. Fetch from API if context empty (Fresh data)
            if (allProjects.length === 0) {
                try {
                    const projectsResponse = await projectsAPI.getProjectsByUser(currentUser.id);
                    const apiProjects = projectsResponse.data.data || projectsResponse.data || [];
                    if (apiProjects.length > 0) {
                        allProjects = apiProjects;
                    }
                } catch (e) {
                    console.warn('API project fetch failed', e);
                }
            }

            // 3. Fallback: Fetch ALL projects (Safety net for Dev/Admin/Testing)
            if (allProjects.length === 0) {
                try {
                    const token = localStorage.getItem('token');
                    if (token) {
                        const allRes = await axios.get(import.meta.env.VITE_API_URL + '/projects', {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        allProjects = allRes.data.data || allRes.data || [];
                    }
                } catch (e) {
                    console.warn('Fallback all-projects fetch failed', e);
                }
            }

            console.log('Final Projects List for Deliverables:', allProjects);

            // Filter projects that are in development stage
            // We use allProjects here to ensure we don't filter out things gratuitously in production
            const devProjects = allProjects;

            // Check each project for code files and sprints
            const eligible = [];

            for (const project of devProjects) {
                try {
                    // Check if code files exist
                    const codeResponse = await codeAPI.getByProject(project.id);
                    const hasCode = codeResponse.data?.data?.length > 0 || (Array.isArray(codeResponse.data) && codeResponse.data.length > 0);

                    // Check if sprints exist
                    const sprintResponse = await sprintAPI.getSprints({ projectId: project.id });
                    const hasSprints = sprintResponse.data?.data?.length > 0 ||
                        (Array.isArray(sprintResponse.data) && sprintResponse.data.length > 0) ||
                        (sprintResponse.data?.sprints && sprintResponse.data.sprints.length > 0);

                    // Check if already submitted
                    // Use try-catch specifically for this call as it might 404 if no deliverables
                    let alreadySubmitted = false;
                    try {
                        const delivResponse = await deliverablesAPI.getDeliverables({
                            projectId: project.id,
                            phase: 'development'
                        });
                        const deliverables = delivResponse.data?.data || delivResponse.data || [];
                        alreadySubmitted = deliverables.some(d =>
                            d.status === 'In Review' || d.status === 'Approved' || d.status === 'Pending Approval' || d.status === 'pending'
                        );
                    } catch (err) {
                        // If 404 or empty, it means no deliverables, so not submitted
                        alreadySubmitted = false;
                    }

                    // For debugging/usability, we might want to relax "hasSprints" if just testing
                    // But strictly: hasSprints && !alreadySubmitted
                    if ((hasCode || hasSprints) && !alreadySubmitted) {
                        eligible.push({
                            ...project,
                            codeCount: Array.isArray(codeResponse.data) ? codeResponse.data.length : (codeResponse.data?.data?.length || 0),
                            sprintCount: Array.isArray(sprintResponse.data) ? sprintResponse.data.length : (sprintResponse.data?.data?.length || 0)
                        });
                    }
                } catch (error) {
                    console.error(`Error checking project ${project.id}:`, error);
                }
            }

            setEligibleProjects(eligible);
        } catch (error) {
            console.error('Error checking eligible projects:', error);
            // toast.error('Failed to load projects'); // Suppress to avoid spam
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubmittedDeliverables = async () => {
        try {
            const response = await deliverablesAPI.getDeliverables({ phase: 'development' });
            if (response.data.success || Array.isArray(response.data)) {
                setSubmittedDeliverables(response.data.data || response.data || []);
            }
        } catch (error) {
            console.error('Error fetching deliverables:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedProject) {
            toast.error('Please select a project');
            return;
        }

        if (!submitData.repositoryUrl) {
            toast.error('Please enter the Repository URL');
            return;
        }

        try {
            const deliverableData = {
                projectId: selectedProject.id,
                phase: 'Development',
                name: submitData.title || `Development Deliverable - ${selectedProject.projectName || selectedProject.name}`,
                description: submitData.description,
                notes: submitData.notes,
                status: 'In Review', // Fixed: Must match DB Enum ('In Review', not 'Pending Approval')
                type: 'Code',
                fileUrl: submitData.repositoryUrl || '#repository',
                fileName: 'Repository Code',
                fileSize: 0,
                fileType: 'code/repository'
            };

            const response = await deliverablesAPI.createDeliverable(deliverableData);

            if (response.data.success || response.data) {
                toast.success('Deliverable submitted for client review!');
                setShowSubmitModal(false);
                setSubmitData({ title: '', description: '', notes: '', repositoryUrl: '' });
                setSelectedProject(null);

                // Refresh lists
                checkEligibleProjects();
                fetchSubmittedDeliverables();
            }
        } catch (error) {
            console.error('Error submitting deliverable:', error);
            const errMsg = error.response?.data?.message || 'Failed to submit deliverable';
            toast.error(errMsg);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'In Review': '#f59e0b',
            'Pending Approval': '#f59e0b', // Specific match
            pending: '#f59e0b',
            approved: '#10b981',
            Approved: '#10b981', // Case insensitive support
            rejected: '#ef4444',
            Rejected: '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    if (isLoading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    return (
        <div className="code-container">
            <div className="code-header">
                <div>
                    <h2>Development Deliverables</h2>
                    <p>Submit completed work for client review</p>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#e0e7ff', padding: '20px', borderRadius: '12px', border: '2px solid #667eea' }}>
                    <div style={{ color: '#4c51bf', fontSize: '14px', marginBottom: '8px' }}>Ready to Submit</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>{eligibleProjects.length}</div>
                </div>
                <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '12px', border: '2px solid #f59e0b' }}>
                    <div style={{ color: '#856404', fontSize: '14px', marginBottom: '8px' }}>Pending Review</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
                        {submittedDeliverables.filter(d => d.status === 'pending' || d.status === 'Pending Approval' || d.status === 'In Review').length}
                    </div>
                </div>
                <div style={{ background: '#d1f2eb', padding: '20px', borderRadius: '12px', border: '2px solid #10b981' }}>
                    <div style={{ color: '#0c5c42', fontSize: '14px', marginBottom: '8px' }}>Approved</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                        {submittedDeliverables.filter(d => d.status === 'approved' || d.status === 'Approved').length}
                    </div>
                </div>
            </div>

            {/* Eligible Projects */}
            <div style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiPackage /> Ready to Submit
                </h3>

                {eligibleProjects.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        color: '#6c757d'
                    }}>
                        <FiPackage size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p>No projects ready for submission</p>
                        <p style={{ fontSize: '14px', marginTop: '8px' }}>
                            Complete code files and sprints to submit deliverables
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {eligibleProjects.map(project => (
                            <div
                                key={project.id}
                                style={{
                                    background: 'white',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <h4 style={{ margin: 0, marginBottom: '8px' }}>{project.projectName || project.name}</h4>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6c757d' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <FiCode /> {project.codeCount} Files
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <FiTrello /> {project.sprintCount} Sprints
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedProject(project);
                                        setShowSubmitModal(true);
                                    }}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontWeight: '500'
                                    }}
                                >
                                    <FiSend /> Submit for Review
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Submitted Deliverables */}
            <div>
                <h3 style={{ marginBottom: '16px' }}>Submission History</h3>
                {submittedDeliverables.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        color: '#6c757d'
                    }}>
                        <p>No submissions yet</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {submittedDeliverables.map(deliverable => (
                            <div
                                key={deliverable.id}
                                style={{
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    padding: '20px'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                    <div>
                                        <h4 style={{ margin: 0, marginBottom: '4px' }}>{deliverable.title || deliverable.name}</h4>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>
                                            {deliverable.project?.name} ({deliverable.phase})
                                        </p>
                                    </div>
                                    <span
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            background: getStatusColor(deliverable.status) + '20',
                                            color: getStatusColor(deliverable.status),
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        {(deliverable.status === 'pending' || deliverable.status === 'In Review' || deliverable.status === 'Pending Approval') && <FiClock />}
                                        {(deliverable.status === 'approved' || deliverable.status === 'Approved') && <FiCheck />}
                                        {deliverable.status}
                                    </span>
                                </div>
                                {deliverable.description && (
                                    <p style={{ margin: 0, fontSize: '14px', color: '#495057' }}>
                                        {deliverable.description}
                                    </p>
                                )}
                                <div style={{ marginTop: '12px', fontSize: '13px', color: '#6c757d' }}>
                                    Submitted: {new Date(deliverable.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Submit Modal */}
            {showSubmitModal && (
                <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>Submit Deliverable</h2>
                            <button className="modal-close" onClick={() => setShowSubmitModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px', padding: '16px', background: '#e0e7ff', borderRadius: '8px' }}>
                                <strong>Project:</strong> {selectedProject?.projectName || selectedProject?.name}
                            </div>

                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={submitData.title}
                                    onChange={(e) => setSubmitData({ ...submitData, title: e.target.value })}
                                    placeholder={`Development Deliverable - ${selectedProject?.projectName || selectedProject?.name}`}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Repository URL *</label>
                                <input
                                    type="url"
                                    value={submitData.repositoryUrl}
                                    onChange={(e) => setSubmitData({ ...submitData, repositoryUrl: e.target.value })}
                                    placeholder="https://github.com/..."
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={submitData.description}
                                    onChange={(e) => setSubmitData({ ...submitData, description: e.target.value })}
                                    rows="4"
                                    placeholder="Describe what has been completed..."
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Additional Notes</label>
                                <textarea
                                    value={submitData.notes}
                                    onChange={(e) => setSubmitData({ ...submitData, notes: e.target.value })}
                                    rows="3"
                                    placeholder="Any additional information for the client..."
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                                />
                            </div>

                            <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <button type="button" onClick={() => setShowSubmitModal(false)} className="btn-secondary">
                                    Cancel
                                </button>
                                <button type="button" onClick={handleSubmit} className="btn-primary" style={{ background: '#667eea' }}>
                                    <FiSend /> Submit for Review
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeveloperDeliverables;
