import React, { useState, useEffect, useContext } from 'react';
import { FiPackage, FiSend, FiCheck, FiClock, FiCode, FiTrello } from 'react-icons/fi';
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

            // Fetch projects directly from API to ensure we have data
            const projectsResponse = await projectsAPI.getProjectsByUser(currentUser.id);
            const allProjects = projectsResponse.data.data || [];

            console.log('API Projects Response:', allProjects);
            if (allProjects.length > 0) {
                console.log('Sample Project:', allProjects[0]);
                console.log('Project Statuses:', allProjects.map(p => ({ id: p.id, status: p.status, stage: p.currentStage })));
            }

            // Filter projects that are in development stage
            // TEMPORARY: Allowing all projects for debugging
            const devProjects = allProjects;
            /*
            const devProjects = allProjects.filter(p =>
                p.currentStage === 'development' || 
                p.status === 'approved' || 
                p.status === 'active' || 
                p.status === 'in-progress' ||
                // Relaxed check for testing
                p.ProjectMembers?.some(m => m.UserId === currentUser.id)
            );
            */

            // Check each project for code files and sprints
            const eligible = [];

            console.log('All Projects:', allProjects);
            console.log('Dev Projects:', devProjects);

            for (const project of devProjects) {
                try {
                    // Check if code files exist
                    const codeResponse = await codeAPI.getByProject(project.id);
                    const hasCode = codeResponse.data?.data?.length > 0;
                    console.log(`Project ${project.id} - Code files:`, codeResponse.data?.data?.length);

                    // Check if sprints exist
                    const sprintResponse = await sprintAPI.getSprints({ projectId: project.id });
                    console.log(`Project ${project.id} - Sprint Response:`, sprintResponse);
                    const hasSprints = sprintResponse.data?.data?.length > 0 || (Array.isArray(sprintResponse.data) && sprintResponse.data.length > 0);
                    console.log(`Project ${project.id} - Has Sprints:`, hasSprints);

                    // Check if already submitted
                    const delivResponse = await deliverablesAPI.getDeliverables({
                        projectId: project.id,
                        phase: 'development'
                    });
                    const alreadySubmitted = delivResponse.data?.data?.some(d =>
                        d.status === 'pending' || d.status === 'approved'
                    );
                    console.log(`Project ${project.id} - Already Submitted:`, alreadySubmitted);

                    if (hasSprints && !alreadySubmitted) {
                        eligible.push({
                            ...project,
                            codeCount: codeResponse.data?.data?.length || 0,
                            sprintCount: sprintResponse.data?.data?.length || 0
                        });
                    }
                } catch (error) {
                    console.error(`Error checking project ${project.id}:`, error);
                }
            }

            setEligibleProjects(eligible);
        } catch (error) {
            console.error('Error checking eligible projects:', error);
            toast.error('Failed to load projects');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubmittedDeliverables = async () => {
        try {
            const response = await deliverablesAPI.getDeliverables({ phase: 'development' });
            if (response.data.success) {
                setSubmittedDeliverables(response.data.data);
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
                phase: 'Development', // Capitalized to match Enum
                name: submitData.title || `Development Deliverable - ${selectedProject.projectName}`, // Matched to 'name'
                description: submitData.description,
                notes: submitData.notes,
                status: 'Pending Approval', // Matched to Database Enum
                type: 'Code', // Enum value
                // Adding required fields for model validation
                fileUrl: submitData.repositoryUrl || '#repository',
                fileName: 'Repository Code',
                fileSize: 0,
                fileType: 'code/repository'
            };

            const response = await deliverablesAPI.createDeliverable(deliverableData);

            if (response.data.success) {
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
            toast.error('Failed to submit deliverable');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
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
                        {submittedDeliverables.filter(d => d.status === 'pending').length}
                    </div>
                </div>
                <div style={{ background: '#d1f2eb', padding: '20px', borderRadius: '12px', border: '2px solid #10b981' }}>
                    <div style={{ color: '#0c5c42', fontSize: '14px', marginBottom: '8px' }}>Approved</div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
                        {submittedDeliverables.filter(d => d.status === 'approved').length}
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
                                    <h4 style={{ margin: 0, marginBottom: '8px' }}>{project.projectName}</h4>
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
                                        <h4 style={{ margin: 0, marginBottom: '4px' }}>{deliverable.title}</h4>
                                        <p style={{ margin: 0, fontSize: '14px', color: '#6c757d' }}>
                                            {deliverable.project?.name}
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
                                        {deliverable.status === 'pending' && <FiClock />}
                                        {deliverable.status === 'approved' && <FiCheck />}
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
                                <strong>Project:</strong> {selectedProject?.projectName}
                            </div>

                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={submitData.title}
                                    onChange={(e) => setSubmitData({ ...submitData, title: e.target.value })}
                                    placeholder={`Development Deliverable - ${selectedProject?.projectName}`}
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
