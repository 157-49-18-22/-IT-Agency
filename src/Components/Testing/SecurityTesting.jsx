import React, { useState } from 'react';
import { FaShieldAlt, FaCheckCircle, FaExclamationTriangle, FaLock } from 'react-icons/fa';
import './TestingPages.css';

const SecurityTesting = () => {
    const [securityChecks, setSecurityChecks] = useState([
        { id: 1, check: 'SQL Injection Prevention', status: 'Pass', severity: 'Critical', description: 'All inputs are properly sanitized' },
        { id: 2, check: 'XSS Protection', status: 'Pass', severity: 'Critical', description: 'Output encoding implemented' },
        { id: 3, check: 'CSRF Token Validation', status: 'Pass', severity: 'High', description: 'CSRF tokens present on all forms' },
        { id: 4, check: 'Authentication Security', status: 'Pass', severity: 'Critical', description: 'Strong password policy enforced' },
        { id: 5, check: 'Session Management', status: 'Warning', severity: 'High', description: 'Session timeout could be shorter' },
        { id: 6, check: 'HTTPS Enforcement', status: 'Pass', severity: 'Critical', description: 'All traffic encrypted' },
        { id: 7, check: 'API Security', status: 'Pass', severity: 'High', description: 'API endpoints properly authenticated' },
        { id: 8, check: 'File Upload Validation', status: 'Pass', severity: 'Medium', description: 'File types and sizes validated' }
    ]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pass':
                return <FaCheckCircle className="status-icon success" />;
            case 'Warning':
                return <FaExclamationTriangle className="status-icon warning" />;
            case 'Fail':
                return <FaExclamationTriangle className="status-icon danger" />;
            default:
                return null;
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'Critical':
                return '#dc3545';
            case 'High':
                return '#ff9800';
            case 'Medium':
                return '#ffc107';
            case 'Low':
                return '#28a745';
            default:
                return '#6c757d';
        }
    };

    const passedChecks = securityChecks.filter(c => c.status === 'Pass').length;
    const totalChecks = securityChecks.length;
    const securityScore = Math.round((passedChecks / totalChecks) * 100);

    return (
        <div className="testing-page-container">
            <div className="page-header">
                <div className="header-content">
                    <h1>Security Testing</h1>
                    <p>Comprehensive security vulnerability assessment</p>
                </div>
                <button className="btn-primary">
                    <FaShieldAlt /> Run Security Scan
                </button>
            </div>

            {/* Security Score */}
            <div className="security-score">
                <div className="score-circle">
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="10" />
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            stroke={securityScore >= 80 ? '#28a745' : securityScore >= 60 ? '#ffc107' : '#dc3545'}
                            strokeWidth="10"
                            strokeDasharray={`${securityScore * 2.83} 283`}
                            transform="rotate(-90 50 50)"
                        />
                    </svg>
                    <div className="score-text">
                        <h2>{securityScore}%</h2>
                        <p>Security Score</p>
                    </div>
                </div>
                <div className="score-details">
                    <h3>Security Assessment Summary</h3>
                    <p>{passedChecks} out of {totalChecks} security checks passed</p>
                    <div className="score-breakdown">
                        <div className="breakdown-item">
                            <FaCheckCircle className="breakdown-icon success" />
                            <span>{passedChecks} Passed</span>
                        </div>
                        <div className="breakdown-item">
                            <FaExclamationTriangle className="breakdown-icon warning" />
                            <span>{securityChecks.filter(c => c.status === 'Warning').length} Warnings</span>
                        </div>
                        <div className="breakdown-item">
                            <FaExclamationTriangle className="breakdown-icon danger" />
                            <span>{securityChecks.filter(c => c.status === 'Fail').length} Failed</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Checks Table */}
            <div className="security-checks">
                <h3>Security Checks</h3>
                <div className="checks-list">
                    {securityChecks.map(check => (
                        <div key={check.id} className={`check-card ${check.status.toLowerCase()}`}>
                            <div className="check-header">
                                <div className="check-title">
                                    {getStatusIcon(check.status)}
                                    <h4>{check.check}</h4>
                                </div>
                                <span
                                    className="severity-badge"
                                    style={{ background: getSeverityColor(check.severity) }}
                                >
                                    {check.severity}
                                </span>
                            </div>
                            <p className="check-description">{check.description}</p>
                            <div className="check-actions">
                                <button className="btn-sm btn-outline">View Details</button>
                                {check.status !== 'Pass' && (
                                    <button className="btn-sm btn-primary">Fix Issue</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Security Recommendations */}
            <div className="security-recommendations">
                <h3>Security Recommendations</h3>
                <div className="recommendation-list">
                    <div className="recommendation-item high">
                        <FaLock className="rec-icon" />
                        <div className="rec-content">
                            <h4>Reduce Session Timeout</h4>
                            <p>Consider reducing session timeout from 24 hours to 2 hours for better security.</p>
                            <span className="rec-priority">High Priority</span>
                        </div>
                    </div>
                    <div className="recommendation-item medium">
                        <FaShieldAlt className="rec-icon" />
                        <div className="rec-content">
                            <h4>Implement Rate Limiting</h4>
                            <p>Add rate limiting to prevent brute force attacks on login endpoints.</p>
                            <span className="rec-priority">Medium Priority</span>
                        </div>
                    </div>
                    <div className="recommendation-item low">
                        <FaCheckCircle className="rec-icon" />
                        <div className="rec-content">
                            <h4>Enable Security Headers</h4>
                            <p>Add additional security headers like Content-Security-Policy.</p>
                            <span className="rec-priority">Low Priority</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityTesting;
