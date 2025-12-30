import React, { useState, useEffect } from 'react';
// projectId is now optional
import { FaUpload, FaTrash, FaEdit, FaSearch, FaPlus, FaTimes, FaImage, FaUser, FaCalendarAlt, FaCheck, FaEllipsisV } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../config/endpoints';
import './Wireframes.css';

const Wireframes = () => {
  // projectId is now optional and can be passed as a prop or will be null
  const [projectId] = useState(null);
  const [wireframes, setWireframes] = useState([]);
  const [projects, setProjects] = useState([]);
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
    projectId: ''
  });
  const [preview, setPreview] = useState('');
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const [selectedWireframe, setSelectedWireframe] = useState(null);

  // Fetch wireframes from API
  const fetchWireframes = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      // Build the URL with projectId if it exists
      const url = projectId
        ? `${API_URL}/wireframes?projectId=${projectId}`
        : `${API_URL}/wireframes`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      // Check if response.data exists and has a data property
      const wireframesData = response.data?.data || [];
      setWireframes(wireframesData);
    } catch (err) {
      setError('Failed to load wireframes');
      console.error('Error fetching wireframes:', err);
      setWireframes([]); // Ensure wireframes is always an array
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const projectsData = response.data?.data || [];
      setProjects(projectsData);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  // Fetch wireframes and projects on component mount
  useEffect(() => {
    fetchWireframes();
    fetchProjects();
  }, [projectId]);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        return;
      }

      // Check file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid image file (PNG, JPG, GIF)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setCurrentWireframe(prev => ({
          ...prev,
          image: file,
        }));
        setError(''); // Clear any previous errors
      };
      reader.onerror = () => {
        setError('Failed to read the file');
      };
      reader.readAsDataURL(file);
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
    console.log('Resetting form');
    setCurrentWireframe({
      id: null,
      title: '',
      description: '',
      image: null,
      version: '1.0',
      status: 'draft',
      category: 'web',
      projectId: ''
    });
    setPreview('');
    setError('');

    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    console.log('Form submission started');
    e.preventDefault();
    e.stopPropagation();

    // Clear previous errors
    setError('');

    // Trim the title and check if it's empty
    const title = currentWireframe.title ? currentWireframe.title.trim() : '';

    // Basic validation
    if (!title) {
      console.log('Title is required');
      setError('Title is required');
      return;
    }

    // Validate project selection
    if (!currentWireframe.projectId) {
      setError('Please select a project');
      return;
    }

    console.log('All validations passed, proceeding with form submission');

    // Create form data
    const formData = new FormData();
    formData.append('title', currentWireframe.title);
    formData.append('description', currentWireframe.description || '');
    formData.append('version', currentWireframe.version || '1.0');
    formData.append('status', currentWireframe.status || 'draft');
    formData.append('category', currentWireframe.category || 'web');
    formData.append('projectId', currentWireframe.projectId);

    // Add image to form data if it exists
    if (currentWireframe.image) {
      formData.append('image', currentWireframe.image, currentWireframe.image.name || 'wireframe.jpg');
    }

    // Log form data for debugging
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You need to be logged in to save wireframes');
        return;
      }

      console.log('Auth token:', token ? 'Token exists' : 'No token found');

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        withCredentials: true // Ensure cookies are sent with the request
      };

      // Log the headers being sent
      console.log('Request headers:', config.headers);

      // Show loading state
      setError('Saving wireframe...');

      if (currentWireframe.id) {
        // Update existing wireframe
        await axios.put(`${API_URL}/wireframes/${currentWireframe.id}`, formData, config);
      } else {
        // Create new wireframe
        await axios.post(`${API_URL}/wireframes`, formData, config);
      }

      // On success - close modal and reset form
      console.log('Wireframe saved successfully');
      await fetchWireframes(); // Wait for the data to be refreshed
      resetForm();
      setIsModalOpen(false);

    } catch (err) {
      console.error('Error saving wireframe:', err);
      console.error('Error response data:', err.response?.data);
      console.error('Error response status:', err.response?.status);

      let errorMessage = 'Failed to save wireframe. Please check your connection and try again.';

      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.data) {
          if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          } else if (err.response.data.error) {
            errorMessage = err.response.data.error;
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          } else if (err.response.data.details) {
            // If we have validation errors, format them nicely
            if (Array.isArray(err.response.data.details)) {
              errorMessage = err.response.data.details
                .map(detail => `${detail.field ? `${detail.field}: ` : ''}${detail.message}`)
                .join('\n');
            } else {
              errorMessage = JSON.stringify(err.response.data.details);
            }
          }
        }

        // Add status code to the error message
        errorMessage = `[${err.response.status}] ${errorMessage}`;
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response received:', err.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', err.message);
        errorMessage = `Request error: ${err.message}`;
      }

      setError(errorMessage);
    }
  };

  // Handle view wireframe details
  const handleViewDetails = (wireframe) => {
    setSelectedWireframe(wireframe);
    setViewDetailsModal(true);
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
        await axios.delete(`${API_URL}/wireframes/${id}`);
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
  const filteredWireframes = Array.isArray(wireframes)
    ? wireframes.filter(wireframe =>
    (wireframe.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wireframe.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    : [];

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
              <div
                key={wireframe.id}
                className="wireframe-card"
                onClick={() => handleViewDetails(wireframe)}
                style={{ cursor: 'pointer' }}
              >
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(wireframe);
                      }}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(wireframe.id);
                      }}
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
              <div className="wireframe-form">
                <div className="form-group">
                  <label>Title <span className="required">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={currentWireframe.title}
                    onChange={handleInputChange}
                    placeholder="Enter wireframe title"
                    className={!currentWireframe.title ? 'error' : ''}
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
                  <label>Project <span className="required">*</span></label>
                  <select
                    name="projectId"
                    value={currentWireframe.projectId}
                    onChange={handleInputChange}
                    required
                    className={!currentWireframe.projectId ? 'error' : ''}
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
                  <label>Wireframe (Optional)</label>
                  <div className="file-upload">
                    <input
                      type="file"
                      id="wireframe-image"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file-input"
                    />
                    <label htmlFor="wireframe-image" className="file-upload-label">
                      {preview ? (
                        <img src={preview} alt="Preview" className="image-preview" />
                      ) : (
                        <>
                          <FaUpload className="upload-icon" />
                          <span>Choose an image or drag & drop (Optional)</span>
                          <small>PNG, JPG, GIF up to 10MB</small>
                        </>
                      )}
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
                      console.log('Cancel button clicked');
                      setIsModalOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSubmit}
                  >
                    {currentWireframe.id ? 'Update' : 'Save'} Wireframe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetailsModal && selectedWireframe && (
        <div className="modal-overlay" onClick={() => setViewDetailsModal(false)}>
          <div className="modal view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Wireframe Details</h3>
              <button
                className="btn-icon close-btn"
                onClick={() => setViewDetailsModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="details-container">
                {/* Wireframe Image */}
                {selectedWireframe.imageUrl && (
                  <div className="details-image-section">
                    <img
                      src={selectedWireframe.imageUrl}
                      alt={selectedWireframe.title}
                      className="details-image"
                    />
                  </div>
                )}

                {/* Wireframe Information */}
                <div className="details-info-section">
                  <div className="detail-row">
                    <label className="detail-label">
                      <FaImage className="detail-icon" />
                      Title
                    </label>
                    <div className="detail-value">{selectedWireframe.title}</div>
                  </div>

                  <div className="detail-row">
                    <label className="detail-label">Description</label>
                    <div className="detail-value">
                      {selectedWireframe.description || 'No description provided'}
                    </div>
                  </div>

                  <div className="detail-row-group">
                    <div className="detail-row">
                      <label className="detail-label">Version</label>
                      <div className="detail-value">
                        <span className="version-badge">v{selectedWireframe.version || '1.0'}</span>
                      </div>
                    </div>

                    <div className="detail-row">
                      <label className="detail-label">Status</label>
                      <div className="detail-value">
                        <span className={`status-badge ${getStatusClass(selectedWireframe.status)}`}>
                          {selectedWireframe.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-row-group">
                    <div className="detail-row">
                      <label className="detail-label">Category</label>
                      <div className="detail-value">
                        {selectedWireframe.category || 'Web'}
                      </div>
                    </div>

                    <div className="detail-row">
                      <label className="detail-label">Project</label>
                      <div className="detail-value">
                        {projects.find(p => p.id === selectedWireframe.projectId)?.name || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="detail-row">
                    <label className="detail-label">
                      <FaCalendarAlt className="detail-icon" />
                      Created At
                    </label>
                    <div className="detail-value">
                      {formatDate(selectedWireframe.createdAt)}
                    </div>
                  </div>

                  <div className="detail-row">
                    <label className="detail-label">
                      <FaCalendarAlt className="detail-icon" />
                      Last Updated
                    </label>
                    <div className="detail-value">
                      {formatDate(selectedWireframe.updatedAt)}
                    </div>
                  </div>

                  <div className="detail-row">
                    <label className="detail-label">
                      <FaUser className="detail-icon" />
                      Created By
                    </label>
                    <div className="detail-value">
                      {selectedWireframe.updatedBy || selectedWireframe.createdBy || 'System'}
                    </div>
                  </div>

                  {selectedWireframe.fileSize && (
                    <div className="detail-row">
                      <label className="detail-label">File Size</label>
                      <div className="detail-value">
                        {(selectedWireframe.fileSize / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="details-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setViewDetailsModal(false);
                      handleEdit(selectedWireframe);
                    }}
                  >
                    <FaEdit /> Edit Wireframe
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setViewDetailsModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wireframes;