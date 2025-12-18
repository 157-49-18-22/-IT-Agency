import React from 'react';
import { FaCode, FaCheckCircle, FaClock, FaExternalLinkAlt } from 'react-icons/fa';
import './ClientPortal.css';

const DevelopmentMonitoring = () => {
    const devProgress = 65;
    const features = [
        { id: 1, name: 'User Authentication', status: 'Completed', progress: 100 },
        { id: 2, name: 'Dashboard', status: 'Completed', progress: 100 },
        { id: 3, name: 'Project Management', status: 'In Progress', progress: 75 },
        { id: 4, name: 'Team Collaboration', status: 'In Progress', progress: 50 },
        { id: 5, name: 'Reporting Module', status: 'Not Started', progress: 0 }
    ];

    const sprints = [
        { id: 1, name: 'Sprint 1', status: 'Completed', startDate: '2024-01-21', endDate: '2024-02-03' },
        { id: 2, name: 'Sprint 2', status: 'Completed', startDate: '2024-02-04', endDate: '2024-02-17' },
        { id: 3, name: 'Sprint 3', status: 'In Progress', startDate: '2024-02-18', endDate: '2024-03-02' }
    ];

    return (
        <div className="stage-monitoring-page">
            <div className="page-header">
                <h1>Development Monitoring</h1>
                <p>Track development progress and features</p>
            </div>

            <div className="progress-overview">
                <div className="progress-card">
                    <h3>Development Progress</h3>
                    <div className="circular-progress">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="10" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#ffc107" strokeWidth="10"
                                strokeDasharray={`${devProgress * 2.83} 283`} transform="rotate(-90 50 50)" />
                        </svg>
                        <div className="progress-text"><span>{devProgress}%</span></div>
                    </div>
                </div>

                <div className="demo-access-card">
                    <h3>Demo Environment</h3>
                    <p>Access the development build</p>
                    <a href="https://demo.example.com" target="_blank" rel="noopener noreferrer" className="btn-primary">
                        <FaExternalLinkAlt /> Open Demo
                    </a>
                    <div className="demo-credentials">
                        <p><strong>Username:</strong> demo@client.com</p>
                        <p><strong>Password:</strong> ********</p>
                    </div>
                </div>
            </div>

            <div className="features-section">
                <h3>Features Development</h3>
                <div className="features-list">
                    {features.map(feature => (
                        <div key={feature.id} className="feature-item">
                            <div className="feature-header">
                                <h4>{feature.name}</h4>
                                <span className={`status-badge ${feature.status.toLowerCase().replace(' ', '-')}`}>
                                    {feature.status}
                                </span>
                            </div>
                            <div className="feature-progress">
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${feature.progress}%` }}></div>
                                </div>
                                <span>{feature.progress}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="sprints-section">
                <h3>Sprint Reports</h3>
                <div className="sprints-grid">
                    {sprints.map(sprint => (
                        <div key={sprint.id} className="sprint-card">
                            <h4>{sprint.name}</h4>
                            <p>{new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}</p>
                            <span className={`status-badge ${sprint.status.toLowerCase().replace(' ', '-')}`}>
                                {sprint.status === 'Completed' ? <FaCheckCircle /> : <FaClock />}
                                {sprint.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DevelopmentMonitoring;
