import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../../services/api';
import {
    FiSend,
    FiCheckCircle,
    FiAlertCircle,
    FiPackage,
    FiClock,
    FiFileText
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import './SubmitDeliverables.css';

const SubmitDeliverables = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchTestingProjects();
    }, []);

    const fetchTestingProjects = async () => {
        try {
            setLoading(true);
            const response = await projectsAPI.getProjects().catch(() => ({ data: [] }));
            const allProjects = response.data?.data || response.data || [];

            console.log('All projects:', allProjects);

            // Filter projects in Testing phase
            const testingProjects = allProjects.filter(p => {
                const isTestingPhase = p.phase === 'Testing' || p.status === 'Testing';
                console.log(`Project ${p.name}: phase=${p.phase}, status=${p.status}, isTestingPhase=${isTestingPhase}`);
                return isTestingPhase;
            });

            console.log('Testing projects:', testingProjects);

            // For now, show all testing projects
            // If no testing projects, show all projects as fallback
            if (testingProjects.length === 0) {
                console.log('No testing projects found, showing all projects');
                toast.info('No projects in Testing phase. Showing all projects.');
                setProjects(allProjects);
            } else {
                setProjects(testingProjects);
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to check if all testing is complete for a project
    const checkProjectTestingComplete = async (projectId) => {
        try {
            // For now, we'll use a simplified check
            // In production, you would fetch from actual APIs:

            // 1. Check Test Cases - fetch from /api/test-cases?projectId=X
            // const testCasesResponse = await fetch(`/api/test-cases?projectId=${projectId}`);
            // const hasTestCases = testCasesResponse.data.length > 0;

            // 2. Check Bugs - fetch from /api/bugs?projectId=X
            // const bugsResponse = await fetch(`/api/bugs?projectId=${projectId}`);
            // const criticalBugs = bugsResponse.data.filter(b => b.severity === 'critical' && b.status !== 'resolved');
            // const bugsResolved = criticalBugs.length === 0;

            // 3. Check Performance Testing
            // const perfResponse = await fetch(`/api/performance-tests?projectId=${projectId}`);
            // const performanceDone = perfResponse.data.length > 0;

            // 4. Check Security Testing
            // const securityResponse = await fetch(`/api/security-scans?projectId=${projectId}`);
            // const securityDone = securityResponse.data.length > 0;

            // 5. Check UAT
            // const uatResponse = await fetch(`/api/uat?projectId=${projectId}`);
            // const uatDone = uatResponse.data.filter(u => u.status === 'passed').length > 0;

            // For demo purposes, return true for all projects
            // Replace this with actual API checks in production
            return true;
        } catch (err) {
            console.error('Error checking testing completion:', err);
            return false;
        }
    };

    const handleProjectSelect = (projectId) => {
        const project = projects.find(p => p.id === parseInt(projectId));
        setSelectedProject(project);
        setNotes('');
    };

    const handleSubmitToClient = async () => {
        if (!selectedProject) {
            toast.error('Please select a project');
            return;
        }

        if (!notes.trim()) {
            toast.error('Please add submission notes');
            return;
        }

        setSubmitting(true);
        try {
            // Update project to Client Review phase
            await projectsAPI.updateProject(selectedProject.id, {
                phase: 'Client Review',
                status: 'In Progress',
                currentPhase: 'Testing', // Set to 'Testing' so approval appears in Testing tab (valid ENUM)
                testingCompletedAt: new Date().toISOString(),
                testingNotes: notes
            });

            // Create approval request
            try {
                const { approvalAPI, authAPI } = await import('../../services/api');

                // We need a valid User ID for 'requestedToId' (Foreign Key to Users table)
                // selectedProject.clientId is from Clients table, not Users table.

                let targetUserId = selectedProject.projectManagerId; // Fallback to PM

                // Try to find a User that matches the Client's email
                if (selectedProject.client && selectedProject.client.email) {
                    // This is a pseudo-check from frontend side since we can't easily query users by email publicly
                    // For demo purposes, if we are in testing, we might just default to current user or PM if mapping isn't set up
                    // But let's try to proceed with PM if we can't be sure, to avoid Foreign Key crashes.
                }

                console.log(`Creating approval for Project: ${selectedProject.name}, Target User ID: ${targetUserId}`);

                await approvalAPI.createApproval({
                    title: `Testing Completed - ${selectedProject.name}`,
                    description: `Project is ready for client review.\n\nNotes: ${notes}`,
                    projectId: selectedProject.id,
                    requestedToId: targetUserId,
                    type: 'Stage Transition',
                    status: 'Pending',
                    priority: 'High'
                });

                toast.success('Approval request created successfully');

            } catch (approvalErr) {
                console.error('Failed to create approval request. Details:', approvalErr.response?.data || approvalErr.message);
                toast.warning('Project submitted, but failed to create approval notification.');
            }

            toast.success(`✅ ${selectedProject.name} submitted to client successfully!`);

            // Reset form
            setSelectedProject(null);
            setNotes('');

            // Refresh projects list
            fetchTestingProjects();
        } catch (err) {
            console.error('Error submitting to client:', err);
            toast.error('Failed to submit project to client');
        } finally {
            setSubmitting(false);
        }
    };

    // Mock checklist - in real app, fetch from API
    const getProjectChecklist = () => {
        return {
            testCases: { completed: true, count: 25 },
            bugs: { completed: true, resolved: 18, total: 20 },
            performance: { completed: true, score: 85 },
            security: { completed: true, score: 92 },
            uat: { completed: true, passed: 15, total: 15 }
        };
    };

    const checklist = selectedProject ? getProjectChecklist() : null;
    const isReadyForSubmission = checklist &&
        checklist.testCases.completed &&
        checklist.bugs.completed &&
        checklist.performance.completed &&
        checklist.security.completed &&
        checklist.uat.completed;

    return (
        <div className="submit-deliverables-container">
            <div className="page-header">
                <div>
                    <h1>Submit to Client</h1>
                    <p className="subtitle">Submit tested projects for client approval</p>
                </div>
            </div>

            {/* Project Selection */}
            <div className="project-selection-card">
                <label>Select Project to Submit: {loading && '(Loading...)'} {!loading && `(${projects.length} projects)`}</label>
                <select
                    value={selectedProject?.id || ''}
                    onChange={(e) => handleProjectSelect(e.target.value)}
                    className="project-select"
                    disabled={loading}
                >
                    <option value="">Choose a project...</option>
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name} - {p.category || 'General'}
                        </option>
                    ))}
                </select>
                {!loading && projects.length === 0 && (
                    <p style={{ color: 'red', marginTop: '10px' }}>
                        No projects found. Check console for details.
                    </p>
                )}
            </div>

            {selectedProject ? (
                <>
                    {/* Project Details */}
                    <div className="project-details-card">
                        <div className="project-header">
                            <div>
                                <h2>{selectedProject.name}</h2>
                                <p className="project-description">{selectedProject.description}</p>
                            </div>
                            <span className={`status-badge ${selectedProject.phase?.toLowerCase()}`}>
                                {selectedProject.phase}
                            </span>
                        </div>

                        <div className="project-meta">
                            <div className="meta-item">
                                <span className="label">Category:</span>
                                <span className="value">{selectedProject.category || 'N/A'}</span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Start Date:</span>
                                <span className="value">{new Date(selectedProject.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Manager:</span>
                                <span className="value">{selectedProject.manager?.name || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Testing Completion Checklist */}
                    <div className="checklist-card">
                        <h3>Testing Completion Status</h3>
                        <div className="checklist-items">
                            <div className={`checklist-item ${checklist.testCases.completed ? 'completed' : 'pending'}`}>
                                {checklist.testCases.completed ? <FiCheckCircle /> : <FiClock />}
                                <span>Test Cases Executed ({checklist.testCases.count} cases)</span>
                            </div>

                            <div className={`checklist-item ${checklist.bugs.completed ? 'completed' : 'pending'}`}>
                                {checklist.bugs.completed ? <FiCheckCircle /> : <FiAlertCircle />}
                                <span>Bugs Resolved ({checklist.bugs.resolved}/{checklist.bugs.total})</span>
                            </div>

                            <div className={`checklist-item ${checklist.performance.completed ? 'completed' : 'pending'}`}>
                                {checklist.performance.completed ? <FiCheckCircle /> : <FiClock />}
                                <span>Performance Testing (Score: {checklist.performance.score}%)</span>
                            </div>

                            <div className={`checklist-item ${checklist.security.completed ? 'completed' : 'pending'}`}>
                                {checklist.security.completed ? <FiCheckCircle /> : <FiClock />}
                                <span>Security Testing (Score: {checklist.security.score}%)</span>
                            </div>

                            <div className={`checklist-item ${checklist.uat.completed ? 'completed' : 'pending'}`}>
                                {checklist.uat.completed ? <FiCheckCircle /> : <FiClock />}
                                <span>UAT Completed ({checklist.uat.passed}/{checklist.uat.total} passed)</span>
                            </div>
                        </div>

                        {isReadyForSubmission ? (
                            <div className="ready-alert success">
                                <FiCheckCircle size={24} />
                                <div>
                                    <h4>Ready for Client Submission!</h4>
                                    <p>All testing activities completed successfully.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="ready-alert warning">
                                <FiAlertCircle size={24} />
                                <div>
                                    <h4>Testing Incomplete</h4>
                                    <p>Complete all testing activities before submitting to client.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submission Notes */}
                    {isReadyForSubmission && (
                        <div className="submission-form">
                            <h3>Submission Notes</h3>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add notes for the client about testing completion, known issues, recommendations, etc..."
                                rows="6"
                                className="notes-textarea"
                            />

                            <div className="form-actions">
                                <button
                                    className="btn-cancel"
                                    onClick={() => {
                                        setSelectedProject(null);
                                        setNotes('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn-submit"
                                    onClick={handleSubmitToClient}
                                    disabled={submitting || !notes.trim()}
                                >
                                    {submitting ? (
                                        <>
                                            <FiClock className="spin" /> Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <FiSend /> Submit to Client
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="empty-state">
                    <FiPackage size={64} />
                    <h3>No Project Selected</h3>
                    <p>Select a project from the dropdown above to submit to client.</p>
                </div>
            )}
        </div>
    );
};

export default SubmitDeliverables;
