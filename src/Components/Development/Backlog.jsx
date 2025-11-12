import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiArrowRight, FiFilter, FiSearch } from 'react-icons/fi';
import './Backlog.css';
import { taskAPI, sprintAPI } from '../../services/api';

export default function Backlog() {
  const [backlogItems, setBacklogItems] = useState([
    { id: 1, title: 'User Authentication System', description: 'Implement JWT-based auth', priority: 'High', storyPoints: 8, status: 'Ready', project: 'E-commerce Platform' },
    { id: 2, title: 'Product Search Feature', description: 'Add search with filters', priority: 'Medium', storyPoints: 5, status: 'Ready', project: 'E-commerce Platform' },
    { id: 3, title: 'Payment Gateway Integration', description: 'Stripe integration', priority: 'High', storyPoints: 13, status: 'In Progress', project: 'E-commerce Platform' },
    { id: 4, title: 'Email Notifications', description: 'Order confirmation emails', priority: 'Low', storyPoints: 3, status: 'Ready', project: 'E-commerce Platform' },
    { id: 5, title: 'Admin Dashboard', description: 'Analytics and reports', priority: 'Medium', storyPoints: 8, status: 'Backlog', project: 'E-commerce Platform' }
  ]);

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    storyPoints: 5,
    status: 'Backlog',
    project: 'E-commerce Platform'
  });

  const filteredItems = backlogItems.filter(item => {
    const matchesFilter = filter === 'All' || item.status === filter;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                         item.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm(item);
    } else {
      setEditingItem(null);
      setForm({ title: '', description: '', priority: 'Medium', storyPoints: 5, status: 'Backlog', project: 'E-commerce Platform' });
    }
    setShowModal(true);
  };

  const saveItem = () => {
    if (!form.title.trim()) {
      alert('Title is required');
      return;
    }

    if (editingItem) {
      setBacklogItems(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...form } : item));
    } else {
      setBacklogItems(prev => [...prev, { ...form, id: Date.now() }]);
    }
    setShowModal(false);
  };

  const deleteItem = (id) => {
    if (window.confirm('Delete this item?')) {
      setBacklogItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const moveToSprint = (id) => {
    setBacklogItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'Ready' } : item
    ));
    alert('Item moved to Sprint Ready!');
  };

  const getPriorityColor = (priority) => {
    const colors = { High: '#ef4444', Medium: '#f59e0b', Low: '#6b7280' };
    return colors[priority] || '#6b7280';
  };

  const getStatusColor = (status) => {
    const colors = { 
      'Backlog': '#6b7280', 
      'Ready': '#3b82f6', 
      'In Progress': '#f59e0b',
      'Done': '#10b981'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="backlog-container">
      <div className="backlog-header">
        <div>
          <h1>Product Backlog</h1>
          <p>Manage and prioritize development tasks</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()}>
          <FiPlus /> Add Backlog Item
        </button>
      </div>

      {/* Filters */}
      <div className="backlog-filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search backlog items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {['All', 'Backlog', 'Ready', 'In Progress', 'Done'].map(status => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="backlog-stats">
        <div className="stat-item">
          <span className="stat-label">Total Items</span>
          <span className="stat-value">{backlogItems.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Story Points</span>
          <span className="stat-value">{backlogItems.reduce((sum, item) => sum + item.storyPoints, 0)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Ready for Sprint</span>
          <span className="stat-value">{backlogItems.filter(i => i.status === 'Ready').length}</span>
        </div>
      </div>

      {/* Backlog List */}
      <div className="backlog-list">
        {filteredItems.map(item => (
          <div key={item.id} className="backlog-item">
            <div className="item-header">
              <div className="item-title-section">
                <h3>{item.title}</h3>
                <p className="item-description">{item.description}</p>
              </div>
              <div className="item-actions">
                <button className="btn-icon" onClick={() => openModal(item)} title="Edit">
                  <FiEdit2 />
                </button>
                <button className="btn-icon" onClick={() => deleteItem(item.id)} title="Delete">
                  <FiTrash2 />
                </button>
                {item.status === 'Backlog' && (
                  <button className="btn-move" onClick={() => moveToSprint(item.id)} title="Move to Sprint">
                    <FiArrowRight /> Sprint
                  </button>
                )}
              </div>
            </div>
            <div className="item-meta">
              <span className="meta-badge" style={{ background: getPriorityColor(item.priority) + '20', color: getPriorityColor(item.priority) }}>
                {item.priority} Priority
              </span>
              <span className="meta-badge" style={{ background: getStatusColor(item.status) + '20', color: getStatusColor(item.status) }}>
                {item.status}
              </span>
              <span className="meta-badge story-points">
                {item.storyPoints} SP
              </span>
              <span className="meta-project">{item.project}</span>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="empty-state">
            <p>No backlog items found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Backlog Item' : 'Add Backlog Item'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter item title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter description"
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Story Points</label>
                  <input
                    type="number"
                    min="1"
                    max="21"
                    value={form.storyPoints}
                    onChange={e => setForm({ ...form, storyPoints: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option>Backlog</option>
                    <option>Ready</option>
                    <option>In Progress</option>
                    <option>Done</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Project</label>
                  <input
                    type="text"
                    value={form.project}
                    onChange={e => setForm({ ...form, project: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveItem}>
                {editingItem ? 'Update' : 'Add'} Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

