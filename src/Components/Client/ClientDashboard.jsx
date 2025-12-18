import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaClock, FaExclamationTriangle, FaDownload, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './ClientPortal.css';

const ClientDashboard = () => {
    const [projectData, setProjectData] = useState({
        projectName: 'IT Agency Website',
        currentStage: 'Development',
        overallProgress: 65,
        stages: {
            uiux: { progress: 100, status: 'Completed' },
            development: { progress: 65, status: 'In Progress' },
            testing: { progress: 0, status: 'Not Started' }
        },
        nextMilestone: {
            name: 'Development Phase Completion',
            date: '2024-01-15',
            daysRemaining: 12
        }
    });

    const [recentActivity, setRecentActivity] = useState([
        { id: 1, type: 'deliverable', message: 'New wireframes uploaded', time: '2 hours ago', icon: FaCheckCircle },
        { id: 2, type: 'update', message: 'Development sprint 2 completed', time: '5 hours ago', icon: FaClock },
        { id: 3, type: 'approval', message: 'Mockup approval pending', time: '1 day ago', icon: FaExclamationTriangle }
    ]);

    const [quickStats, setQuickStats] = useState({
        totalDeliverables: 24,
        pendingApprovals: 3,
        completedMilestones: 8,
        totalMilestones: 12
    });

    return (
        <div className="client-dashboard">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Welcome Back!</h1>
                    <p>Here's what's happening with your project</p>
                </div>
            </div>

            {/* Project Overview Card */}
            <div className="project-overview-card">
                <div className="overview-header">
                    <div>
                        <h2>{projectData.projectName}</h2>
                        <p className="current-stage">
                            Current Stage: <span className="stage-badge">{projectData.currentStage}</span>
                        </p>
                    </div>
                    <div className="overall-progress-circle">
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="10" />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="#667eea"
                                strokeWidth="10"
                                strokeDasharray={`${projectData.overallProgress * 2.83} 283`}
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className="progress-text">
                            <span className="progress-number">{projectData.overallProgress}%</span>
                            <span className="progress-label">Complete</span>
                        </div>
                    </div>
                </div>

                {/* Stage Progress Bars */}
                <div className="stages-progress">
                    <div className="stage-item">
                        <div className="stage-header">
                            <span className="stage-name">UI/UX Design</span>
                            <span className="stage-status completed">{projectData.stages.uiux.status}</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill completed"
                                style={{ width: `${projectData.stages.uiux.progress}%` }}
                            ></div>
                        </div>
                        <span className="progress-percent">{projectData.stages.uiux.progress}%</span>
                    </div>

                    <div className="stage-item">
                        <div className="stage-header">
                            <span className="stage-name">Development</span>
                            <span className="stage-status in-progress">{projectData.stages.development.status}</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill in-progress"
                                style={{ width: `${projectData.stages.development.progress}%` }}
                            ></div>
                        </div>
                        <span className="progress-percent">{projectData.stages.development.progress}%</span>
                    </div>

                    <div className="stage-item">
                        <div className="stage-header">
                            <span className="stage-name">Testing</span>
                            <span className="stage-status not-started">{projectData.stages.testing.status}</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill not-started"
                                style={{ width: `${projectData.stages.testing.progress}%` }}
                            ></div>
                        </div>
                        <span className="progress-percent">{projectData.stages.testing.progress}%</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                        <FaCheckCircle size={24} />
                    </div>
                    <div className="stat-details">
                        <h3>{quickStats.totalDeliverables}</h3>
                        <p>Total Deliverables</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
                        <FaExclamationTriangle size={24} />
                    </div>
                    <div className="stat-details">
                        <h3>{quickStats.pendingApprovals}</h3>
                        <p>Pending Approvals</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>
                        <FaClock size={24} />
                    </div>
                    <div className="stat-details">
                        <h3>{quickStats.completedMilestones}/{quickStats.totalMilestones}</h3>
                        <p>Milestones</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)' }}>
                        <FaClock size={24} />
                    </div>
                    <div className="stat-details">
                        <h3>{projectData.nextMilestone.daysRemaining} days</h3>
                        <p>Until Next Milestone</p>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="dashboard-columns">
                {/* Recent Activity */}
                <div className="activity-card">
                    <h3>Recent Activity</h3>
                    <div className="activity-list">
                        {recentActivity.map(activity => (
                            <div key={activity.id} className="activity-item">
                                <div className={`activity-icon ${activity.type}`}>
                                    <activity.icon />
                                </div>
                                <div className="activity-content">
                                    <p>{activity.message}</p>
                                    <span className="activity-time">{activity.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link to="/client/progress" className="view-all-link">
                        View All Activity →
                    </Link>
                </div>

                {/* Next Milestone */}
                <div className="milestone-card">
                    <h3>Next Milestone</h3>
                    <div className="milestone-content">
                        <div className="milestone-icon">
                            <FaClock size={48} />
                        </div>
                        <h4>{projectData.nextMilestone.name}</h4>
                        <p className="milestone-date">
                            Due: {new Date(projectData.nextMilestone.date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </p>
                        <div className="days-remaining">
                            <span className="days-number">{projectData.nextMilestone.daysRemaining}</span>
                            <span className="days-label">days remaining</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                    <Link to="/client/deliverables" className="action-card">
                        <FaDownload size={32} />
                        <h4>View Deliverables</h4>
                        <p>Download project files</p>
                    </Link>

                    <Link to="/client/feedback" className="action-card">
                        <FaCheckCircle size={32} />
                        <h4>Approve Work</h4>
                        <p>Review pending approvals</p>
                    </Link>

                    <Link to="/client/messages" className="action-card">
                        <FaExclamationTriangle size={32} />
                        <h4>Contact Team</h4>
                        <p>Send a message</p>
                    </Link>

                    <Link to="/client/progress" className="action-card">
                        <FaEye size={32} />
                        <h4>View Progress</h4>
                        <p>Detailed timeline</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
