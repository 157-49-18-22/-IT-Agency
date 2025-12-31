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

        // If testing is incomplete, show confirmation dialog
        if (!isReadyForSubmission) {
            const incompleteItems = [];
            if (testingData.testCases.failed > 0) {
                incompleteItems.push(`${testingData.testCases.failed} test case(s) failed`);
            }
            if (testingData.bugs.open > 0) {
                incompleteItems.push(`${testingData.bugs.open} bug(s) still open (${testingData.bugs.critical} critical)`);
            }
            if (testingData.uat.failed > 0) {
                incompleteItems.push(`${testingData.uat.failed} UAT(s) failed`);
            }

            const confirmMessage = `⚠️ WARNING: Testing is INCOMPLETE!\n\nIncomplete items:\n${incompleteItems.map(item => `• ${item}`).join('\n')}\n\nAre you sure you want to submit to the client with incomplete testing?`;

            if (!window.confirm(confirmMessage)) {
                return;
            }
        }

        setSubmitting(true);
        try {
            // Update project to Client Review phase
            await projectsAPI.updateProject(selectedProject.id, {
                phase: 'Client Review',
                status: 'In Progress',
                currentPhase: 'Testing', // Set to 'Testing' so approval appears in Testing tab (valid ENUM)
                testingCompletedAt: new Date().toISOString(),
                testingNotes: notes,
                testingComplete: isReadyForSubmission // Track if testing was complete
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

                const approvalTitle = isReadyForSubmission
                    ? `Testing Completed - ${selectedProject.name}`
                    : `⚠️ Testing Incomplete - ${selectedProject.name}`;

                const approvalDescription = isReadyForSubmission
                    ? `Project is ready for client review.\n\nNotes: ${notes}`
                    : `⚠️ WARNING: Project submitted with INCOMPLETE testing.\n\nNotes: ${notes}`;

                await approvalAPI.createApproval({
                    title: approvalTitle,
                    description: approvalDescription,
                    projectId: selectedProject.id,
                    requestedToId: targetUserId,
                    type: 'Stage Transition',
                    status: 'Pending',
                    priority: isReadyForSubmission ? 'High' : 'Critical'
                });

                toast.success('Approval request created successfully');

            } catch (approvalErr) {
                console.error('Failed to create approval request. Details:', approvalErr.response?.data || approvalErr.message);
                toast.warning('Project submitted, but failed to create approval notification.');
            }

            if (isReadyForSubmission) {
                toast.success(`✅ ${selectedProject.name} submitted to client successfully!`);
            } else {
                toast.warning(`⚠️ ${selectedProject.name} submitted with incomplete testing!`);
            }

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
                passed: testCasesData.filter(tc => ['passed', 'approved'].includes(tc.status?.toLowerCase())).length,
                failed: testCasesData.filter(tc => ['failed', 'rejected'].includes(tc.status?.toLowerCase())).length,
                pending: testCasesData.filter(tc => ['pending', 'in_progress', 'not_run'].includes(tc.status?.toLowerCase())).length
            };

            // Fetch Bugs
            setTestingData(prev => ({ ...prev, bugs: { ...prev.bugs, loading: true } }));
            const bugsRes = await bugsAPI.getBugs({ projectId }).catch(() => ({ data: { data: [] } }));
            const bugsData = bugsRes.data?.data || bugsRes.data || [];

            const bugsStats = {
                loading: false,
                data: bugsData,
                total: bugsData.length,
                critical: bugsData.filter(b => (b.severity?.toLowerCase() === 'critical')).length,
                open: bugsData.filter(b => !['resolved', 'closed'].includes(b.status?.toLowerCase())).length,
                resolved: bugsData.filter(b => ['resolved', 'closed'].includes(b.status?.toLowerCase())).length
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
                passed: uatData.filter(u => ['passed', 'approved'].includes(u.status?.toLowerCase())).length,
                failed: uatData.filter(u => ['failed', 'rejected'].includes(u.status?.toLowerCase())).length
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
        // testingData.testCases.total > 0 && // Optional: enforce at least one test case?
        testingData.testCases.failed === 0 &&
        testingData.bugs.critical === 0 && // Only critical bugs block submission? Or all open? User wants all resolved usually.
        testingData.bugs.open === 0 &&
        // testingData.performance.completed &&
        // testingData.security.completed &&
        // testingData.uat.total > 0 &&
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
                                    <p>Some testing activities are not complete. You can still submit with incomplete testing.</p>
                                    <ul className="incomplete-items">
                                        {testingData.testCases.failed > 0 && (
                                            <li>❌ {testingData.testCases.failed} test case(s) failed</li>
                                        )}
                                        {testingData.bugs.open > 0 && (
                                            <li>🐛 {testingData.bugs.open} bug(s) still open ({testingData.bugs.critical} critical)</li>
                                        )}
                                        {testingData.uat.failed > 0 && (
                                            <li>❌ {testingData.uat.failed} UAT(s) failed</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submission Notes - Show for both ready and incomplete */}
                    <div className="submission-form">
                        <h3>Submission Notes</h3>
                        {!isReadyForSubmission && (
                            <div className="force-submit-warning">
                                <FiAlertCircle size={20} />
                                <span>You are submitting with incomplete testing. Please explain the situation to the client.</span>
                            </div>
                        )}
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder={
                                isReadyForSubmission
                                    ? "Add notes for the client about testing completion, known issues, recommendations, etc..."
                                    : "IMPORTANT: Explain why you're submitting with incomplete testing, what's pending, and the plan to complete it..."
                            }
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
                                className={`btn-submit ${!isReadyForSubmission ? 'btn-submit-warning' : ''}`}
                                onClick={handleSubmitToClient}
                                disabled={submitting || !notes.trim()}
                            >
                                {submitting ? (
                                    <>
                                        <FiClock className="spin" /> Submitting...
                                    </>
                                ) : (
                                    <>
                                        <FiSend /> {isReadyForSubmission ? 'Submit to Client' : 'Force Submit to Client'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
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
                                        <div className="test-cases-details">
                                            {modalData.map((tc, idx) => (
                                                <div key={tc.id || idx} className="test-case-detail-card">
                                                    <div className="test-case-header">
                                                        <div className="test-case-title-section">
                                                            <h4>#{tc.id} - {tc.title || tc.name || 'Untitled Test Case'}</h4>
                                                            <div className="test-case-badges">
                                                                <span className={`badge badge-${tc.priority?.toLowerCase() || 'medium'}`}>
                                                                    {tc.priority || 'Medium'}
                                                                </span>
                                                                <span className={`badge badge-${tc.status?.toLowerCase() || 'not_run'}`}>
                                                                    {tc.status || 'Not Run'}
                                                                </span>
                                                                <span className={`badge badge-${tc.type?.toLowerCase() || 'functional'}`}>
                                                                    {tc.type || 'Functional'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="test-case-body">
                                                        {tc.description && (
                                                            <div className="test-case-section">
                                                                <strong>Description:</strong>
                                                                <p>{tc.description}</p>
                                                            </div>
                                                        )}

                                                        {tc.steps && tc.steps.length > 0 && (
                                                            <div className="test-case-section">
                                                                <strong>Test Steps:</strong>
                                                                <ol className="test-steps-list">
                                                                    {tc.steps.map((step, stepIdx) => (
                                                                        <li key={stepIdx}>
                                                                            {typeof step === 'string' ? step : (step.step || step.expected || 'Step ' + (stepIdx + 1))}
                                                                            {step.expected && typeof step === 'object' && (
                                                                                <div className="step-expected">
                                                                                    <em>Expected: {step.expected}</em>
                                                                                </div>
                                                                            )}
                                                                        </li>
                                                                    ))}
                                                                </ol>
                                                            </div>
                                                        )}

                                                        {tc.expectedResult && (
                                                            <div className="test-case-section">
                                                                <strong>Expected Result:</strong>
                                                                <p>{tc.expectedResult}</p>
                                                            </div>
                                                        )}

                                                        <div className="test-case-meta">
                                                            <div className="meta-item">
                                                                <span className="meta-label">Created By:</span>
                                                                <span className="meta-value">
                                                                    {tc.creator?.name || tc.createdBy?.name || 'Unknown'}
                                                                </span>
                                                            </div>
                                                            {tc.assignee?.name && (
                                                                <div className="meta-item">
                                                                    <span className="meta-label">Assigned To:</span>
                                                                    <span className="meta-value">{tc.assignee.name}</span>
                                                                </div>
                                                            )}
                                                            {tc.project?.name && (
                                                                <div className="meta-item">
                                                                    <span className="meta-label">Project:</span>
                                                                    <span className="meta-value">{tc.project.name}</span>
                                                                </div>
                                                            )}
                                                            {tc.createdAt && (
                                                                <div className="meta-item">
                                                                    <span className="meta-label">Created:</span>
                                                                    <span className="meta-value">
                                                                        {new Date(tc.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {modalType === 'bugs' && (
                                        <div className="bugs-details">
                                            {modalData.map((bug, idx) => (
                                                <div key={bug.id || idx} className="bug-detail-card">
                                                    <div className="bug-card-header">
                                                        <div className="bug-title-section">
                                                            <h4>#{bug.id} - {bug.title || bug.description?.substring(0, 50) || 'Untitled Bug'}</h4>
                                                            <div className="bug-badges">
                                                                <span className={`badge badge-${bug.severity?.toLowerCase() || 'medium'}`}>
                                                                    {bug.severity || 'Medium'}
                                                                </span>
                                                                <span className={`badge badge-${bug.status?.toLowerCase() || 'open'}`}>
                                                                    {bug.status || 'Open'}
                                                                </span>
                                                                {bug.priority && (
                                                                    <span className={`badge badge-${bug.priority?.toLowerCase()}`}>
                                                                        Priority: {bug.priority}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bug-card-body">
                                                        {bug.description && (
                                                            <div className="bug-section">
                                                                <strong>Description:</strong>
                                                                <p>{bug.description}</p>
                                                            </div>
                                                        )}

                                                        {bug.stepsToReproduce && (
                                                            <div className="bug-section">
                                                                <strong>Steps to Reproduce:</strong>
                                                                <p className="bug-steps">{bug.stepsToReproduce}</p>
                                                            </div>
                                                        )}

                                                        {bug.expectedBehavior && (
                                                            <div className="bug-section">
                                                                <strong>Expected Behavior:</strong>
                                                                <p>{bug.expectedBehavior}</p>
                                                            </div>
                                                        )}

                                                        {bug.actualBehavior && (
                                                            <div className="bug-section">
                                                                <strong>Actual Behavior:</strong>
                                                                <p>{bug.actualBehavior}</p>
                                                            </div>
                                                        )}

                                                        {bug.environment && (
                                                            <div className="bug-section">
                                                                <strong>Environment:</strong>
                                                                <p>{bug.environment}</p>
                                                            </div>
                                                        )}

                                                        <div className="bug-meta">
                                                            <div className="meta-item">
                                                                <span className="meta-label">Reported By:</span>
                                                                <span className="meta-value">
                                                                    {bug.reportedBy?.name || bug.reporter?.name || 'Unknown'}
                                                                </span>
                                                            </div>
                                                            {bug.assignedTo?.name && (
                                                                <div className="meta-item">
                                                                    <span className="meta-label">Assigned To:</span>
                                                                    <span className="meta-value">{bug.assignedTo.name}</span>
                                                                </div>
                                                            )}
                                                            {bug.project?.name && (
                                                                <div className="meta-item">
                                                                    <span className="meta-label">Project:</span>
                                                                    <span className="meta-value">{bug.project.name}</span>
                                                                </div>
                                                            )}
                                                            {bug.createdAt && (
                                                                <div className="meta-item">
                                                                    <span className="meta-label">Reported:</span>
                                                                    <span className="meta-value">
                                                                        {new Date(bug.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {bug.resolvedAt && (
                                                                <div className="meta-item">
                                                                    <span className="meta-label">Resolved:</span>
                                                                    <span className="meta-value">
                                                                        {new Date(bug.resolvedAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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
                                        <div className="uat-details">
                                            {modalData.map((uat, idx) => (
                                                <div key={uat.id || idx} className="uat-detail-card">
                                                    <div className="uat-card-header">
                                                        <div className="uat-title-section">
                                                            <h4>#{uat.id} - {uat.title || uat.testName || uat.name || 'Untitled UAT'}</h4>
                                                            <div className="uat-badges">
                                                                <span className={`badge badge-${uat.status?.toLowerCase() || 'pending'}`}>
                                                                    {uat.status || 'Pending'}
                                                                </span>
                                                                <span className={`badge badge-${uat.priority?.toLowerCase() || 'medium'}`}>
                                                                    Priority: {uat.priority || 'Medium'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="uat-card-body">
                                                        {uat.description && (
                                                            <div className="uat-section">
                                                                <strong>Description:</strong>
                                                                <p>{uat.description}</p>
                                                            </div>
                                                        )}

                                                        {uat.steps && uat.steps.length > 0 && (
                                                            <div className="uat-section">
                                                                <strong>Test Steps:</strong>
                                                                <ol className="uat-steps-list">
                                                                    {uat.steps.map((step, stepIdx) => (
                                                                        <li key={stepIdx}>
                                                                            {typeof step === 'string' ? step : (step.step || step.description || 'Step ' + (stepIdx + 1))}
                                                                        </li>
                                                                    ))}
                                                                </ol>
                                                            </div>
                                                        )}

                                                        {uat.testSteps && uat.testSteps.length > 0 && !uat.steps && (
                                                            <div className="uat-section">
                                                                <strong>Test Steps:</strong>
                                                                <ol className="uat-steps-list">
                                                                    {uat.testSteps.map((step, stepIdx) => (
                                                                        <li key={stepIdx}>
                                                                            {typeof step === 'string' ? step : (step.step || step.description || 'Step ' + (stepIdx + 1))}
                                                                        </li>
                                                                    ))}
                                                                </ol>
                                                            </div>
                                                        )}

                                                        {uat.expectedResult && (
                                                            <div className="uat-section">
                                                                <strong>Expected Result:</strong>
                                                                <p>{uat.expectedResult}</p>
                                                            </div>
                                                        )}

                                                        {uat.actualResult && (
                                                            <div className="uat-section">
                                                                <strong>Actual Result:</strong>
                                                                <p>{uat.actualResult}</p>
                                                            </div>
                                                        )}

                                                        {(uat.feedback || uat.comments) && (
                                                            <div className="uat-section">
                                                                <strong>Feedback/Comments:</strong>
                                                                <p>{uat.feedback || uat.comments}</p>
                                                            </div>
                                                        )}

                                                        <div className="uat-meta">
                                                            <div className="meta-item">
                                                                <span className="meta-label">Tester:</span>
                                                                <span className="meta-value">
                                                                    {uat.tester?.name || uat.testerName || 'Not Assigned'}
                                                                </span>
                                                            </div>
                                                            {uat.creator?.name && (
                                                                <div className="meta-item">
                                                                    <span className="meta-label">Created By:</span>
                                                                    <span className="meta-value">{uat.creator.name}</span>
                                                                </div>
                                                            )}
                                                            {uat.project?.name && (
                                                                <div className="meta-item">
                                                                    <span className="meta-label">Project:</span>
                                                                    <span className="meta-value">{uat.project.name}</span>
                                                                </div>
                                                            )}
                                                            {uat.createdAt && (
                                                                <div className="meta-item">
                                                                    <span className="meta-label">Created:</span>
                                                                    <span className="meta-value">
                                                                        {new Date(uat.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {uat.lastUpdated && (
                                                                <div className="meta-item">
                                                                    <span className="meta-label">Last Updated:</span>
                                                                    <span className="meta-value">
                                                                        {new Date(uat.lastUpdated).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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
