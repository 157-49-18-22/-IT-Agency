import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../../services/api';
import {
    FiClock,
    FiTrendingUp,
    FiActivity,
    FiZap,
    FiCheckCircle,
    FiAlertTriangle,
    FiBarChart2,
    FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import './PerformanceTesting.css';

const PerformanceTesting = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [loading, setLoading] = useState(false);
    const [testResults, setTestResults] = useState([]);
    const [showNewTestModal, setShowNewTestModal] = useState(false);

    const [newTest, setNewTest] = useState({
        projectId: '',
        testName: '',
        url: '',
        testType: 'load',
        duration: 60,
        concurrentUsers: 10,
        targetResponseTime: 2000
    });

    useEffect(() => {
        fetchProjects();
        loadTestResults();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await projectsAPI.getProjects().catch(() => ({ data: [] }));
            setProjects(response.data?.data || response.data || []);
        } catch (err) {
            console.error('Error fetching projects:', err);
        }
    };

    const loadTestResults = () => {
        // Mock data - replace with actual API call
        const mockResults = [
            {
                id: 1,
                projectName: 'E-commerce Platform',
                testType: 'Load Test',
                avgResponseTime: 1850,
                maxResponseTime: 3200,
                minResponseTime: 450,
                throughput: 150,
                errorRate: 0.5,
                status: 'passed',
                testedAt: new Date().toISOString()
            },
            {
                id: 2,
                projectName: 'Mobile App Backend',
                testType: 'Stress Test',
                avgResponseTime: 2500,
                maxResponseTime: 5000,
                minResponseTime: 800,
                throughput: 95,
                errorRate: 2.3,
                status: 'warning',
                testedAt: new Date(Date.now() - 86400000).toISOString()
            }
        ];
        setTestResults(mockResults);
    };

    const handleRunTest = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simulate test execution
            await new Promise(resolve => setTimeout(resolve, 3000));

            const result = {
                id: Date.now(),
                projectName: projects.find(p => p.id === parseInt(newTest.projectId))?.name || 'Unknown',
                testType: newTest.testType === 'load' ? 'Load Test' : 'Stress Test',
                avgResponseTime: Math.floor(Math.random() * 2000) + 500,
                maxResponseTime: Math.floor(Math.random() * 3000) + 2000,
                minResponseTime: Math.floor(Math.random() * 500) + 200,
                throughput: Math.floor(Math.random() * 100) + 50,
                errorRate: (Math.random() * 3).toFixed(1),
                status: Math.random() > 0.3 ? 'passed' : 'warning',
                testedAt: new Date().toISOString()
            };

            setTestResults([result, ...testResults]);
            setShowNewTestModal(false);
            setNewTest({
                projectId: '',
                testName: '',
                url: '',
                testType: 'load',
                duration: 60,
                concurrentUsers: 10,
                targetResponseTime: 2000
            });

            toast.success('Performance test completed successfully!');
        } catch (err) {
            toast.error('Failed to run performance test');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'passed':
                return <span className="status-badge passed"><FiCheckCircle /> Passed</span>;
            case 'warning':
                return <span className="status-badge warning"><FiAlertTriangle /> Warning</span>;
            case 'failed':
                return <span className="status-badge failed"><FiAlertTriangle /> Failed</span>;
            default:
                return <span className="status-badge">{status}</span>;
        }
    };

    const filteredResults = selectedProject
        ? testResults.filter(r => r.projectName === projects.find(p => p.id === parseInt(selectedProject))?.name)
        : testResults;

    return (
        <div className="performance-testing-container">
            <div className="page-header">
                <div>
                    <h1>Performance Testing</h1>
                    <p className="subtitle">Monitor and optimize application performance</p>
                </div>
                <button className="btn-primary" onClick={() => setShowNewTestModal(true)}>
                    <FiZap /> Run New Test
                </button>
            </div>

            {/* Metrics Overview */}
            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon avg">
                        <FiClock />
                    </div>
                    <div className="metric-content">
                        <h3>Avg Response Time</h3>
                        <p className="metric-value">
                            {testResults.length > 0
                                ? Math.round(testResults.reduce((acc, r) => acc + r.avgResponseTime, 0) / testResults.length)
                                : 0}ms
                        </p>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon throughput">
                        <FiTrendingUp />
                    </div>
                    <div className="metric-content">
                        <h3>Avg Throughput</h3>
                        <p className="metric-value">
                            {testResults.length > 0
                                ? Math.round(testResults.reduce((acc, r) => acc + r.throughput, 0) / testResults.length)
                                : 0} req/s
                        </p>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon error">
                        <FiActivity />
                    </div>
                    <div className="metric-content">
                        <h3>Avg Error Rate</h3>
                        <p className="metric-value">
                            {testResults.length > 0
                                ? (testResults.reduce((acc, r) => acc + parseFloat(r.errorRate), 0) / testResults.length).toFixed(1)
                                : 0}%
                        </p>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon tests">
                        <FiBarChart2 />
                    </div>
                    <div className="metric-content">
                        <h3>Total Tests</h3>
                        <p className="metric-value">{testResults.length}</p>
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="filter-section">
                <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="project-filter"
                >
                    <option value="">All Projects</option>
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            {/* Test Results */}
            <div className="test-results">
                <h2>Test Results</h2>
                {filteredResults.length === 0 ? (
                    <div className="empty-state">
                        <FiBarChart2 size={48} />
                        <p>No performance tests found</p>
                        <button className="btn-outline" onClick={() => setShowNewTestModal(true)}>
                            Run Your First Test
                        </button>
                    </div>
                ) : (
                    <div className="results-grid">
                        {filteredResults.map(result => (
                            <div key={result.id} className="result-card">
                                <div className="result-header">
                                    <div>
                                        <h3>{result.projectName}</h3>
                                        <span className="test-type">{result.testType}</span>
                                    </div>
                                    {getStatusBadge(result.status)}
                                </div>

                                <div className="result-metrics">
                                    <div className="result-metric">
                                        <span className="label">Avg Response</span>
                                        <span className="value">{result.avgResponseTime}ms</span>
                                    </div>
                                    <div className="result-metric">
                                        <span className="label">Max Response</span>
                                        <span className="value">{result.maxResponseTime}ms</span>
                                    </div>
                                    <div className="result-metric">
                                        <span className="label">Throughput</span>
                                        <span className="value">{result.throughput} req/s</span>
                                    </div>
                                    <div className="result-metric">
                                        <span className="label">Error Rate</span>
                                        <span className="value error-rate">{result.errorRate}%</span>
                                    </div>
                                </div>

                                <div className="result-footer">
                                    <span className="test-date">
                                        <FiClock size={14} /> {new Date(result.testedAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* New Test Modal */}
            {showNewTestModal && (
                <div className="modal-overlay" onClick={() => setShowNewTestModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Run Performance Test</h2>
                            <button className="close-btn" onClick={() => setShowNewTestModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleRunTest}>
                            <div className="form-group">
                                <label>Project <span className="required">*</span></label>
                                <select
                                    value={newTest.projectId}
                                    onChange={(e) => setNewTest({ ...newTest, projectId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Project</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Test Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={newTest.testName}
                                    onChange={(e) => setNewTest({ ...newTest, testName: e.target.value })}
                                    placeholder="e.g., Homepage Load Test"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>URL to Test <span className="required">*</span></label>
                                <input
                                    type="url"
                                    value={newTest.url}
                                    onChange={(e) => setNewTest({ ...newTest, url: e.target.value })}
                                    placeholder="https://example.com"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Test Type</label>
                                    <select
                                        value={newTest.testType}
                                        onChange={(e) => setNewTest({ ...newTest, testType: e.target.value })}
                                    >
                                        <option value="load">Load Test</option>
                                        <option value="stress">Stress Test</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Duration (seconds)</label>
                                    <input
                                        type="number"
                                        value={newTest.duration}
                                        onChange={(e) => setNewTest({ ...newTest, duration: parseInt(e.target.value) })}
                                        min="10"
                                        max="600"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Concurrent Users</label>
                                    <input
                                        type="number"
                                        value={newTest.concurrentUsers}
                                        onChange={(e) => setNewTest({ ...newTest, concurrentUsers: parseInt(e.target.value) })}
                                        min="1"
                                        max="1000"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Target Response Time (ms)</label>
                                    <input
                                        type="number"
                                        value={newTest.targetResponseTime}
                                        onChange={(e) => setNewTest({ ...newTest, targetResponseTime: parseInt(e.target.value) })}
                                        min="100"
                                        max="10000"
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-outline" onClick={() => setShowNewTestModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <FiRefreshCw className="spin" /> Running Test...
                                        </>
                                    ) : (
                                        <>
                                            <FiZap /> Run Test
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PerformanceTesting;
