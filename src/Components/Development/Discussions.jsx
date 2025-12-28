import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { discussionsAPI } from '../../services/api';
import './Discussions.css';

const Discussions = () => {
    const { currentUser } = useAuth();
    const [discussions, setDiscussions] = useState([]);
    const [showNewDiscussion, setShowNewDiscussion] = useState(false);
    const [newDiscussion, setNewDiscussion] = useState({
        title: '',
        category: 'General',
        content: '',
        tags: ''
    });

    const fetchDiscussions = async () => {
        try {
            const response = await discussionsAPI.getAll();
            if (response.data && response.data.success) {
                setDiscussions(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch discussions:', error);
        }
    };

    useEffect(() => {
        fetchDiscussions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await discussionsAPI.create({
                ...newDiscussion,
                tags: newDiscussion.tags.split(',').map(t => t.trim()),
                author: currentUser?.name || 'Current User'
            });

            if (response.data && response.data.success) {
                setShowNewDiscussion(false);
                setNewDiscussion({ title: '', category: 'General', content: '', tags: '' });
                fetchDiscussions(); // Refresh list to get the new discussion with server-generated metadata
            }
        } catch (error) {
            console.error('Failed to create discussion:', error);
            alert('Failed to post discussion');
        }
    };

    return (
        <div className="discussions-container">
            <div className="discussions-header">
                <div className="header-content">
                    <h1>
                        <span className="icon">💬</span>
                        Team Discussions
                    </h1>
                    <p className="subtitle">Share knowledge and collaborate with your team</p>
                </div>
                <button className="btn-primary" onClick={() => setShowNewDiscussion(true)}>
                    <span className="icon">➕</span>
                    New Discussion
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">💬</div>
                    <div className="stat-content">
                        <h3>{discussions.length}</h3>
                        <p>Total Discussions</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💭</div>
                    <div className="stat-content">
                        <h3>{discussions.reduce((sum, d) => sum + d.replies, 0)}</h3>
                        <p>Total Replies</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👁️</div>
                    <div className="stat-content">
                        <h3>{discussions.reduce((sum, d) => sum + d.views, 0)}</h3>
                        <p>Total Views</p>
                    </div>
                </div>
            </div>

            <div className="discussions-list">
                {discussions.map(discussion => (
                    <div key={discussion.id} className="discussion-card">
                        <div className="discussion-header">
                            <h3>{discussion.title}</h3>
                            <span className="category-badge">{discussion.category}</span>
                        </div>
                        <p className="excerpt">{discussion.excerpt}</p>
                        <div className="tags">
                            {discussion.tags.map((tag, idx) => (
                                <span key={idx} className="tag">{tag}</span>
                            ))}
                        </div>
                        <div className="discussion-footer">
                            <span className="author">
                                <span className="icon">👤</span>
                                {discussion.author}
                            </span>
                            <span className="stat">
                                <span className="icon">💬</span>
                                {discussion.replies} replies
                            </span>
                            <span className="stat">
                                <span className="icon">👁️</span>
                                {discussion.views} views
                            </span>
                            <span className="last-activity">{discussion.lastActivity}</span>
                        </div>
                    </div>
                ))}
            </div>

            {showNewDiscussion && (
                <div className="modal-overlay" onClick={() => setShowNewDiscussion(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Start a Discussion</h2>
                            <button className="modal-close" onClick={() => setShowNewDiscussion(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={newDiscussion.title}
                                    onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                                    placeholder="What's your question or topic?"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    value={newDiscussion.category}
                                    onChange={(e) => setNewDiscussion({ ...newDiscussion, category: e.target.value })}
                                >
                                    <option>General</option>
                                    <option>React</option>
                                    <option>Backend</option>
                                    <option>Database</option>
                                    <option>DevOps</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Content *</label>
                                <textarea
                                    value={newDiscussion.content}
                                    onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                                    placeholder="Describe your question or topic in detail..."
                                    rows="6"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    value={newDiscussion.tags}
                                    onChange={(e) => setNewDiscussion({ ...newDiscussion, tags: e.target.value })}
                                    placeholder="e.g., React, Performance, Best Practices"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowNewDiscussion(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Post Discussion
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Discussions;
