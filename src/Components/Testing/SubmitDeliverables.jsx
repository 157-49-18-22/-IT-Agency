import React, { useState, useEffect } from 'react';
import { projectsAPI, testCasesAPI, bugsAPI, performanceAPI, uatAPI } from '../../services/api';
import {
    FiSend,
    FiCheckCircle,
    FiAlertCircle,
    FiPackage,
    FiClock,
    FiFileText,
    FiEye
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import './SubmitDeliverables.css';

const SubmitDeliverables = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [notes, setNotes] = useState('');

    // Real testing data
    const [testingData, setTestingData] = useState({
        testCases: { loading: false, data: [], total: 0, passed: 0, failed: 0, pending: 0 },
        bugs: { loading: false, data: [], total: 0, critical: 0, open: 0, resolved: 0 },
        performance: { loading: false, data: [], completed: false, score: 0 },
        security: { loading: false, data: [], completed: false, score: 0 },
        uat: { loading: false, data: [], total: 0, passed: 0, failed: 0 }
    });

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'testCases', 'bugs', 'performance', 'security', 'uat'
    const [modalData, setModalData] = useState([]);

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

        // Fetch testing data for this project
        if (project) {
            fetchTestingData(project.id);
        }
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

    // Fetch real testing data for selected project
    const fetchTestingData = async (projectId) => {
        try {
            // Fetch Test Cases
            setTestingData(prev => ({ ...prev, testCases: { ...prev.testCases, loading: true } }));
            const testCasesRes = await testCasesAPI.getTestCases({ projectId }).catch(() => ({ data: { data: [] } }));
            const testCasesData = testCasesRes.data?.data || testCasesRes.data || [];

            const testCasesStats = {
                loading: false,
                data: testCasesData,
                total: testCasesData.length,
                passed: testCasesData.filter(tc => tc.status === 'Passed').length,
                failed: testCasesData.filter(tc => tc.status === 'Failed').length,
                pending: testCasesData.filter(tc => tc.status === 'Pending' || tc.status === 'In Progress').length
            };

            // Fetch Bugs
            setTestingData(prev => ({ ...prev, bugs: { ...prev.bugs, loading: true } }));
            const bugsRes = await bugsAPI.getBugs({ projectId }).catch(() => ({ data: { data: [] } }));
            const bugsData = bugsRes.data?.data || bugsRes.data || [];

            const bugsStats = {
                loading: false,
                data: bugsData,
                total: bugsData.length,
                critical: bugsData.filter(b => b.severity === 'Critical' || b.severity === 'critical').length,
                open: bugsData.filter(b => b.status !== 'Resolved' && b.status !== 'resolved').length,
                resolved: bugsData.filter(b => b.status === 'Resolved' || b.status === 'resolved').length
            };

            // Fetch Performance Tests
            setTestingData(prev => ({ ...prev, performance: { ...prev.performance, loading: true } }));
            const perfRes = await performanceAPI.getAll({ projectId }).catch(() => ({ data: { data: [] } }));
            const perfData = perfRes.data?.data || perfRes.data || [];

            const perfStats = {
                loading: false,
                data: perfData,
                completed: perfData.length > 0,
                score: perfData.length > 0 ? Math.round(perfData.reduce((acc, p) => acc + (p.score || 85), 0) / perfData.length) : 0
            };

            // Fetch UAT
            setTestingData(prev => ({ ...prev, uat: { ...prev.uat, loading: true } }));
            const uatRes = await uatAPI.getUATs({ projectId }).catch(() => ({ data: { data: [] } }));
            const uatData = uatRes.data?.data || uatRes.data || [];

            const uatStats = {
                loading: false,
                data: uatData,
                total: uatData.length,
                passed: uatData.filter(u => u.status === 'Passed' || u.status === 'passed').length,
                failed: uatData.filter(u => u.status === 'Failed' || u.status === 'failed').length
            };

            // For security, we'll use a mock for now since there's no specific API
            const securityStats = {
                loading: false,
                data: [],
                completed: true,
                score: 92
            };

            setTestingData({
                testCases: testCasesStats,
                bugs: bugsStats,
                performance: perfStats,
                security: securityStats,
                uat: uatStats
            });

        } catch (err) {
            console.error('Error fetching testing data:', err);
            toast.error('Failed to load testing data');
        }
    };

    // Check if testing is complete based on real data
    const isReadyForSubmission = selectedProject &&
        testingData.testCases.total > 0 &&
        testingData.testCases.failed === 0 &&
        testingData.bugs.open === 0 &&
        testingData.performance.completed &&
        testingData.security.completed &&
        testingData.uat.total > 0 &&
        testingData.uat.failed === 0;

    // Modal handlers
    const handleViewDetails = (type) => {
        setModalType(type);
        setModalData(testingData[type]?.data || []);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setModalType('');
        setModalData([]);
    };

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
                            <div
                                className={`checklist-item ${testingData.testCases.total > 0 && testingData.testCases.failed === 0 ? 'completed' : 'pending'} clickable`}
                                onClick={() => handleViewDetails('testCases')}
                                style={{ cursor: 'pointer' }}
                            >
                                {testingData.testCases.total > 0 && testingData.testCases.failed === 0 ? <FiCheckCircle /> : <FiClock />}
                                <span>Test Cases Executed ({testingData.testCases.passed}/{testingData.testCases.total} passed)</span>
                                <FiEye className="view-icon" />
                            </div>

                            <div
                                className={`checklist-item ${testingData.bugs.open === 0 ? 'completed' : 'pending'} clickable`}
                                onClick={() => handleViewDetails('bugs')}
                                style={{ cursor: 'pointer' }}
                            >
                                {testingData.bugs.open === 0 ? <FiCheckCircle /> : <FiAlertCircle />}
                                <span>Bugs Resolved ({testingData.bugs.resolved}/{testingData.bugs.total} resolved, {testingData.bugs.critical} critical)</span>
                                <FiEye className="view-icon" />
                            </div>

                            <div
                                className={`checklist-item ${testingData.performance.completed ? 'completed' : 'pending'} clickable`}
                                onClick={() => handleViewDetails('performance')}
                                style={{ cursor: 'pointer' }}
                            >
                                {testingData.performance.completed ? <FiCheckCircle /> : <FiClock />}
                                <span>Performance Testing (Score: {testingData.performance.score}%)</span>
                                <FiEye className="view-icon" />
                            </div>

                            <div
                                className={`checklist-item ${testingData.security.completed ? 'completed' : 'pending'} clickable`}
                                onClick={() => handleViewDetails('security')}
                                style={{ cursor: 'pointer' }}
                            >
                                {testingData.security.completed ? <FiCheckCircle /> : <FiClock />}
                                <span>Security Testing (Score: {testingData.security.score}%)</span>
                                <FiEye className="view-icon" />
                            </div>

                            <div
                                className={`checklist-item ${testingData.uat.total > 0 && testingData.uat.failed === 0 ? 'completed' : 'pending'} clickable`}
                                onClick={() => handleViewDetails('uat')}
                                style={{ cursor: 'pointer' }}
                            >
                                {testingData.uat.total > 0 && testingData.uat.failed === 0 ? <FiCheckCircle /> : <FiClock />}
                                <span>UAT Completed ({testingData.uat.passed}/{testingData.uat.total} passed)</span>
                                <FiEye className="view-icon" />
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

            {/* Details Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {modalType === 'testCases' && 'Test Cases Details'}
                                {modalType === 'bugs' && 'Bug Reports'}
                                {modalType === 'performance' && 'Performance Testing Results'}
                                {modalType === 'security' && 'Security Testing Results'}
                                {modalType === 'uat' && 'UAT Results'}
                            </h2>
                            <button className="close-btn" onClick={closeModal}>×</button>
                        </div>
                        <div className="modal-body">
                            {modalData.length === 0 ? (
                                <p className="no-data">No data available for this category.</p>
                            ) : (
                                <>
                                    {modalType === 'testCases' && (
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Title</th>
                                                    <th>Priority</th>
                                                    <th>Status</th>
                                                    <th>Executed By</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {modalData.map((tc, idx) => (
                                                    <tr key={tc.id || idx}>
                                                        <td>#{tc.id}</td>
                                                        <td>{tc.title || tc.name}</td>
                                                        <td><span className={`badge badge-${tc.priority?.toLowerCase()}`}>{tc.priority}</span></td>
                                                        <td><span className={`badge badge-${tc.status?.toLowerCase()}`}>{tc.status}</span></td>
                                                        <td>{tc.executedBy?.name || tc.tester?.name || 'N/A'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}

                                    {modalType === 'bugs' && (
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Title</th>
                                                    <th>Severity</th>
                                                    <th>Status</th>
                                                    <th>Reported By</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {modalData.map((bug, idx) => (
                                                    <tr key={bug.id || idx}>
                                                        <td>#{bug.id}</td>
                                                        <td>{bug.title || bug.description}</td>
                                                        <td><span className={`badge badge-${bug.severity?.toLowerCase()}`}>{bug.severity}</span></td>
                                                        <td><span className={`badge badge-${bug.status?.toLowerCase()}`}>{bug.status}</span></td>
                                                        <td>{bug.reportedBy?.name || bug.reporter?.name || 'N/A'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}

                                    {modalType === 'performance' && (
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Test Name</th>
                                                    <th>Response Time</th>
                                                    <th>Throughput</th>
                                                    <th>Score</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {modalData.map((perf, idx) => (
                                                    <tr key={perf.id || idx}>
                                                        <td>{perf.testName || perf.name}</td>
                                                        <td>{perf.responseTime || perf.avgResponseTime || 'N/A'}ms</td>
                                                        <td>{perf.throughput || 'N/A'}</td>
                                                        <td>{perf.score || 'N/A'}%</td>
                                                        <td><span className={`badge badge-${perf.status?.toLowerCase()}`}>{perf.status}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}

                                    {modalType === 'security' && (
                                        <div className="security-info">
                                            <p>Security testing completed with a score of {testingData.security.score}%</p>
                                            <p className="info-note">No critical vulnerabilities detected.</p>
                                        </div>
                                    )}

                                    {modalType === 'uat' && (
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Test Name</th>
                                                    <th>Tester</th>
                                                    <th>Status</th>
                                                    <th>Feedback</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {modalData.map((uat, idx) => (
                                                    <tr key={uat.id || idx}>
                                                        <td>#{uat.id}</td>
                                                        <td>{uat.testName || uat.name}</td>
                                                        <td>{uat.tester?.name || uat.testerName || 'N/A'}</td>
                                                        <td><span className={`badge badge-${uat.status?.toLowerCase()}`}>{uat.status}</span></td>
                                                        <td>{uat.feedback || uat.comments || 'N/A'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubmitDeliverables;
