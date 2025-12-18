import React, { useState } from 'react';
import { FaCheckSquare, FaSquare, FaSave } from 'react-icons/fa';
import './TaskPages.css';
import './TaskPagesExtended.css';

const SubmissionChecklist = () => {
    const [checklist, setChecklist] = useState([
        { id: 1, text: 'Code written and properly commented', completed: false },
        { id: 2, text: 'Unit tests created and passing', completed: false },
        { id: 3, text: 'Code reviewed by peer', completed: false },
        { id: 4, text: 'Feature tested locally', completed: false },
        { id: 5, text: 'Documentation updated', completed: false },
        { id: 6, text: 'Pull request created', completed: false },
        { id: 7, text: 'No critical bugs present', completed: false },
        { id: 8, text: 'Code follows coding standards', completed: false },
        { id: 9, text: 'Database migrations tested', completed: false },
        { id: 10, text: 'API endpoints documented', completed: false }
    ]);

    const toggleItem = (id) => {
        setChecklist(checklist.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    const completedCount = checklist.filter(item => item.completed).length;
    const progress = (completedCount / checklist.length) * 100;

    return (
        <div className="task-page-container">
            <div className="page-header">
                <div className="header-content">
                    <h1>Submission Checklist</h1>
                    <p>Complete all items before submitting your work</p>
                </div>
                <div className="header-stats">
                    <div className="stat-badge">
                        <span className="stat-number">{completedCount}/{checklist.length}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                </div>
            </div>

            <div className="checklist-container">
                <div className="progress-section">
                    <h3>Overall Progress</h3>
                    <div className="progress-bar-large">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="progress-text">{Math.round(progress)}% Complete</span>
                </div>

                <div className="checklist-items">
                    {checklist.map((item) => (
                        <div
                            key={item.id}
                            className={`checklist-item ${item.completed ? 'completed' : ''}`}
                            onClick={() => toggleItem(item.id)}
                        >
                            <div className="checkbox">
                                {item.completed ? <FaCheckSquare /> : <FaSquare />}
                            </div>
                            <span className="item-text">{item.text}</span>
                        </div>
                    ))}
                </div>

                <div className="checklist-actions">
                    <button className="action-btn primary" disabled={progress < 100}>
                        <FaSave /> Submit for Review
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubmissionChecklist;
