import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import './Mockups.css';

// API Configuration
const API_URL = 'http://localhost:5000/api';

const Mockups = () => {
  const navigate = useNavigate();
  const [mockups, setMockups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web App',
    projectId: 1, // Default or get from URL/context
    image: null
  });
  const [uploading, setUploading] = useState(false);

  // Fetch mockups from API
  useEffect(() => {
    const fetchMockups = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/mockups`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMockups(response.data || []);
      } catch (error) {
        console.error('Error fetching mockups:', error);
        toast.error('Failed to load mockups');
      } finally {
        setLoading(false);
      }
    };

    fetchMockups();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file input
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        image: e.target.files[0]
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Append all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.post(
        `${API_URL}/api/mockups`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Mockup created successfully!');
      setMockups([response.data, ...mockups]);
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'Web App',
        projectId: 1,
        image: null
      });
    } catch (error) {
      console.error('Error creating mockup:', error);
      toast.error(error.response?.data?.message || 'Failed to create mockup');
    } finally {
      setUploading(false);
    }
  };

  // Handle mockup deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this mockup?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/api/mockups/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setMockups(mockups.filter(mockup => mockup.id !== id));
        toast.success('Mockup deleted successfully');
      } catch (error) {
        console.error('Error deleting mockup:', error);
        toast.error('Failed to delete mockup');
      }
    }
  };

  // Filter and sort mockups
  const filteredMockups = mockups
    .filter(mockup => 
      mockup.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mockup.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(mockup => 
      categoryFilter === 'all' || mockup.category === categoryFilter
    )
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      } else {
        // Default: sort by most recent
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });

  if (loading) return <div className="loading">Loading mockups...</div>;

  const getStatusClass = (status) => {
    if (!status) return 'status-draft';
    
    switch (status.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'in_review':
      case 'in review':
        return 'status-review';
      case 'in_progress':
      case 'in progress':
        return 'status-progress';
      case 'rejected':
        return 'status-rejected';
      case 'draft':
      default:
        return 'status-draft';
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const getThumbnail = (category) => {
    switch (category?.toLowerCase()) {
      case 'mobile':
        return '📱';
      case 'marketing':
        return '🌐';
      case 'web':
      case 'web app':
        return '🖥️';
      case 'dashboard':
        return '📊';
      default:
        return '🖼️';
    }
  };

  return (
    <div className="mockups-container">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <div className="mockups-header">
        <div>
          <h2>Mockups</h2>
          <p>High-fidelity designs and visual mockups</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          <span className="btn-icon">+</span> New Mockup
        </button>
      </div>

      <div className="mockups-toolbar">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search mockups..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="filter-group">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Web App">Web App</option>
            <option value="Mobile">Mobile</option>
            <option value="Marketing">Marketing</option>
            <option value="Dashboard">Dashboard</option>
          </select>
        </div>
        <div className="sort-group">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Recently Updated</option>
            <option value="name">Name (A-Z)</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      <div className="mockups-grid">
        {filteredMockups.length > 0 ? (
          filteredMockups.map((mockup) => (
            <div key={mockup.id} className="mockup-card">
              <div className="mockup-thumbnail">
                <div className="thumbnail-content">
                  {getThumbnail(mockup.category)}
                </div>
                <div className={`status-badge ${getStatusClass(mockup.status)}`}>
                  {mockup.status?.replace('_', ' ')}
                </div>
                {mockup.imageUrl && (
                  <a 
                    href={`${API_URL}${mockup.imageUrl}`} 
                    className="preview-overlay" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View Preview
                  </a>
                )}
              </div>
              <div className="mockup-details">
                <div className="mockup-header">
                  <h3>{mockup.title}</h3>
                  <span className="version">v{mockup.version || '1.0'}</span>
                </div>
                <p className="description">{mockup.description || 'No description provided'}</p>
                <div className="mockup-meta">
                  <span className="category">{mockup.category || 'Uncategorized'}</span>
                  <span className="date">Updated {formatDate(mockup.updatedAt)}</span>
                </div>
                <div className="mockup-footer">
                  <div className="updated-by">
                    {mockup.User?.name && (
                      <>
                        <span className="avatar">{mockup.User.name.charAt(0)}</span>
                        <span>{mockup.User.name}</span>
                      </>
                    )}
                  </div>
                  <div className="actions">
                    {mockup.imageUrl && (
                      <a 
                        href={`${API_URL}${mockup.imageUrl}`} 
                        className="btn-icon" 
                        title="Preview" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        👁️
                      </a>
                    )}
                    <button 
                      className="btn-icon" 
                      title="Edit"
                      onClick={() => navigate(`/mockups/edit/${mockup.id}`)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-icon danger" 
                      title="Delete"
                      onClick={() => handleDelete(mockup.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No mockups found. Create your first mockup to get started!</p>
          </div>
        )}
      </div>

      {/* Add Mockup Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Mockup</h3>
              <button 
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
                disabled={uploading}
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
    </div>
  );
};

export default Mockups;