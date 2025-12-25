import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './DailyStandup.css';

const DailyStandup = () => {
    const { currentUser } = useAuth();
    const [standups, setStandups] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [newStandup, setNewStandup] = useState({
        yesterday: '',
        today: '',
        blockers: ''
    });

    // Mock data
    const mockStandups = [
        {
            id: 1,
            date: '2024-12-24',
            developer: currentUser?.name || 'You',
            yesterday: 'Completed authentication module, Fixed login bugs, Updated API documentation',
            today: 'Work on payment integration, Review pull requests, Team meeting at 3 PM',
            blockers: 'None',
            status: 'submitted',
            timestamp: '09:30 AM'
        },
        {
            id: 2,
            date: '2024-12-24',
            developer: 'John Doe',
            yesterday: 'Implemented user dashboard, Fixed responsive issues, Code review sessions',
            today: 'Database optimization, Performance testing, Bug fixes',
            blockers: 'Waiting for design approval on new feature',
            status: 'submitted',
            timestamp: '09:15 AM'
        },
        {
            id: 3,
            date: '2024-12-24',
            developer: 'Sarah Williams',
            yesterday: 'API endpoint development, Unit testing, Documentation updates',
            today: 'Email notification system, Integration testing, Sprint planning',
            blockers: 'Need access to production database',
            status: 'submitted',
            timestamp: '09:00 AM'
        },
        {
            id: 4,
            date: '2024-12-23',
            developer: currentUser?.name || 'You',
            yesterday: 'Sprint planning, Code refactoring, Team collaboration',
            today: 'Authentication module, API integration, Code reviews',
            blockers: 'None',
            status: 'submitted',
            timestamp: '09:30 AM'
        }
    ];

    useEffect(() => {
        setStandups(mockStandups);
    }, []);

    const handleSubmitStandup = (e) => {
        e.preventDefault();
        const standup = {
            id: standups.length + 1,
            date: selectedDate,
            developer: currentUser?.name || 'You',
            yesterday: newStandup.yesterday,
            today: newStandup.today,
            blockers: newStandup.blockers || 'None',
            status: 'submitted',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };

        setStandups([standup, ...standups]);
        setShowAddModal(false);
        setNewStandup({ yesterday: '', today: '', blockers: '' });
    };

    const filteredStandups = standups.filter(s => s.date === selectedDate);
    const todayStandups = standups.filter(s => s.date === new Date().toISOString().split('T')[0]);

    return (
        <div className="daily-standup-container">
            <div className="standup-header">
                <div className="header-content">
                    <h1>
                        <span className="icon">📋</span>
                        Daily Standup
                    </h1>
                    <p className="subtitle">Share your daily progress and blockers with the team</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => setShowAddModal(true)}
                >
                    <span className="icon">➕</span>
                    Add Standup
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card today">
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                        <h3>{todayStandups.length}</h3>
                        <p>Today's Updates</p>
                    </div>
                </div>
                <div className="stat-card team">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>{new Set(standups.map(s => s.developer)).size}</h3>
                        <p>Team Members</p>
                    </div>
                </div>
                <div className="stat-card blockers">
                    <div className="stat-icon">🚧</div>
                    <div className="stat-content">
                        <h3>{standups.filter(s => s.blockers !== 'None').length}</h3>
                        <p>Active Blockers</p>
                    </div>
                </div>
                <div className="stat-card streak">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-content">
                        <h3>7</h3>
                        <p>Day Streak</p>
                    </div>
                </div>
            </div>

            {/* Date Filter */}
            <div className="date-filter">
                <label>
                    <span className="icon">📅</span>
                    Select Date:
                </label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                />
                <span className="showing-count">
                    Showing {filteredStandups.length} update{filteredStandups.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Standups List */}
            <div className="standups-list">
                {filteredStandups.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📝</div>
                        <h3>No standups for this date</h3>
                        <p>Be the first to submit your daily standup!</p>
                        <button
                            className="btn-primary"
                            onClick={() => setShowAddModal(true)}
                        >
                            Add Standup
                        </button>
                    </div>
                ) : (
                    filteredStandups.map(standup => (
                        <div key={standup.id} className="standup-card">
                            <div className="standup-header-info">
                                <div className="developer-info">
                                    <div className="avatar">
                                        {standup.developer.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3>{standup.developer}</h3>
                                        <p className="timestamp">
                                            <span className="icon">🕐</span>
                                            {standup.timestamp}
                                        </p>
                                    </div>
                                </div>
                                <span className="status-badge submitted">
                                    <span className="icon">✅</span>
                                    Submitted
                                </span>
                            </div>

                            <div className="standup-content">
                                <div className="standup-section yesterday">
                                    <h4>
                                        <span className="icon">✅</span>
                                        What I did yesterday
                                    </h4>
                                    <ul>
                                        {standup.yesterday.split(',').map((item, idx) => (
                                            <li key={idx}>{item.trim()}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="standup-section today">
                                    <h4>
                                        <span className="icon">🎯</span>
                                        What I'll do today
                                    </h4>
                                    <ul>
                                        {standup.today.split(',').map((item, idx) => (
                                            <li key={idx}>{item.trim()}</li>
                                        ))}
                                    </ul>
                                </div>

                                {standup.blockers !== 'None' && (
                                    <div className="standup-section blockers">
                                        <h4>
                                            <span className="icon">🚧</span>
                                            Blockers
                                        </h4>
                                        <p className="blocker-text">{standup.blockers}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Standup Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Daily Standup Update</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowAddModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmitStandup}>
                            <div className="form-group">
                                <label>
                                    <span className="icon">✅</span>
                                    What did you do yesterday? *
                                </label>
                                <textarea
                                    value={newStandup.yesterday}
                                    onChange={(e) => setNewStandup({ ...newStandup, yesterday: e.target.value })}
                                    placeholder="List your accomplishments from yesterday (separate with commas)"
                                    rows="4"
                                    required
                                />
                                <small>Example: Completed feature X, Fixed bug Y, Reviewed PR Z</small>
                            </div>

                            <div className="form-group">
                                <label>
                                    <span className="icon">🎯</span>
                                    What will you do today? *
                                </label>
                                <textarea
                                    value={newStandup.today}
                                    onChange={(e) => setNewStandup({ ...newStandup, today: e.target.value })}
                                    placeholder="List your planned tasks for today (separate with commas)"
                                    rows="4"
                                    required
                                />
                                <small>Example: Work on feature A, Attend meeting B, Review code C</small>
                            </div>

                            <div className="form-group">
                                <label>
                                    <span className="icon">🚧</span>
                                    Any blockers?
                                </label>
                                <textarea
                                    value={newStandup.blockers}
                                    onChange={(e) => setNewStandup({ ...newStandup, blockers: e.target.value })}
                                    placeholder="Describe any blockers or issues (leave empty if none)"
                                    rows="3"
                                />
                                <small>Mention anything preventing you from making progress</small>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Submit Standup
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyStandup;
