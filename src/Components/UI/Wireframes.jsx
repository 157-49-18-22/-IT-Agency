import React, { useState, useEffect } from 'react';
import { FaUpload, FaTrash, FaEdit, FaSearch, FaPlus, FaTimes, FaImage, FaUser, FaCalendarAlt, FaCheck, FaEllipsisV } from 'react-icons/fa';
import axios from 'axios';
import './Wireframes.css';

const Wireframes = ({ projectId }) => {
  const [wireframes, setWireframes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWireframe, setCurrentWireframe] = useState({
    id: null,
    title: '',
    description: '',
    image: null,
    version: '1.0',
    status: 'draft',
    category: 'web',
    projectId: projectId
  });
  const [preview, setPreview] = useState('');

  // Fetch wireframes from API
  const fetchWireframes = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/wireframes?projectId=${projectId}`);
      setWireframes(response.data);
    } catch (err) {
      setError('Failed to load wireframes');
      console.error('Error fetching wireframes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchWireframes();
    }
  }, [projectId]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setCurrentWireframe({
        ...currentWireframe,
        image: file,
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentWireframe({
      ...currentWireframe,
      [name]: value,
    });
  };

  // Reset form
  const resetForm = () => {
    setCurrentWireframe({
      id: null,
      title: '',
      description: '',
      image: null,
      version: '1.0',
      status: 'draft',
      category: 'web',
      projectId: projectId
    });
    setPreview('');
    setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentWireframe.title || (!currentWireframe.image && !currentWireframe.id)) {
      setError('Title and image are required');
      return;
    }

    const formData = new FormData();
    formData.append('title', currentWireframe.title);
    formData.append('description', currentWireframe.description);
    formData.append('version', currentWireframe.version);
    formData.append('status', currentWireframe.status);
    formData.append('category', currentWireframe.category);
    formData.append('projectId', currentWireframe.projectId);
    if (currentWireframe.image) {
      formData.append('image', currentWireframe.image);
    }

    try {
      if (currentWireframe.id) {
        // Update existing wireframe
        await axios.put(`/api/wireframes/${currentWireframe.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Create new wireframe
        await axios.post('/api/wireframes', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchWireframes();
    } catch (err) {
      setError('Failed to save wireframe');
      console.error('Error saving wireframe:', err);
    }
  };

  // Handle edit wireframe
  const handleEdit = (wireframe) => {
    setCurrentWireframe({
      id: wireframe.id,
      title: wireframe.title,
      description: wireframe.description,
      version: wireframe.version,
      status: wireframe.status,
      category: wireframe.category,
      projectId: wireframe.projectId,
      image: null,
    });
    setPreview(wireframe.imageUrl || '');
    setIsModalOpen(true);
  };

  // Handle delete wireframe
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this wireframe?')) {
      try {
        await axios.delete(`/api/wireframes/${id}`);
        fetchWireframes();
      } catch (err) {
        setError('Failed to delete wireframe');
        console.error('Error deleting wireframe:', err);
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

  // Filter wireframes based on search term
  const filteredWireframes = wireframes.filter(wireframe =>
    wireframe.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wireframe.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="wireframes-container">
      <div className="wireframes-header">
        <div className="header-content">
          <h2>Wireframes</h2>
          <p>Manage and organize your project wireframes</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <FaPlus className="btn-icon" /> New Wireframe
        </button>
      </div>

      <div className="wireframes-toolbar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search wireframes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select>
            <option>All Categories</option>
            <option>Web</option>
            <option>Mobile</option>
            <option>Tablet</option>
            <option>Desktop</option>
          </select>
        </div>
        <div className="sort-group">
          <select>
            <option>Sort by: Recently Updated</option>
            <option>Sort by: Name (A-Z)</option>
            <option>Sort by: Status</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading ? (
        <div className="loading">Loading wireframes...</div>
      ) : (
        <div className="wireframes-grid">
          {filteredWireframes.length > 0 ? (
            filteredWireframes.map((wireframe) => (
              <div key={wireframe.id} className="wireframe-card">
                <div className="wireframe-thumbnail">
                  {wireframe.imageUrl ? (
                    <img 
                      src={wireframe.imageUrl} 
                      alt={wireframe.title} 
                      className="wireframe-image"
                    />
                  ) : (
                    <div className="image-placeholder">
                      <FaImage size={32} />
                      <span>No preview available</span>
                    </div>
                  )}
                  <div className="card-actions">
                    <button 
                      className="btn-icon"
                      onClick={() => handleEdit(wireframe)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn-icon danger"
                      onClick={() => handleDelete(wireframe.id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div className="wireframe-details">
                  <div className="wireframe-header">
                    <h3>{wireframe.title}</h3>
                    <span className={`status-badge ${getStatusClass(wireframe.status)}`}>
                      {wireframe.status?.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="wireframe-description">
                    {wireframe.description || 'No description provided'}
                  </p>
                  
                  <div className="wireframe-meta">
                    <div className="meta-item">
                      <FaUser className="meta-icon" />
                      <span>{wireframe.updatedBy || 'System'}</span>
                    </div>
                    <div className="meta-item">
                      <FaCalendarAlt className="meta-icon" />
                      <span>{formatDate(wireframe.updatedAt || wireframe.createdAt)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="version">v{wireframe.version || '1.0'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-wireframes">
              <FaImage size={48} className="empty-icon" />
              <h3>No wireframes found</h3>
              <p>Create your first wireframe to get started</p>
              <button 
                className="btn btn-primary"
                onClick={() => setIsModalOpen(true)}
              >
                <FaPlus /> Add Wireframe
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Wireframe Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{currentWireframe.id ? 'Edit' : 'Add New'} Wireframe</h3>
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
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Title <span className="required">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={currentWireframe.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter wireframe title"
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={currentWireframe.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Add a description for this wireframe"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Version</label>
                    <input
                      type="text"
                      name="version"
                      value={currentWireframe.version}
                      onChange={handleInputChange}
                      placeholder="e.g., 1.0.0"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={currentWireframe.status}
                      onChange={handleInputChange}
                    >
                      <option value="draft">Draft</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="approved">Approved</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={currentWireframe.category}
                    onChange={handleInputChange}
                  >
                    <option value="web">Web</option>
                    <option value="mobile">Mobile</option>
                    <option value="tablet">Tablet</option>
                    <option value="desktop">Desktop</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Wireframe {!currentWireframe.id && <span className="required">*</span>}</label>
                  <div className="file-upload">
                    <label className={`file-upload-label ${preview ? 'has-preview' : ''}`}>
                      <FaUpload className="upload-icon" />
                      <span>
                        {currentWireframe.image?.name || 'Choose an image or drag & drop'}
                        <small>PNG, JPG, GIF up to 10MB</small>
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        required={!currentWireframe.id}
                      />
                    </label>
                  </div>
                  
                  {(preview || currentWireframe.imageUrl) && (
                    <div className="image-preview">
                      <img 
                        src={preview || currentWireframe.imageUrl} 
                        alt="Preview" 
                        className={preview ? 'preview-image' : 'preview-image existing'}
                      />
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
                  <button type="submit" className="btn btn-primary">
                    {currentWireframe.id ? 'Update' : 'Save'} Wireframe
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wireframes;