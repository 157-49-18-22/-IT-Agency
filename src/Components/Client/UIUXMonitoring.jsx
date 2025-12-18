import React, { useState } from 'react';
import { FaCheckCircle, FaDownload, FaEye, FaComment } from 'react-icons/fa';
import './ClientPortal.css';

const UIUXMonitoring = () => {
    const [designProgress] = useState({
        overall: 100,
        wireframes: 100,
        mockups: 100,
        prototypes: 100
    });

    const [wireframes] = useState([
        { id: 1, name: 'Homepage Wireframe', status: 'Approved', date: '2024-01-08', url: '#' },
        { id: 2, name: 'Dashboard Wireframe', status: 'Approved', date: '2024-01-08', url: '#' },
        { id: 3, name: 'Login Page Wireframe', status: 'Approved', date: '2024-01-08', url: '#' }
    ]);

    const [mockups] = useState([
        { id: 1, name: 'Homepage Mockup', status: 'Approved', date: '2024-01-15', url: '#', thumbnail: 'mockup1.jpg' },
        { id: 2, name: 'Dashboard Mockup', status: 'Approved', date: '2024-01-15', url: '#', thumbnail: 'mockup2.jpg' },
        { id: 3, name: 'Login Page Mockup', status: 'Approved', date: '2024-01-15', url: '#', thumbnail: 'mockup3.jpg' }
    ]);

    const [prototypes] = useState([
        { id: 1, name: 'Interactive Prototype', status: 'Approved', date: '2024-01-20', url: '#', type: 'Figma' }
    ]);

    return (
        <div className="stage-monitoring-page">
            <div className="page-header">
                <h1>UI/UX Design Monitoring</h1>
                <p>Track design progress and review deliverables</p>
            </div>

            {/* Progress Overview */}
            <div className="progress-overview">
                <div className="progress-card">
                    <h3>Design Progress</h3>
                    <div className="circular-progress">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="10" />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#28a745"
                                strokeWidth="10"
                                strokeDasharray={`${designProgress.overall * 2.83} 283`}
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="progress-text">
                            <span>{designProgress.overall}%</span>
                        </div>
                    </div>
                    <p className="status-text">All design phases completed</p>
                </div>

                <div className="progress-breakdown">
                    <div className="breakdown-item">
                        <span className="breakdown-label">Wireframes</span>
                        <div className="breakdown-bar">
                            <div className="breakdown-fill" style={{ width: `${designProgress.wireframes}%` }}></div>
                        </div>
                        <span className="breakdown-percent">{designProgress.wireframes}%</span>
                    </div>
                    <div className="breakdown-item">
                        <span className="breakdown-label">Mockups</span>
                        <div className="breakdown-bar">
                            <div className="breakdown-fill" style={{ width: `${designProgress.mockups}%` }}></div>
                        </div>
                        <span className="breakdown-percent">{designProgress.mockups}%</span>
                    </div>
                    <div className="breakdown-item">
                        <span className="breakdown-label">Prototypes</span>
                        <div className="breakdown-bar">
                            <div className="breakdown-fill" style={{ width: `${designProgress.prototypes}%` }}></div>
                        </div>
                        <span className="breakdown-percent">{designProgress.prototypes}%</span>
                    </div>
                </div>
            </div>

            {/* Wireframes Section */}
            <div className="deliverables-section">
                <h3>Wireframes</h3>
                <div className="deliverables-grid">
                    {wireframes.map(wireframe => (
                        <div key={wireframe.id} className="deliverable-card">
                            <div className="deliverable-preview wireframe-preview">
                                <span>Wireframe</span>
                            </div>
                            <div className="deliverable-info">
                                <h4>{wireframe.name}</h4>
                                <p className="deliverable-date">{new Date(wireframe.date).toLocaleDateString()}</p>
                                <span className="status-badge approved">
                                    <FaCheckCircle /> {wireframe.status}
                                </span>
                            </div>
                            <div className="deliverable-actions">
                                <button className="btn-icon" title="View">
                                    <FaEye />
                                </button>
                                <button className="btn-icon" title="Download">
                                    <FaDownload />
                                </button>
                                <button className="btn-icon" title="Comment">
                                    <FaComment />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mockups Section */}
            <div className="deliverables-section">
                <h3>Mockups</h3>
                <div className="deliverables-grid">
                    {mockups.map(mockup => (
                        <div key={mockup.id} className="deliverable-card">
                            <div className="deliverable-preview mockup-preview">
                                <span>Mockup</span>
                            </div>
                            <div className="deliverable-info">
                                <h4>{mockup.name}</h4>
                                <p className="deliverable-date">{new Date(mockup.date).toLocaleDateString()}</p>
                                <span className="status-badge approved">
                                    <FaCheckCircle /> {mockup.status}
                                </span>
                            </div>
                            <div className="deliverable-actions">
                                <button className="btn-icon" title="View">
                                    <FaEye />
                                </button>
                                <button className="btn-icon" title="Download">
                                    <FaDownload />
                                </button>
                                <button className="btn-icon" title="Comment">
                                    <FaComment />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Prototypes Section */}
            <div className="deliverables-section">
                <h3>Prototypes</h3>
                <div className="deliverables-grid">
                    {prototypes.map(prototype => (
                        <div key={prototype.id} className="deliverable-card">
                            <div className="deliverable-preview prototype-preview">
                                <span>{prototype.type}</span>
                            </div>
                            <div className="deliverable-info">
                                <h4>{prototype.name}</h4>
                                <p className="deliverable-date">{new Date(prototype.date).toLocaleDateString()}</p>
                                <span className="status-badge approved">
                                    <FaCheckCircle /> {prototype.status}
                                </span>
                            </div>
                            <div className="deliverable-actions">
                                <button className="btn-icon" title="View">
                                    <FaEye />
                                </button>
                                <button className="btn-icon" title="Open Link">
                                    <FaDownload />
                                </button>
                                <button className="btn-icon" title="Comment">
                                    <FaComment />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UIUXMonitoring;
