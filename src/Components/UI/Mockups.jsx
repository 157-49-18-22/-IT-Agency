import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import './Mockups.css';

// API Configuration
const API_URL = 'http://localhost:5000/api';

const Mockups = () => {
  const navigate = useNavigate();
  // Ensure mockups is always an array
  const [mockups, setMockups] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web App',
    projectId: '',
    image: null
  });
  const [uploading, setUploading] = useState(false);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const [selectedMockup, setSelectedMockup] = useState(null);

  // Function to fetch mockups with improved error handling and response processing
  const fetchMockups = React.useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching mockups with token:', token ? 'Token exists' : 'No token');

      const response = await axios.get(`${API_URL}/mockups`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response:', response.data);

      // Handle different response formats
      let mockupsData = [];
      if (Array.isArray(response.data)) {
        mockupsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        mockupsData = response.data.data;
      } else if (response.data && response.data.mockups) {
        mockupsData = response.data.mockups;
      }

      console.log('Processed mockups:', mockupsData);
      setMockups(mockupsData);
      return mockupsData;
    } catch (error) {
      console.error('Error fetching mockups:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error('Failed to load mockups');
      setMockups([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch projects from API
  const fetchProjects = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const projectsData = response.data?.data || [];
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMockups();
    fetchProjects();
  }, [fetchMockups, fetchProjects]);

  // Memoize filtered and sorted mockups
  const filteredMockups = useMemo(() => {
    return mockups
      .filter(mockup => {
        const matchesSearch = mockup.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mockup.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || mockup.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.title?.localeCompare(b.title);
        if (sortBy === 'status') return a.status?.localeCompare(b.status);
        // Default sort by recent (createdAt)
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      });
  }, [mockups, searchTerm, categoryFilter, sortBy]);

  // Helper function to get status class
  const getStatusClass = (status) => {
    if (!status) return 'status-draft';
    switch (status.toLowerCase()) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return 'status-draft';
    }
  };

  // Memoize formatDate to prevent recreation on every render
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Helper function to get thumbnail based on category
  const getThumbnail = (category) => {
    if (!category) return '📋';
    switch (category.toLowerCase()) {
      case 'web app': return '🌐';
      case 'mobile': return '📱';
      case 'dashboard': return '📊';
      case 'marketing': return '📢';
      default: return '📋';
    }
  };

  // Mockup card click handlers
  const handleViewDetails = useCallback((mockup) => {
    setSelectedMockup(mockup);
    setViewDetailsModal(true);
  }, []);

  const handleViewMockup = useCallback((id) => {
    navigate(`/mockups/${id}`);
  }, [navigate]);

  const handleEditMockup = useCallback((id) => {
    // Implement edit functionality
    console.log('Edit mockup:', id);
    navigate(`/mockups/edit/${id}`);
  }, [navigate]);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this mockup?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/mockups/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Mockup deleted successfully');
        fetchMockups(); // Refresh the list
      } catch (error) {
        console.error('Error deleting mockup:', error);
        toast.error('Failed to delete mockup');
      }
    }
  }, [fetchMockups]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setUploading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('projectId', formData.projectId);
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/mockups`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Mockup created successfully');
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'Web App',
        projectId: 1,
        image: null
      });
      fetchMockups(); // Refresh the list
    } catch (error) {
      console.error('Error creating mockup:', error);
      toast.error('Failed to create mockup');
    } finally {
      setUploading(false);
    }
  }, [formData, fetchMockups]);

  // Handle form input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Handle file input
  const handleFileChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        image: e.target.files[0]
      }));
    }
  }, []);

  return (
    <div className="mockups-container">
      {/* Debug Info - Remove after fixing */}
      <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '20px', borderRadius: '4px' }}>
        <h4>Debug Info:</h4>
        <p>Total Mockups: {mockups.length}</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mockups-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search mockups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Web App">Web App</option>
            <option value="Mobile">Mobile</option>
            <option value="Dashboard">Dashboard</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>

        <div className="sort-group">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Sort by: Recent</option>
            <option value="name">Sort by: Name</option>
            <option value="status">Sort by: Status</option>
          </select>
        </div>

        <button
          className="btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + New Mockup
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading mockups...</p>
        </div>
      ) : mockups.length === 0 ? (
        <div className="no-mockups">
          <div className="no-mockups-icon">📋</div>
          <h3>No mockups found</h3>
          <p>Create your first mockup by clicking the "New Mockup" button</p>
        </div>
      ) : (
        <div className="mockups-grid">
          {filteredMockups.map((mockup) => (
            <div
              key={mockup.id}
              className="mockup-card"
              onClick={() => handleViewDetails(mockup)}
              style={{ cursor: 'pointer' }}
            >
              <div className="mockup-header">
                <div className="mockup-thumbnail">
                  {mockup.image_url ? (
                    <img
                      src={`http://localhost:5000${mockup.image_url}`}
                      alt={mockup.title || 'Mockup'}
                      onError={(e) => {
                        const target = e.target;
                        target.onerror = null;
                        target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23e0e0e0"><rect width="100" height="100" rx="8"/><text x="50%" y="50%" font-size="12" text-anchor="middle" dy=".3em" fill="%23999">No Preview</text></svg>';
                      }}
                    />
                  ) : (
                    <div className="mockup-placeholder">
                      {getThumbnail(mockup.category)}
                    </div>
                  )}
                </div>
                <div className="mockup-actions">
                  <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleViewMockup(mockup.id); }}>👁️</button>
                  <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleEditMockup(mockup.id); }}>✏️</button>
                  <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); handleDelete(mockup.id); }}>🗑️</button>
                </div>
              </div>
              <div className="mockup-body">
                <h3 className="mockup-title">{mockup.title || 'Untitled Mockup'}</h3>
                <p className="mockup-description">{mockup.description || 'No description provided'}</p>
                <div className="mockup-meta">
                  <span className={`status-badge ${getStatusClass(mockup.status)}`}>
                    {mockup.status || 'draft'}
                  </span>
                  <span className="mockup-category">{mockup.category || 'Uncategorized'}</span>
                </div>
                <div className="mockup-footer">
                  <span className="mockup-date">
                    {formatDate(mockup.updatedAt || mockup.createdAt)}
                  </span>
                  {mockup.creator && (
                    <span className="mockup-author">
                      👤 {mockup.creator.name || 'Unknown'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Add Mockup Modal */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)'
          }}
          onClick={(e) => {
            // Close modal if clicking on overlay
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div
            className="modal-content"
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              zIndex: 1001,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transform: 'translateY(0)',
              opacity: 1,
              transition: 'all 0.3s ease',
              padding: '24px'
            }}
          >
            <div className="modal-header" style={{
              padding: '16px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#2d3748' }}>Add New Mockup</h3>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
                disabled={uploading}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#718096',
                  padding: '4px',
                  lineHeight: 1
                }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={uploading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  disabled={uploading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="projectId">Project *</label>
                <select
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  required
                  disabled={uploading}
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  disabled={uploading}
                >
                  <option value="Web App">Web App</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Dashboard">Dashboard</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="image">Mockup Image *</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  required={!formData.image}
                  disabled={uploading}
                />
                {formData.image && (
                  <div className="file-preview">
                    Selected: {formData.image.name}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={uploading || !formData.title || !formData.image}
                >
                  {uploading ? 'Uploading...' : 'Create Mockup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetailsModal && selectedMockup && (
        <div className="modal-overlay" onClick={() => setViewDetailsModal(false)}>
          <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', padding: '0' }}>
            <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0 }}>Mockup Details</h3>
              <button className="close-btn" onClick={() => setViewDetailsModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#718096' }}>&times;</button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              <div className="details-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {selectedMockup.image_url && (
                  <div className="details-image-section" style={{ width: '100%', maxHeight: '400px', borderRadius: '12px', overflow: 'hidden' }}>
                    <img src={`http://localhost:5000${selectedMockup.image_url}`} alt={selectedMockup.title} style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                  </div>
                )}
                <div className="details-info-section" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="detail-row">
                    <label className="detail-label" style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px' }}>Title</label>
                    <div className="detail-value" style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{selectedMockup.title}</div>
                  </div>
                  <div className="detail-row">
                    <label className="detail-label" style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px' }}>Description</label>
                    <div className="detail-value" style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{selectedMockup.description || 'No description provided'}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="detail-row">
                      <label className="detail-label" style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px' }}>Category</label>
                      <div className="detail-value" style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{selectedMockup.category}</div>
                    </div>
                    <div className="detail-row">
                      <label className="detail-label" style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px' }}>Status</label>
                      <div className="detail-value" style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span className={`status-badge ${getStatusClass(selectedMockup.status)}`} style={{ position: 'static', display: 'inline-block' }}>{selectedMockup.status || 'draft'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <label className="detail-label" style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px' }}>Project</label>
                    <div className="detail-value" style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{projects.find(p => p.id === selectedMockup.projectId)?.name || 'N/A'}</div>
                  </div>
                  <div className="detail-row">
                    <label className="detail-label" style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px' }}>Created At</label>
                    <div className="detail-value" style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{formatDate(selectedMockup.createdAt)}</div>
                  </div>
                  <div className="detail-row">
                    <label className="detail-label" style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px' }}>Last Updated</label>
                    <div className="detail-value" style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{formatDate(selectedMockup.updatedAt)}</div>
                  </div>
                  {selectedMockup.creator && (
                    <div className="detail-row">
                      <label className="detail-label" style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px' }}>Created By</label>
                      <div className="detail-value" style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{selectedMockup.creator.name || 'Unknown'}</div>
                    </div>
                  )}
                </div>
                <div className="details-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                  <button className="btn-secondary" onClick={() => { setViewDetailsModal(false); handleEditMockup(selectedMockup.id); }} style={{ padding: '10px 20px', borderRadius: '8px', background: '#f7fafc', border: '1px solid #e2e8f0', cursor: 'pointer' }}>✏️ Edit Mockup</button>
                  <button className="btn-primary" onClick={() => setViewDetailsModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', background: '#4299e1', color: 'white', border: 'none', cursor: 'pointer' }}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mockups;