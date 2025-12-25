import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../../services/api';
import {
    FiCheckSquare,
    FiSquare,
    FiDownload,
    FiFileText,
    FiCheckCircle,
    FiClock,
    FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import './TestingDeliverables.css';

const TestingDeliverables = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [deliverables, setDeliverables] = useState([]);

    const checklistTemplate = [
        { id: 1, item: 'All test cases executed', category: 'Test Execution', completed: false },
        { id: 2, item: 'Test results documented', category: 'Documentation', completed: false },
        { id: 3, item: 'Bugs logged with details', category: 'Bug Tracking', completed: false },
        { id: 4, item: 'Retest completed for fixes', category: 'Regression', completed: false },
        { id: 5, item: 'Performance benchmarks verified', category: 'Performance', completed: false },
        { id: 6, item: 'Security checks passed', category: 'Security', completed: false },
        { id: 7, item: 'Cross-browser testing done', category: 'Compatibility', completed: false },
        { id: 8, item: 'Final test report prepared', category: 'Documentation', completed: false }
    ];

    useEffect(() => {
        fetchProjects();
        loadDeliverables();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await projectsAPI.getProjects().catch(() => ({ data: [] }));
            const testingProjects = (response.data?.data || response.data || [])
                .filter(p => p.phase === 'Testing' || p.status === 'Testing');
            setProjects(testingProjects);
        } catch (err) {
            console.error('Error fetching projects:', err);
        }
    };

    const loadDeliverables = () => {
        // Mock data - replace with actual API call
        const mockDeliverables = [
            {
                projectId: 1,
                projectName: 'E-commerce Platform',
                checklist: checklistTemplate.map((item, idx) => ({
                    ...item,
                    completed: idx < 5
                })),
                completionPercentage: 62,
                lastUpdated: new Date().toISOString()
            }
        ];
        setDeliverables(mockDeliverables);
    };

    const handleChecklistToggle = (projectId, itemId) => {
        setDeliverables(prevDeliverables =>
            prevDeliverables.map(deliverable => {
                if (deliverable.projectId === projectId) {
                    const updatedChecklist = deliverable.checklist.map(item =>
                        item.id === itemId ? { ...item, completed: !item.completed } : item
                    );
                    const completedCount = updatedChecklist.filter(item => item.completed).length;
                    const completionPercentage = Math.round((completedCount / updatedChecklist.length) * 100);

                    return {
                        ...deliverable,
                        checklist: updatedChecklist,
                        completionPercentage,
                        lastUpdated: new Date().toISOString()
                    };
                }
                return deliverable;
            })
        );
        toast.success('Checklist updated');
    };

    const handleGenerateReport = (projectName) => {
        toast.info(`Generating test report for ${projectName}...`);
        // Implement report generation logic
    };

    const selectedDeliverable = selectedProject
        ? deliverables.find(d => d.projectId === parseInt(selectedProject))
        : null;

    const groupedChecklist = selectedDeliverable
        ? selectedDeliverable.checklist.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = [];
            }
            acc[item.category].push(item);
            return acc;
        }, {})
        : {};

    return (
        <div className="testing-deliverables-container">
            <div className="page-header">
                <div>
                    <h1>Testing Deliverables</h1>
                    <p className="subtitle">Track testing completion and generate reports</p>
                </div>
            </div>

            {/* Project Selection */}
            <div className="project-selection">
                <label>Select Project:</label>
                <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="project-select"
                >
                    <option value="">Choose a project in testing...</option>
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            {selectedDeliverable ? (
                <>
                    {/* Progress Overview */}
                    <div className="progress-overview">
                        <div className="progress-card">
                            <div className="progress-header">
                                <h2>{selectedDeliverable.projectName}</h2>
                                <span className={`completion-badge ${selectedDeliverable.completionPercentage === 100 ? 'complete' : 'in-progress'}`}>
                                    {selectedDeliverable.completionPercentage}% Complete
                                </span>
                            </div>

                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${selectedDeliverable.completionPercentage}%` }}
                                />
                            </div>

                            <div className="progress-stats">
                                <div className="stat">
                                    <FiCheckCircle className="stat-icon completed" />
                                    <span>{selectedDeliverable.checklist.filter(i => i.completed).length} Completed</span>
                                </div>
                                <div className="stat">
                                    <FiClock className="stat-icon pending" />
                                    <span>{selectedDeliverable.checklist.filter(i => !i.completed).length} Pending</span>
                                </div>
                                <div className="stat">
                                    <FiFileText className="stat-icon" />
                                    <span>Last updated: {new Date(selectedDeliverable.lastUpdated).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Checklist by Category */}
                    <div className="checklist-section">
                        <div className="section-header">
                            <h2>Testing Checklist</h2>
                            <button
                                className="btn-generate-report"
                                onClick={() => handleGenerateReport(selectedDeliverable.projectName)}
                                disabled={selectedDeliverable.completionPercentage < 100}
                            >
                                <FiDownload /> Generate Final Report
                            </button>
                        </div>

                        <div className="checklist-categories">
                            {Object.entries(groupedChecklist).map(([category, items]) => (
                                <div key={category} className="category-section">
                                    <h3 className="category-title">
                                        <FiCheckSquare /> {category}
                                    </h3>
                                    <div className="checklist-items">
                                        {items.map(item => (
                                            <div
                                                key={item.id}
                                                className={`checklist-item ${item.completed ? 'completed' : ''}`}
                                                onClick={() => handleChecklistToggle(selectedDeliverable.projectId, item.id)}
                                            >
                                                <div className="checkbox-wrapper">
                                                    {item.completed ? (
                                                        <FiCheckSquare className="checkbox checked" />
                                                    ) : (
                                                        <FiSquare className="checkbox" />
                                                    )}
                                                </div>
                                                <span className="item-text">{item.item}</span>
                                                {item.completed && (
                                                    <FiCheckCircle className="completed-icon" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Completion Status */}
                    {selectedDeliverable.completionPercentage === 100 && (
                        <div className="completion-alert success">
                            <FiCheckCircle size={24} />
                            <div>
                                <h3>All Testing Deliverables Complete!</h3>
                                <p>This project is ready for final approval and deployment.</p>
                            </div>
                        </div>
                    )}

                    {selectedDeliverable.completionPercentage < 100 && selectedDeliverable.completionPercentage > 0 && (
                        <div className="completion-alert warning">
                            <FiAlertCircle size={24} />
                            <div>
                                <h3>Testing In Progress</h3>
                                <p>Complete all checklist items before generating the final report.</p>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="empty-state">
                    <FiFileText size={64} />
                    <h3>No Project Selected</h3>
                    <p>Select a project from the dropdown above to view and manage testing deliverables.</p>
                </div>
            )}
        </div>
    );
};

export default TestingDeliverables;
