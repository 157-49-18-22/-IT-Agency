import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaBug, FaKey } from 'react-icons/fa';
import './ClientPortal.css';

const TestingMonitoring = () => {
    const testingProgress = 0;
    const testResults = {
        total: 0,
        passed: 0,
        failed: 0,
        pending: 0
    };

    const bugs = [
        { id: 1, title: 'Login validation issue', severity: 'High', status: 'Open' },
        { id: 2, title: 'UI alignment on mobile', severity: 'Low', status: 'Resolved' }
    ];

    return (
        <div className="stage-monitoring-page">
            <div className="page-header">
                <h1>Testing Monitoring</h1>
                <p>Track testing progress and quality assurance</p>
            </div>

            <div className="progress-overview">
                <div className="progress-card">
                    <h3>Testing Progress</h3>
                    <div className="circular-progress">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="10" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#6c757d" strokeWidth="10"
                                strokeDasharray={`${testingProgress * 2.83} 283`} transform="rotate(-90 50 50)" />
                        </svg>
                        <div className="progress-text"><span>{testingProgress}%</span></div>
                    </div>
                    <p className="status-text">Testing phase not started</p>
                </div>

                <div className="uat-access-card">
                    <h3>UAT Environment</h3>
                    <p>Will be available when testing begins</p>
                    <button className="btn-primary" disabled>
                        <FaKey /> Access UAT
                    </button>
                </div>
            </div>

            <div className="test-results-section">
                <h3>Test Results</h3>
                <div className="results-grid">
                    <div className="result-card">
                        <h4>{testResults.total}</h4>
                        <p>Total Tests</p>
                    </div>
                    <div className="result-card passed">
                        <h4>{testResults.passed}</h4>
                        <p>Passed</p>
                    </div>
                    <div className="result-card failed">
                        <h4>{testResults.failed}</h4>
                        <p>Failed</p>
                    </div>
                    <div className="result-card pending">
                        <h4>{testResults.pending}</h4>
                        <p>Pending</p>
                    </div>
                </div>
            </div>

            <div className="bugs-section">
                <h3>Bug Reports</h3>
                {bugs.length > 0 ? (
                    <div className="bugs-list">
                        {bugs.map(bug => (
                            <div key={bug.id} className="bug-item">
                                <FaBug className={`bug-icon ${bug.severity.toLowerCase()}`} />
                                <div className="bug-info">
                                    <h4>{bug.title}</h4>
                                    <span className={`severity-badge ${bug.severity.toLowerCase()}`}>{bug.severity}</span>
                                    <span className={`status-badge ${bug.status.toLowerCase()}`}>{bug.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-message">No bugs reported yet</p>
                )}
            </div>
        </div>
    );
};

export default TestingMonitoring;
