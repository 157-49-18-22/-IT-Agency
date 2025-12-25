import React, { useState, useEffect } from 'react';
import { projectsAPI } from '../../services/api';
import {
    FiShield,
    FiLock,
    FiAlertTriangle,
    FiCheckCircle,
    FiXCircle,
    FiEye,
    FiKey,
    FiDatabase,
    FiGlobe,
    FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import './SecurityTesting.css';

const SecurityTesting = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [loading, setLoading] = useState(false);
    const [scanResults, setScanResults] = useState([]);
    const [showNewScanModal, setShowNewScanModal] = useState(false);

    const [newScan, setNewScan] = useState({
        projectId: '',
        scanName: '',
        url: '',
        scanTypes: {
            sqlInjection: true,
            xss: true,
            csrf: true,
            authentication: true,
            authorization: true,
            dataEncryption: true
        }
    });

    useEffect(() => {
        fetchProjects();
        loadScanResults();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await projectsAPI.getProjects().catch(() => ({ data: [] }));
            setProjects(response.data?.data || response.data || []);
        } catch (err) {
            console.error('Error fetching projects:', err);
        }
    };

    const loadScanResults = () => {
        // Mock data - replace with actual API call
        const mockResults = [
            {
                id: 1,
                projectName: 'E-commerce Platform',
                scanType: 'Full Security Scan',
                vulnerabilities: {
                    critical: 0,
                    high: 1,
                    medium: 3,
                    low: 5
                },
                status: 'completed',
                score: 85,
                scannedAt: new Date().toISOString(),
                findings: [
                    { type: 'high', issue: 'Missing HTTPS on login page', recommendation: 'Implement SSL/TLS' },
                    { type: 'medium', issue: 'Weak password policy', recommendation: 'Enforce stronger password requirements' }
                ]
            },
            {
                id: 2,
                projectName: 'Mobile App Backend',
                scanType: 'API Security Scan',
                vulnerabilities: {
                    critical: 1,
                    high: 2,
                    medium: 1,
                    low: 2
                },
                status: 'completed',
                score: 72,
                scannedAt: new Date(Date.now() - 86400000).toISOString(),
                findings: [
                    { type: 'critical', issue: 'SQL Injection vulnerability detected', recommendation: 'Use parameterized queries' },
                    { type: 'high', issue: 'Missing rate limiting', recommendation: 'Implement API rate limiting' }
                ]
            }
        ];
        setScanResults(mockResults);
    };

    const handleRunScan = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simulate scan execution
            await new Promise(resolve => setTimeout(resolve, 4000));

            const result = {
                id: Date.now(),
                projectName: projects.find(p => p.id === parseInt(newScan.projectId))?.name || 'Unknown',
                scanType: 'Full Security Scan',
                vulnerabilities: {
                    critical: Math.floor(Math.random() * 2),
                    high: Math.floor(Math.random() * 3),
                    medium: Math.floor(Math.random() * 5),
                    low: Math.floor(Math.random() * 8)
                },
                status: 'completed',
                score: Math.floor(Math.random() * 30) + 70,
                scannedAt: new Date().toISOString(),
                findings: []
            };

            setScanResults([result, ...scanResults]);
            setShowNewScanModal(false);
            setNewScan({
                projectId: '',
                scanName: '',
                url: '',
                scanTypes: {
                    sqlInjection: true,
                    xss: true,
                    csrf: true,
                    authentication: true,
                    authorization: true,
                    dataEncryption: true
                }
            });

            toast.success('Security scan completed successfully!');
        } catch (err) {
            toast.error('Failed to run security scan');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'excellent';
        if (score >= 75) return 'good';
        if (score >= 60) return 'fair';
        return 'poor';
    };

    const filteredResults = selectedProject
        ? scanResults.filter(r => r.projectName === projects.find(p => p.id === parseInt(selectedProject))?.name)
        : scanResults;

    const totalVulnerabilities = scanResults.reduce((acc, r) => ({
        critical: acc.critical + r.vulnerabilities.critical,
        high: acc.high + r.vulnerabilities.high,
        medium: acc.medium + r.vulnerabilities.medium,
        low: acc.low + r.vulnerabilities.low
    }), { critical: 0, high: 0, medium: 0, low: 0 });

    return (
        <div className="security-testing-container">
            <div className="page-header">
                <div>
                    <h1>Security Testing</h1>
                    <p className="subtitle">Identify and fix security vulnerabilities</p>
                </div>
                <button className="btn-primary" onClick={() => setShowNewScanModal(true)}>
                    <FiShield /> Run Security Scan
                </button>
            </div>

            {/* Security Overview */}
            <div className="security-overview">
                <div className="vulnerability-card critical">
                    <div className="vuln-icon">
                        <FiXCircle />
                    </div>
                    <div className="vuln-content">
                        <h3>Critical</h3>
                        <p className="vuln-count">{totalVulnerabilities.critical}</p>
                    </div>
                </div>

                <div className="vulnerability-card high">
                    <div className="vuln-icon">
                        <FiAlertTriangle />
                    </div>
                    <div className="vuln-content">
                        <h3>High</h3>
                        <p className="vuln-count">{totalVulnerabilities.high}</p>
                    </div>
                </div>

                <div className="vulnerability-card medium">
                    <div className="vuln-icon">
                        <FiAlertTriangle />
                    </div>
                    <div className="vuln-content">
                        <h3>Medium</h3>
                        <p className="vuln-count">{totalVulnerabilities.medium}</p>
                    </div>
                </div>

                <div className="vulnerability-card low">
                    <div className="vuln-icon">
                        <FiCheckCircle />
                    </div>
                    <div className="vuln-content">
                        <h3>Low</h3>
                        <p className="vuln-count">{totalVulnerabilities.low}</p>
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

            {/* Scan Results */}
            <div className="scan-results">
                <h2>Scan Results</h2>
                {filteredResults.length === 0 ? (
                    <div className="empty-state">
                        <FiShield size={48} />
                        <p>No security scans found</p>
                        <button className="btn-outline" onClick={() => setShowNewScanModal(true)}>
                            Run Your First Scan
                        </button>
                    </div>
                ) : (
                    <div className="results-list">
                        {filteredResults.map(result => (
                            <div key={result.id} className="scan-result-card">
                                <div className="scan-header">
                                    <div>
                                        <h3>{result.projectName}</h3>
                                        <span className="scan-type">{result.scanType}</span>
                                    </div>
                                    <div className={`security-score ${getScoreColor(result.score)}`}>
                                        <span className="score-value">{result.score}</span>
                                        <span className="score-label">/100</span>
                                    </div>
                                </div>

                                <div className="vulnerabilities-summary">
                                    {result.vulnerabilities.critical > 0 && (
                                        <div className="vuln-badge critical">
                                            <FiXCircle /> {result.vulnerabilities.critical} Critical
                                        </div>
                                    )}
                                    {result.vulnerabilities.high > 0 && (
                                        <div className="vuln-badge high">
                                            <FiAlertTriangle /> {result.vulnerabilities.high} High
                                        </div>
                                    )}
                                    {result.vulnerabilities.medium > 0 && (
                                        <div className="vuln-badge medium">
                                            <FiAlertTriangle /> {result.vulnerabilities.medium} Medium
                                        </div>
                                    )}
                                    {result.vulnerabilities.low > 0 && (
                                        <div className="vuln-badge low">
                                            <FiCheckCircle /> {result.vulnerabilities.low} Low
                                        </div>
                                    )}
                                </div>

                                {result.findings && result.findings.length > 0 && (
                                    <div className="findings-section">
                                        <h4>Key Findings:</h4>
                                        {result.findings.slice(0, 2).map((finding, idx) => (
                                            <div key={idx} className={`finding-item ${finding.type}`}>
                                                <div className="finding-issue">{finding.issue}</div>
                                                <div className="finding-recommendation">
                                                    <FiEye size={14} /> {finding.recommendation}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="scan-footer">
                                    <span className="scan-date">
                                        Scanned: {new Date(result.scannedAt).toLocaleString()}
                                    </span>
                                    <button className="btn-view-details">View Full Report</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* New Scan Modal */}
            {showNewScanModal && (
                <div className="modal-overlay" onClick={() => setShowNewScanModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Run Security Scan</h2>
                            <button className="close-btn" onClick={() => setShowNewScanModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleRunScan}>
                            <div className="form-group">
                                <label>Project <span className="required">*</span></label>
                                <select
                                    value={newScan.projectId}
                                    onChange={(e) => setNewScan({ ...newScan, projectId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Project</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Scan Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={newScan.scanName}
                                    onChange={(e) => setNewScan({ ...newScan, scanName: e.target.value })}
                                    placeholder="e.g., Production Security Audit"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>URL to Scan <span className="required">*</span></label>
                                <input
                                    type="url"
                                    value={newScan.url}
                                    onChange={(e) => setNewScan({ ...newScan, url: e.target.value })}
                                    placeholder="https://example.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Scan Types</label>
                                <div className="checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={newScan.scanTypes.sqlInjection}
                                            onChange={(e) => setNewScan({
                                                ...newScan,
                                                scanTypes: { ...newScan.scanTypes, sqlInjection: e.target.checked }
                                            })}
                                        />
                                        <FiDatabase /> SQL Injection
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={newScan.scanTypes.xss}
                                            onChange={(e) => setNewScan({
                                                ...newScan,
                                                scanTypes: { ...newScan.scanTypes, xss: e.target.checked }
                                            })}
                                        />
                                        <FiGlobe /> XSS (Cross-Site Scripting)
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={newScan.scanTypes.csrf}
                                            onChange={(e) => setNewScan({
                                                ...newScan,
                                                scanTypes: { ...newScan.scanTypes, csrf: e.target.checked }
                                            })}
                                        />
                                        <FiShield /> CSRF Protection
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={newScan.scanTypes.authentication}
                                            onChange={(e) => setNewScan({
                                                ...newScan,
                                                scanTypes: { ...newScan.scanTypes, authentication: e.target.checked }
                                            })}
                                        />
                                        <FiKey /> Authentication
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={newScan.scanTypes.authorization}
                                            onChange={(e) => setNewScan({
                                                ...newScan,
                                                scanTypes: { ...newScan.scanTypes, authorization: e.target.checked }
                                            })}
                                        />
                                        <FiLock /> Authorization
                                    </label>
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={newScan.scanTypes.dataEncryption}
                                            onChange={(e) => setNewScan({
                                                ...newScan,
                                                scanTypes: { ...newScan.scanTypes, dataEncryption: e.target.checked }
                                            })}
                                        />
                                        <FiShield /> Data Encryption
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-outline" onClick={() => setShowNewScanModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <FiRefreshCw className="spin" /> Scanning...
                                        </>
                                    ) : (
                                        <>
                                            <FiShield /> Start Scan
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

export default SecurityTesting;
