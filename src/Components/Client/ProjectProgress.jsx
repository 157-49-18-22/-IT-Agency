import React, { useState } from 'react';
import { FaCheckCircle, FaClock, FaExclamationTriangle, FaCalendar } from 'react-icons/fa';
import './ClientPortal.css';

const ProjectProgress = () => {
    const [timeline] = useState([
        {
            id: 1,
            stage: 'UI/UX Design',
            status: 'Completed',
            startDate: '2024-01-01',
            endDate: '2024-01-20',
            progress: 100,
            milestones: [
                { name: 'Wireframes Approved', date: '2024-01-08', completed: true },
                { name: 'Mockups Approved', date: '2024-01-15', completed: true },
                { name: 'Prototypes Delivered', date: '2024-01-20', completed: true }
            ]
        },
        {
            id: 2,
            stage: 'Development',
            status: 'In Progress',
            startDate: '2024-01-21',
            endDate: '2024-02-15',
            progress: 65,
            milestones: [
                { name: 'Frontend Setup', date: '2024-01-23', completed: true },
                { name: 'Backend APIs', date: '2024-02-01', completed: true },
                { name: 'Integration', date: '2024-02-10', completed: false },
                { name: 'Final Build', date: '2024-02-15', completed: false }
            ]
        },
        {
            id: 3,
            stage: 'Testing',
            status: 'Not Started',
            startDate: '2024-02-16',
            endDate: '2024-03-01',
            progress: 0,
            milestones: [
                { name: 'Test Cases', date: '2024-02-18', completed: false },
                { name: 'Bug Fixes', date: '2024-02-25', completed: false },
                { name: 'UAT', date: '2024-03-01', completed: false }
            ]
        }
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return '#28a745';
            case 'In Progress': return '#ffc107';
            case 'Not Started': return '#6c757d';
            default: return '#6c757d';
        }
    };

    return (
        <div className="project-progress-page">
            <div className="page-header">
                <h1>Project Progress</h1>
                <p>Detailed timeline and milestone tracking</p>
            </div>

            {/* Overall Progress */}
            <div className="overall-progress-card">
                <h3>Overall Project Progress</h3>
                <div className="progress-bar-large">
                    <div className="progress-fill" style={{ width: '65%' }}>
                        <span>65%</span>
                    </div>
                </div>
                <p className="progress-info">2 of 3 stages completed or in progress</p>
            </div>

            {/* Timeline */}
            <div className="timeline-container">
                <h3>Project Timeline</h3>
                <div className="timeline">
                    {timeline.map((stage, index) => (
                        <div key={stage.id} className="timeline-stage">
                            <div className="timeline-marker">
                                <div
                                    className="marker-circle"
                                    style={{ background: getStatusColor(stage.status) }}
                                >
                                    {stage.status === 'Completed' && <FaCheckCircle />}
                                    {stage.status === 'In Progress' && <FaClock />}
                                    {stage.status === 'Not Started' && <FaExclamationTriangle />}
                                </div>
                                {index < timeline.length - 1 && (
                                    <div className="marker-line"></div>
                                )}
                            </div>

                            <div className="timeline-content">
                                <div className="stage-header">
                                    <h4>{stage.stage}</h4>
                                    <span
                                        className="status-badge"
                                        style={{ background: getStatusColor(stage.status) }}
                                    >
                                        {stage.status}
                                    </span>
                                </div>

                                <div className="stage-dates">
                                    <FaCalendar />
                                    <span>
                                        {new Date(stage.startDate).toLocaleDateString()} - {new Date(stage.endDate).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="stage-progress">
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${stage.progress}%`,
                                                background: getStatusColor(stage.status)
                                            }}
                                        ></div>
                                    </div>
                                    <span className="progress-text">{stage.progress}%</span>
                                </div>

                                <div className="milestones">
                                    <h5>Milestones:</h5>
                                    <ul>
                                        {stage.milestones.map((milestone, idx) => (
                                            <li key={idx} className={milestone.completed ? 'completed' : ''}>
                                                {milestone.completed ? <FaCheckCircle /> : <FaClock />}
                                                <span>{milestone.name}</span>
                                                <span className="milestone-date">
                                                    {new Date(milestone.date).toLocaleDateString()}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Team Activity */}
            <div className="team-activity">
                <h3>Recent Team Activity</h3>
                <div className="activity-timeline">
                    <div className="activity-item">
                        <div className="activity-time">2 hours ago</div>
                        <div className="activity-content">
                            <FaCheckCircle className="activity-icon success" />
                            <p><strong>John Doe</strong> completed Sprint 2 development</p>
                        </div>
                    </div>
                    <div className="activity-item">
                        <div className="activity-time">5 hours ago</div>
                        <div className="activity-content">
                            <FaClock className="activity-icon warning" />
                            <p><strong>Jane Smith</strong> uploaded new mockups for review</p>
                        </div>
                    </div>
                    <div className="activity-item">
                        <div className="activity-time">1 day ago</div>
                        <div className="activity-content">
                            <FaCheckCircle className="activity-icon success" />
                            <p><strong>Admin</strong> approved wireframe designs</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectProgress;
