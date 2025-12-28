import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentationAPI } from '../../services/api';
import './Documentation.css';

const Documentation = () => {
    const { currentUser } = useAuth();
    const [docs, setDocs] = useState([]);
    const [showNewDoc, setShowNewDoc] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [newDoc, setNewDoc] = useState({
        title: '',
        category: 'General',
        description: '',
        content: ''
    });

    const fetchDocs = async () => {
        try {
            const response = await documentationAPI.getAll();
            if (response.data && response.data.success) {
                setDocs(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch documentation:', error);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, []);

    const categories = ['all', 'Frontend', 'Backend', 'Database', 'DevOps', 'General'];

    const filteredDocs = selectedCategory === 'all'
        ? docs
        : docs.filter(doc => doc.category === selectedCategory);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await documentationAPI.create({
                ...newDoc,
                author: currentUser?.name || 'Current User'
            });

            if (response.data && response.data.success) {
                setShowNewDoc(false);
                setNewDoc({ title: '', category: 'General', description: '', content: '' });
                fetchDocs(); // Refresh list to get the new document
            }
        } catch (error) {
            console.error('Failed to create document:', error);
            alert('Failed to creating document');
        }
    };

    const getStatusBadge = (status) => {
        return status === 'published'
            ? <span className="status-badge published"><span className="icon">✅</span> Published</span>
            : <span className="status-badge draft"><span className="icon">📝</span> Draft</span>;
    };

    return (
        <div className="documentation-container">
            <div className="documentation-header">
                <div className="header-content">
                    <h1>
                        <span className="icon">📚</span>
                        Documentation
                    </h1>
                    <p className="subtitle">Centralized knowledge base for the team</p>
                </div>
                <button className="btn-primary" onClick={() => setShowNewDoc(true)}>
                    <span className="icon">➕</span>
                    New Document
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📄</div>
                    <div className="stat-content">
                        <h3>{docs.length}</h3>
                        <p>Total Documents</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{docs.filter(d => d.status === 'published').length}</h3>
                        <p>Published</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-content">
                        <h3>{docs.filter(d => d.status === 'draft').length}</h3>
                        <p>Drafts</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">👁️</div>
                    <div className="stat-content">
                        <h3>{docs.reduce((sum, d) => sum + d.views, 0)}</h3>
                        <p>Total Views</p>
                    </div>
                </div>
            </div>

            <div className="category-filter">
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                ))}
            </div>

            <div className="docs-grid">
                {filteredDocs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📚</div>
                        <h3>No documents found</h3>
                        <p>Start by creating your first document</p>
                        <button className="btn-primary" onClick={() => setShowNewDoc(true)}>
                            Create Document
                        </button>
                    </div>
                ) : (
                    filteredDocs.map(doc => (
                        <div key={doc.id} className="doc-card">
                            <div className="doc-header">
                                <span className="category-tag">{doc.category}</span>
                                {getStatusBadge(doc.status)}
                            </div>
                            <h3>{doc.title}</h3>
                            <p className="description">{doc.description}</p>
                            <div className="doc-meta">
                                <span className="meta-item">
                                    <span className="icon">👤</span>
                                    {doc.author}
                                </span>
                                <span className="meta-item">
                                    <span className="icon">📅</span>
                                    {doc.lastUpdated}
                                </span>
                            </div>
                            <div className="doc-stats">
                                <span>
                                    <span className="icon">📑</span>
                                    {doc.sections} sections
                                </span>
                                <span>
                                    <span className="icon">👁️</span>
                                    {doc.views} views
                                </span>
                            </div>
                            <div className="doc-actions">
                                <button className="btn-secondary">
                                    <span className="icon">👁️</span>
                                    View
                                </button>
                                <button className="btn-secondary">
                                    <span className="icon">✏️</span>
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showNewDoc && (
                <div className="modal-overlay" onClick={() => setShowNewDoc(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Document</h2>
                            <button className="modal-close" onClick={() => setShowNewDoc(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    value={newDoc.title}
                                    onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                                    placeholder="e.g., API Documentation"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    value={newDoc.category}
                                    onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                                >
                                    <option>General</option>
                                    <option>Frontend</option>
                                    <option>Backend</option>
                                    <option>Database</option>
                                    <option>DevOps</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description *</label>
                                <textarea
                                    value={newDoc.description}
                                    onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                                    placeholder="Brief description of the document..."
                                    rows="3"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Content *</label>
                                <textarea
                                    value={newDoc.content}
                                    onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                                    placeholder="Write your documentation here..."
                                    rows="8"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowNewDoc(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create Document
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documentation;
