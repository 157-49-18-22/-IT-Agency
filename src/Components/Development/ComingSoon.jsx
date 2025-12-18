import React from 'react';
import { FaTools, FaRocket } from 'react-icons/fa';
import './TaskPages.css';

const ComingSoon = ({ title, description, icon: Icon = FaTools, features = [] }) => {
    return (
        <div className="task-page-container">
            <div className="page-header">
                <div className="header-content">
                    <h1>{title}</h1>
                    <p>{description}</p>
                </div>
            </div>

            <div className="coming-soon-content">
                <div className="coming-soon-card">
                    <Icon size={80} className="coming-soon-icon" />
                    <h2>Coming Soon!</h2>
                    <p>This feature is currently under development</p>

                    {features.length > 0 && (
                        <div className="planned-features">
                            <h3>Planned Features:</h3>
                            <ul>
                                {features.map((feature, index) => (
                                    <li key={index}>
                                        <FaRocket /> {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="progress-indicator">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: '40%' }}></div>
                        </div>
                        <span>Development in progress...</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComingSoon;
