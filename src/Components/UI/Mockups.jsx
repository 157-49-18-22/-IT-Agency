import React, { useState, useEffect } from 'react';
import { FaUpload, FaTrash, FaEdit, FaSearch, FaPlus, FaTimes, FaImage, FaUser, FaCalendarAlt, FaCheck, FaEllipsisV } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../config/endpoints';
import './Mockups.css';

const Mockups = () => {
  const [projectId] = useState(null);
  const [mockups, setMockups] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMockup, setCurrentMockup] = useState({
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
  const [selectedMockup, setSelectedMockup] = useState(null);

  // Fetch mockups from API
  const fetchMockups = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      // Build the URL with projectId if it exists
      const url = projectId
        ? `${API_URL}/mockups?projectId=${projectId}`
        : `${API_URL}/mockups`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      // Check if response.data exists and has a data property
      const mockupsData = response.data?.data || [];
      setMockups(mockupsData);
    } catch (err) {
      setError('Failed to load mockups');
      console.error('Error fetching mockups:', err);
      setMockups([]);
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

  // Fetch mockups and projects on component mount
  useEffect(() => {
    fetchMockups();
    fetchProjects();
  }, [projectId]);

  // Helper to construct full image URL
  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('https') || path.startsWith('data:')) return path;

    // Remove '/api' from the end of API_URL to get the base URL
    const baseUrl = API_URL.replace(/\/api$/, '');

    // Ensure path starts with / if needed, or join correctly
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${cleanPath}`;
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size should be less than 10MB');
        return;
      }

      // Check file type - Allow all image types
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setCurrentMockup(prev => ({
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
    setCurrentMockup({
      ...currentMockup,
      [name]: value,
    });
  };

  // Reset form
  const resetForm = () => {
    setCurrentMockup({
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
    e.preventDefault();
    e.stopPropagation();

    // Clear previous errors
    setError('');

    // Trim the title and check if it's empty
    const title = currentMockup.title ? currentMockup.title.trim() : '';

    // Basic validation
    if (!title) {
      setError('Title is required');
      return;
    }

    // Validate project selection
    if (!currentMockup.projectId) {
      setError('Please select a project');
      return;
    }

    // Create form data
    const formData = new FormData();
    formData.append('title', currentMockup.title);
    formData.append('description', currentMockup.description || '');
    formData.append('version', currentMockup.version || '1.0');
    formData.append('status', currentMockup.status || 'draft');
    formData.append('category', currentMockup.category || 'web');
    formData.append('projectId', currentMockup.projectId);

    // Add image to form data if it exists
    if (currentMockup.image) {
      formData.append('image', currentMockup.image, currentMockup.image.name || 'mockup.jpg');
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You need to be logged in to save mockups');
        return;
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        withCredentials: true // Ensure cookies are sent with the request
      };

      // Show loading state
      setError('Saving mockup...');

      if (currentMockup.id) {
        // Update existing mockup
        await axios.put(`${API_URL}/mockups/${currentMockup.id}`, formData, config);
      } else {
        // Create new mockup
        await axios.post(`${API_URL}/mockups`, formData, config);
      }

      // On success - close modal and reset form
      console.log('Mockup saved successfully');
      await fetchMockups(); // Wait for the data to be refreshed
      resetForm();
      setIsModalOpen(false);

    } catch (err) {
      console.error('Error saving mockup:', err);
      let errorMessage = 'Failed to save mockup.';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      setError(errorMessage);
    }
  };

  // Handle view mockup details
  const handleViewDetails = (mockup) => {
    setSelectedMockup(mockup);
    setViewDetailsModal(true);
  };

  // Handle edit mockup
  const handleEdit = (mockup) => {
    // Note: mockup object from API uses `project_id` and `image_url`
    // but the keys might be different depending on how Sequelize returned it.
    // If we used snake_case model directly, the keys on object are likely snake_case.
    // But wireframe controller returned mixed case due to model definition.
    // Our Mockup model defined keys as snake_case.
    // So we should expect `project_id` and `image_url`.

    // However, we need to map them to the state which uses `projectId`.

    setCurrentMockup({
      id: mockup.id,
      title: mockup.title,
      description: mockup.description,
      version: mockup.version,
      status: mockup.status,
      category: mockup.category,
      projectId: mockup.project_id || mockup.projectId, // Handle both just in case
      image: null,
    });
    setPreview(getFullUrl(mockup.image_url || mockup.imageUrl) || '');
    setIsModalOpen(true);
  };

  // Handle delete mockup
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this mockup?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required to delete');
          return;
        }

        await axios.delete(`${API_URL}/mockups/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        fetchMockups();
      } catch (err) {
        setError('Failed to delete mockup');
        console.error('Error deleting mockup:', err);
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
        return 'status-pending'; // Mockups.css has status-pending
      case 'rejected':
        return 'status-rejected';
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

  // Filter mockups based on search term
  const filteredMockups = Array.isArray(mockups)
    ? mockups.filter(mockup =>
    (mockup.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mockup.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    : [];

  return (
    <div className="mockups-container">
      <div className="mockups-header">
        <div className="header-content">
          <h2>Mockups</h2>
          <p>Visualize and manage your project designs</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <FaPlus className="btn-icon-text" /> New Mockup
        </button>
      </div>

      <div className="mockups-toolbar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search mockups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select className="custom-select">
            <option>All Categories</option>
            <option>Web</option>
            <option>Mobile</option>
            <option>Tablet</option>
            <option>Desktop</option>
          </select>
        </div>
        <div className="sort-group">
          <select className="custom-select">
            <option>Sort by: Recent</option>
            <option>Sort by: Name (A-Z)</option>
            <option>Sort by: Status</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {isLoading ? (
        <div className="loading">Loading mockups...</div>
      ) : (
        <div className="mockups-grid">
          {filteredMockups.length > 0 ? (
            filteredMockups.map((mockup) => (
              <div
                key={mockup.id}
                className="mockup-card"
                onClick={() => handleViewDetails(mockup)}
              >
                <div className="mockup-frame">
                  <div className={`status-indicator ${getStatusClass(mockup.status)}`}>
                    {mockup.status?.replace('_', ' ')}
                  </div>

                  {(mockup.image_url || mockup.imageUrl) ? (
                    <img
                      src={getFullUrl(mockup.image_url || mockup.imageUrl)}
                      alt={mockup.title}
                      className="mockup-image"
                    />
                  ) : (
                    <div className="mockup-placeholder">
                      <FaImage size={32} />
                      <span>No Preview</span>
                    </div>
                  )}

                  <div className="mockup-overlay">
                    <button
                      className="icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(mockup);
                      }}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(mockup.id);
                      }}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="mockup-content">
                  <div className="mockup-main-info">
                    <h3 className="mockup-title">{mockup.title}</h3>
                    <span className="mockup-category-tag">{mockup.category}</span>
                  </div>

                  <p className="mockup-description">
                    {mockup.description || 'No description provided'}
                  </p>

                  <div className="mockup-meta-info">
                    <div className="meta-item">
                      <FaCalendarAlt size={12} />
                      <span>{formatDate(mockup.createdAt || mockup.created_at)}</span>
                    </div>
                    <div className="meta-item">
                      <FaUser size={12} />
                      <span>{mockup.creator?.name || 'MAYDIVINFOTECH'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-mockups">
              <FaImage className="empty-icon" />
              <h3>No mockups found</h3>
              <p>Create your first mockup to get started</p>
              <button
                className="btn btn-primary"
                onClick={() => setIsModalOpen(true)}
              >
                <FaPlus /> New Mockup
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Mockup Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{currentMockup.id ? 'Edit' : 'New'} Mockup</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-form">
                <div className="form-group">
                  <label>Title <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={currentMockup.title}
                    onChange={handleInputChange}
                    placeholder="Enter mockup title"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={currentMockup.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Add a description..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Version</label>
                    <input
                      type="text"
                      name="version"
                      value={currentMockup.version}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={currentMockup.status}
                      onChange={handleInputChange}
                    >
                      <option value="draft">Draft</option>
                      <option value="in_review">In Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Project <span style={{ color: 'red' }}>*</span></label>
                  <select
                    name="projectId"
                    value={currentMockup.projectId}
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

                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={currentMockup.category}
                    onChange={handleInputChange}
                  >
                    <option value="web">Web App</option>
                    <option value="mobile">Mobile App</option>
                    <option value="tablet">Tablet</option>
                    <option value="desktop">Desktop</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Mockup Image</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="mockup-image"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file-input-hidden"
                    />
                    <label htmlFor="mockup-image" className="file-upload-label">
                      {preview ? (
                        <div className="image-preview" style={{ width: '100%', height: '200px' }}>
                          <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                      ) : (
                        <div className="file-placeholder">
                          <FaUpload size={24} />
                          <span>Click to upload image</span>
                          <small>PNG, JPG up to 10MB</small>
                        </div>
                      )}
                    </label>
                  </div>
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
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSubmit}
                  >
                    {currentMockup.id ? 'Update' : 'Save'} Mockup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDetailsModal && selectedMockup && (
        <div className="modal-overlay">
          <div className="modal-content view-modal">
            <div className="modal-header">
              <h3>{selectedMockup.title}</h3>
              <button
                className="close-btn"
                onClick={() => setViewDetailsModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              {(selectedMockup.image_url || selectedMockup.imageUrl) && (
                <div className="details-image-section">
                  <img
                    src={getFullUrl(selectedMockup.image_url || selectedMockup.imageUrl)}
                    alt={selectedMockup.title}
                  />
                </div>
              )}

              <div className="detail-grid">
                <div className="detail-row">
                  <label>Description</label>
                  <div className="value">{selectedMockup.description || 'No description'}</div>
                </div>
                <div className="detail-row">
                  <label>Project</label>
                  <div className="value">{projects.find(p => p.id === (selectedMockup.project_id || selectedMockup.projectId))?.name || 'N/A'}</div>
                </div>
                <div className="detail-row">
                  <label>Status</label>
                  <div className="value">
                    <span className={`status-badge-large ${getStatusClass(selectedMockup.status)}`}>
                      {selectedMockup.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="detail-row">
                  <label>Version</label>
                  <div className="value">{selectedMockup.version}</div>
                </div>
              </div>

              <div className="details-actions-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setViewDetailsModal(false);
                    handleEdit(selectedMockup);
                  }}
                >
                  <FaEdit /> Edit
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
      )}
    </div>
  );
};

export default Mockups;
