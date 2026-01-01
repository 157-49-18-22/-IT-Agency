import React, { useState, useEffect } from 'react';
import { FaUpload, FaTrash, FaEdit, FaSearch, FaPlus, FaTimes, FaImage, FaUser, FaCalendarAlt, FaCheck, FaEllipsisV, FaLink } from 'react-icons/fa';
import api from '../../services/api';
import './Prototypes.css';

const Prototypes = () => {
  const [prototypes, setPrototypes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPrototype, setCurrentPrototype] = useState({
    id: null,
    title: '',
    description: '',
    image: null,
    version: '1.0',
    status: 'draft',
    category: 'web',
    projectId: '',
    link: ''
  });
  const [preview, setPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const [selectedPrototype, setSelectedPrototype] = useState(null);

  // Fetch prototypes from API
  const fetchPrototypes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/prototypes');
      const prototypesData = response.data?.data || [];
      setPrototypes(prototypesData);
    } catch (err) {
      setError('Failed to load prototypes');
      console.error('Error fetching prototypes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      const projectsData = response.data?.data || [];
      setProjects(projectsData);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  useEffect(() => {
    fetchPrototypes();
    fetchProjects();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setCurrentPrototype({
        ...currentPrototype,
        image: file,
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPrototype({
      ...currentPrototype,
      [name]: value,
    });
  };

  // Reset form
  const resetForm = () => {
    setCurrentPrototype({
      id: null,
      title: '',
      description: '',
      image: null,
      version: '1.0',
      status: 'draft',
      category: 'web',
      projectId: '',
      link: ''
    });
    setPreview('');
    setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started');
    console.log('Current Prototype State:', currentPrototype);

    if (!currentPrototype.title) {
      setError('Title is required');
      return;
    }

    if (!currentPrototype.projectId) {
      setError('Project selection is required');
      return;
    }

    /* 
    if (!currentPrototype.image && !currentPrototype.id && !currentPrototype.link) {
      setError('Either an image or a link is required for a new prototype');
      return;
    }
    */

    const formData = new FormData();
    formData.append('title', currentPrototype.title);
    formData.append('description', currentPrototype.description || '');
    formData.append('version', currentPrototype.version || '1.0');
    formData.append('status', currentPrototype.status || 'draft');
    formData.append('category', currentPrototype.category || 'web');
    formData.append('projectId', currentPrototype.projectId);
    formData.append('link', currentPrototype.link || '');

    if (currentPrototype.image) {
      formData.append('image', currentPrototype.image);
    }

    console.log('Validation passed, sending request...');
    try {
      setIsSubmitting(true);
      setError('');

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (currentPrototype.id) {
        // Update existing prototype
        console.log('Updating prototype:', currentPrototype.id);
        await api.put(`/prototypes/${currentPrototype.id}`, formData, config);
      } else {
        // Create new prototype
        console.log('Creating new prototype');
        await api.post('/prototypes', formData, config);
      }

      setIsModalOpen(false);
      resetForm();
      fetchPrototypes();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save prototype');
      console.error('Error saving prototype:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle view prototype details
  const handleViewDetails = (prototype) => {
    setSelectedPrototype(prototype);
    setViewDetailsModal(true);
  };

  // Handle edit prototype
  const handleEdit = (prototype) => {
    setCurrentPrototype({
      id: prototype.id,
      title: prototype.title,
      description: prototype.description,
      version: prototype.version,
      status: prototype.status,
      category: prototype.category,
      projectId: prototype.projectId,
      link: prototype.link || '',
      image: null,
    });
    setPreview(prototype.imageUrl || '');
    setIsModalOpen(true);
  };

  // Handle delete prototype
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this prototype?')) {
      try {
        await api.delete(`/prototypes/${id}`);
        fetchPrototypes();
      } catch (err) {
        setError('Failed to delete prototype');
        console.error('Error deleting prototype:', err);
      }
    }
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'in_review':
      case 'in review':
        return 'status-review';
      case 'in_progress':
      case 'in progress':
        return 'status-progress';
      case 'draft':
      default:
        return 'status-draft';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter prototypes based on search term
  const filteredPrototypes = prototypes.filter(prototype =>
    prototype.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prototype.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading prototypes...</p>
      </div>
    );
  }

  return (
    <div className="prototypes-container">
      <div className="prototypes-header">
        <div className="header-content">
          <h2>Prototypes</h2>
          <p>Manage and organize your project prototypes</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <FaPlus /> Add Prototype
        </button>
      </div>

      <div className="prototypes-search">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search prototypes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="prototypes-grid">
        {filteredPrototypes.length > 0 ? (
          filteredPrototypes.map((prototype) => (
            <div
              key={prototype.id}
              className="prototype-card"
              onClick={() => handleViewDetails(prototype)}
              style={{ cursor: 'pointer' }}
            >
              <div className="prototype-image">
                {prototype.imageUrl ? (
                  <img src={prototype.imageUrl} alt={prototype.title} />
                ) : (
                  <div className="no-image">
                    <FaImage size={32} />
                    <span>No Preview</span>
                  </div>
                )}
                <div className={`status-badge ${getStatusClass(prototype.status)}`}>
                  {prototype.status?.replace('_', ' ')}
                </div>
              </div>
              <div className="prototype-details">
                <h3>{prototype.title}</h3>
                {prototype.description && <p className="description">{prototype.description}</p>}

                <div className="prototype-meta">
                  <span className="version">v{prototype.version}</span>
                  {prototype.link && (
                    <a
                      href={prototype.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="prototype-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaLink /> View Prototype
                    </a>
                  )}
                </div>

                <div className="prototype-footer">
                  <div className="updated-info">
                    <FaCalendarAlt className="icon" />
                    <span>{formatDate(prototype.updatedAt)}</span>
                  </div>
                  <div className="prototype-actions">
                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(prototype);
                      }}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(prototype.id);
                      }}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <FaImage size={48} className="empty-icon" />
            <h3>No prototypes found</h3>
            <p>Create your first prototype to get started</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
            >
              <FaPlus /> Add Prototype
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Prototype Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{currentPrototype.id ? 'Edit' : 'Add New'} Prototype</h3>
              <button
                className="btn-icon close-btn"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={currentPrototype.title}
                  onChange={handleInputChange}
                  placeholder="Enter prototype title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={currentPrototype.description}
                  onChange={handleInputChange}
                  placeholder="Enter prototype description"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-group">
                <label>Project *</label>
                <select
                  name="projectId"
                  value={currentPrototype.projectId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Version</label>
                  <input
                    type="text"
                    name="version"
                    value={currentPrototype.version}
                    onChange={handleInputChange}
                    placeholder="e.g., 1.0.0"
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={currentPrototype.status}
                    onChange={handleInputChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={currentPrototype.category}
                    onChange={handleInputChange}
                  >
                    <option value="web">Web</option>
                    <option value="mobile">Mobile</option>
                    <option value="tablet">Tablet</option>
                    <option value="desktop">Desktop</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Prototype Link (optional)</label>
                <input
                  type="url"
                  name="link"
                  value={currentPrototype.link || ''}
                  onChange={handleInputChange}
                  placeholder="https://example.com/prototype"
                />
              </div>

              <div className="form-group">
                <label>Prototype Image {!currentPrototype.id && '*'}</label>
                <div className="file-upload">
                  <input
                    type="file"
                    id="prototype-image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  <label htmlFor="prototype-image" className="file-label">
                    <FaUpload className="upload-icon" />
                    <span>{currentPrototype.image?.name || 'Choose an image'}</span>
                  </label>
                </div>
                {preview && (
                  <div className="image-preview">
                    <img src={preview} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (currentPrototype.id ? 'Update' : 'Create') + ' Prototype'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetailsModal && selectedPrototype && (
        <div className="modal-overlay" onClick={() => setViewDetailsModal(false)}>
          <div className="modal view-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h3>Prototype Details</h3>
              <button className="btn-icon close-btn" onClick={() => setViewDetailsModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="details-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {selectedPrototype.imageUrl && (
                  <div className="details-image-section" style={{ width: '100%', maxHeight: '400px', borderRadius: '12px', overflow: 'hidden', background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={selectedPrototype.imageUrl} alt={selectedPrototype.title} style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                  </div>
                )}
                <div className="details-info-section" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="detail-row">
                    <label className="detail-label" style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaImage style={{ color: '#4299e1' }} /> Title
                    </label>
                    <div className="detail-value" style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{selectedPrototype.title}</div>
                  </div>
                  <div className="detail-row">
                    <label className="detail-label" style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px' }}>Description</label>
                    <div className="detail-value" style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{selectedPrototype.description || 'No description provided'}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="detail-row">
                      <label className="detail-label" style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px' }}>Version</label>
                      <div className="detail-value" style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ display: 'inline-block', background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>v{selectedPrototype.version || '1.0'}</span>
                      </div>
                    </div>
                    <div className="detail-row">
                      <label className="detail-label" style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px' }}>Status</label>
                      <div className="detail-value" style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span className={`status-badge ${getStatusClass(selectedPrototype.status)}`} style={{ position: 'static', display: 'inline-block' }}>{selectedPrototype.status?.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <label className="detail-label" style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px' }}>Category</label>
                    <div className="detail-value" style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{selectedPrototype.category || 'Web'}</div>
                  </div>
                  {selectedPrototype.link && (
                    <div className="detail-row">
                      <label className="detail-label" style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaLink style={{ color: '#4299e1' }} /> Prototype Link
                      </label>
                      <div className="detail-value" style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <a href={selectedPrototype.link} target="_blank" rel="noopener noreferrer" style={{ color: '#4299e1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {selectedPrototype.link} <FaLink />
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="detail-row">
                    <label className="detail-label" style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaCalendarAlt style={{ color: '#4299e1' }} /> Created At
                    </label>
                    <div className="detail-value" style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{formatDate(selectedPrototype.createdAt)}</div>
                  </div>
                  <div className="detail-row">
                    <label className="detail-label" style={{ fontSize: '13px', fontWeight: '600', color: '#4a5568', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaCalendarAlt style={{ color: '#4299e1' }} /> Last Updated
                    </label>
                    <div className="detail-value" style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>{formatDate(selectedPrototype.updatedAt)}</div>
                  </div>
                </div>
                <div className="details-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                  <button className="btn btn-secondary" onClick={() => { setViewDetailsModal(false); handleEdit(selectedPrototype); }} style={{ padding: '10px 20px', borderRadius: '8px', background: '#f7fafc', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaEdit /> Edit Prototype
                  </button>
                  {selectedPrototype.link && (
                    <a href={selectedPrototype.link} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '10px 20px', borderRadius: '8px', background: '#f7fafc', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#4a5568' }}>
                      <FaLink /> Open Prototype
                    </a>
                  )}
                  <button className="btn btn-primary" onClick={() => setViewDetailsModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', background: '#4299e1', color: 'white', border: 'none', cursor: 'pointer' }}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prototypes;