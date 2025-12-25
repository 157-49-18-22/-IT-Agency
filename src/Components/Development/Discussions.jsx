import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Discussions.css';

const Discussions = () => {
    const { currentUser } = useAuth();
    const [discussions, setDiscussions] = useState([
        {
            id: 1,
            title: 'Best practices for React state management',
            author: 'John Doe',
            category: 'React',
            replies: 12,
            views: 145,
            lastActivity: '2 hours ago',
            tags: ['React', 'State Management', 'Redux'],
            excerpt: 'What are your thoughts on using Context API vs Redux for medium-sized applications?'
        },
        {
            id: 2,
            title: 'Database indexing strategies',
            author: 'Sarah Williams',
            category: 'Database',
            replies: 8,
            views: 89,
            lastActivity: '5 hours ago',
            tags: ['Database', 'Performance', 'PostgreSQL'],
            excerpt: 'Looking for advice on optimizing database queries with proper indexing...'
        },
        {
            id: 3,
            title: 'API versioning approaches',
            author: 'Mike Johnson',
            category: 'Backend',
            replies: 15,
            views: 203,
            lastActivity: '1 day ago',
            tags: ['API', 'Versioning', 'Best Practices'],
            excerpt: 'How do you handle API versioning in production applications?'
        }
    ]);

    const [showNewDiscussion, setShowNewDiscussion] = useState(false);
    const [newDiscussion, setNewDiscussion] = useState({
        title: '',
        category: 'General',
        content: '',
        tags: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const discussion = {
            id: discussions.length + 1,
            title: newDiscussion.title,
            author: currentUser?.name || 'You',
            category: newDiscussion.category,
            replies: 0,
            views: 0,
            lastActivity: 'Just now',
            tags: newDiscussion.tags.split(',').map(t => t.trim()),
            excerpt: newDiscussion.content.substring(0, 100) + '...'
        };
        setDiscussions([discussion, ...discussions]);
        setShowNewDiscussion(false);
        setNewDiscussion({ title: '', category: 'General', content: '', tags: '' });
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
