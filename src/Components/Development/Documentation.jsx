import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentationAPI } from '../../services/api';
import {
    FiBook, FiPlus, FiFileText, FiCheckCircle,
    FiEdit3, FiEye, FiUser, FiCalendar,
    FiLayers, FiBarChart2, FiEdit, FiTrash2, FiClock
} from 'react-icons/fi';
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
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

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
            if (isEditing) {
                const response = await documentationAPI.update(selectedDoc.id, newDoc);
                if (response.data && response.data.success) {
                    setShowNewDoc(false);
                    setIsEditing(false);
                    setSelectedDoc(null);
                    setNewDoc({ title: '', category: 'General', description: '', content: '' });
                    fetchDocs();
                }
            } else {
                const response = await documentationAPI.create({
                    ...newDoc,
                    author: currentUser?.name || 'Current User'
                });

                if (response.data && response.data.success) {
                    setShowNewDoc(false);
                    setNewDoc({ title: '', category: 'General', description: '', content: '' });
                    fetchDocs();
                }
            }
        } catch (error) {
            console.error('Failed to save document:', error);
            alert('Failed to save document');
        }
    };

    const handleView = async (doc) => {
        setSelectedDoc(doc);
        setShowViewModal(true);
        try {
            await documentationAPI.incrementViews(doc.id);
            // Optional: update local state to show incremented view
            setDocs(docs.map(d => d.id === doc.id ? { ...d, views: d.views + 1 } : d));
        } catch (error) {
            console.error('Failed to increment views:', error);
        }
    };

    const handleEdit = (doc) => {
        setSelectedDoc(doc);
        setNewDoc({
            title: doc.title,
            category: doc.category,
            description: doc.description,
            content: doc.content
        });
        setIsEditing(true);
        setShowNewDoc(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                const response = await documentationAPI.delete(id);
                if (response.data && response.data.success) {
                    fetchDocs();
                }
            } catch (error) {
                console.error('Failed to delete document:', error);
            }
        }
    };

    const getStatusBadge = (status) => {
        return status === 'published'
            ? <span className="status-badge published"><span className="icon"><FiCheckCircle /></span> Published</span>
            : <span className="status-badge draft"><span className="icon"><FiEdit3 /></span> Draft</span>;
    };

    return (
        <div className="documentation-container">
            <div className="documentation-header">
                <div className="header-content">
                    <h1>
                        <span className="icon"><FiBook /></span>
                        Documentation
                    </h1>
                    <p className="subtitle">Centralized knowledge base for the team</p>
                </div>
                <button className="btn-primary" onClick={() => setShowNewDoc(true)}>
                    <span className="icon"><FiPlus /></span>
                    New Document
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon"><FiFileText /></div>
                    <div className="stat-content">
                        <h3>{docs.length}</h3>
                        <p>Total Documents</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FiCheckCircle /></div>
                    <div className="stat-content">
                        <h3>{docs.filter(d => d.status === 'published').length}</h3>
                        <p>Published</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FiEdit3 /></div>
                    <div className="stat-content">
                        <h3>{docs.filter(d => d.status === 'draft').length}</h3>
                        <p>Drafts</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FiEye /></div>
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
                                    <span className="icon"><FiUser /></span>
                                    {doc.author}
                                </span>
                                <span className="meta-item">
                                    <span className="icon"><FiCalendar /></span>
                                    {doc.lastUpdated}
                                </span>
                            </div>
                            <div className="doc-stats">
                                <span>
                                    <span className="icon"><FiLayers /></span>
                                    {doc.sections} sections
                                </span>
                                <span>
                                    <span className="icon"><FiBarChart2 /></span>
                                    {doc.views} views
                                </span>
                            </div>
                            <div className="doc-actions">
                                <button className="btn-secondary" onClick={() => handleView(doc)}>
                                    <span className="icon"><FiEye /></span>
                                    View
                                </button>
                                <button className="btn-secondary" onClick={() => handleEdit(doc)}>
                                    <span className="icon"><FiEdit /></span>
                                    Edit
                                </button>
                                <button className="btn-danger-outline" onClick={() => handleDelete(doc.id)}>
                                    <span className="icon"><FiTrash2 /></span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showNewDoc && (
                <div className="modal-overlay" onClick={() => {
                    setShowNewDoc(false);
                    setIsEditing(false);
                    setSelectedDoc(null);
                    setNewDoc({ title: '', category: 'General', description: '', content: '' });
                }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isEditing ? 'Edit Document' : 'Create New Document'}</h2>
                            <button className="modal-close" onClick={() => {
                                setShowNewDoc(false);
                                setIsEditing(false);
                                setSelectedDoc(null);
                                setNewDoc({ title: '', category: 'General', description: '', content: '' });
                            }}>✕</button>
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
                                <button type="button" className="btn-secondary" onClick={() => {
                                    setShowNewDoc(false);
                                    setIsEditing(false);
                                    setSelectedDoc(null);
                                    setNewDoc({ title: '', category: 'General', description: '', content: '' });
                                }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    {isEditing ? 'Update Document' : 'Create Document'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showViewModal && selectedDoc && (
                <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
                    <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <span className="category-tag">{selectedDoc.category}</span>
                                <h2>{selectedDoc.title}</h2>
                            </div>
                            <button className="modal-close" onClick={() => setShowViewModal(false)}>✕</button>
                        </div>
                        <div className="view-content">
                            <div className="doc-meta">
                                <span className="meta-item">
                                    <span className="icon"><FiUser /></span>
                                    <strong>Author:</strong> {selectedDoc.author}
                                </span>
                                <span className="meta-item">
                                    <span className="icon"><FiClock /></span>
                                    <strong>Last Updated:</strong> {selectedDoc.lastUpdated}
                                </span>
                            </div>
                            <div className="description-box">
                                <strong>Description:</strong>
                                <p>{selectedDoc.description}</p>
                            </div>
                            <div className="content-box">
                                <strong>Content:</strong>
                                <div className="formatted-content">
                                    {selectedDoc.content.split('\n').map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-primary" onClick={() => setShowViewModal(false)}>
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documentation;
