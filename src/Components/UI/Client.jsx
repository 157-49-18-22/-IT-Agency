import React, { useState, useEffect } from 'react';
import './Client.css';
import api from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Client = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  // Ensure clients is always an array, even if the API returns null/undefined
  const [clients, setClients] = useState(() => {
    try {
      const savedClients = localStorage.getItem('cachedClients');
      return savedClients ? JSON.parse(savedClients) : [];
    } catch (error) {
      console.error('Error parsing cached clients:', error);
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    company: '',
    status: 'Active',
    address: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 10;

  // Fetch clients from API
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/clients', {
        params: {
          page: currentPage,
          limit: clientsPerPage,
          sort: sortBy,
          status: statusFilter === 'All Status' ? '' : statusFilter,
          search: searchTerm
        }
      });

      // Log the response for debugging
      console.log('API Response:', response.data);

      // Handle the response based on its structure
      let clientsData = [];

      if (Array.isArray(response.data)) {
        // If response.data is an array, use it directly
        clientsData = response.data;
      } else if (response.data && Array.isArray(response.data.clients)) {
        // If response.data has a clients array, use that
        clientsData = response.data.clients;
      } else if (response.data && Array.isArray(response.data.rows)) {
        // If response.data has a rows array (from findAndCountAll), use that
        clientsData = response.data.rows;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // If response.data has a data array, use that
        clientsData = response.data.data;
      }

      // Ensure we have a valid array
      clientsData = Array.isArray(clientsData) ? clientsData : [];

      // Add default values for any missing required fields
      const processedClients = clientsData.map(client => ({
        id: client.id || Date.now() + Math.random(),
        name: client.name || 'Unnamed Client',
        contact: client.contact || 'N/A',
        email: client.email || 'no-email@example.com',
        phone: client.phone || 'N/A',
        company: client.company || 'N/A',
        status: client.status || 'Active',
        address: client.address || 'N/A',
        logo: client.logo || '👤',
        projects: client.projects || 0,
        ...client // Spread any additional properties
      }));

      setClients(processedClients);

      // Cache the clients data
      try {
        localStorage.setItem('cachedClients', JSON.stringify(processedClients));
      } catch (cacheError) {
        console.error('Error caching clients:', cacheError);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        // Update existing client
        const response = await api.put(`/clients/${editingClient.id}`, formData);
        setClients(clients.map(client =>
          client.id === editingClient.id ? response.data : client
        ));
        toast.success('Client updated successfully!');
      } else {
        // Add new client
        const response = await api.post('/clients', formData);
        setClients([response.data, ...clients]);
        toast.success('Client added successfully!');
      }

      setShowAddForm(false);
      setEditingClient(null);
      setFormData({
        name: '',
        contact: '',
        email: '',
        phone: '',
        company: '',
        status: 'Active',
        address: ''
      });
    } catch (error) {
      console.error('Error saving client:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save client';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      contact: client.contact,
      email: client.email,
      phone: client.phone || '',
      company: client.company || '',
      status: client.status || 'Active',
      address: client.address || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await api.delete(`/clients/${clientId}`);
        setClients(clients.filter(client => client.id !== clientId));
        toast.success('Client deleted successfully!');
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error('Failed to delete client');
      }
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Ensure we're always working with an array
  const clientsArray = Array.isArray(clients) ? clients : [];

  const filteredClients = clientsArray.filter(client => {
    if (!client || typeof client !== 'object') return false;

    const searchTermLower = searchTerm.toLowerCase();
    const nameMatch = client.name && typeof client.name === 'string'
      ? client.name.toLowerCase().includes(searchTermLower)
      : false;
    const emailMatch = client.email && typeof client.email === 'string'
      ? client.email.toLowerCase().includes(searchTermLower)
      : false;

    const matchesSearch = nameMatch || emailMatch;
    const matchesStatus = statusFilter === 'All Status' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        default:
          return 0;
      }
    });

  // Calculate pagination
  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  return (
    <div className="client-container">
      <div className="client-header">
        <h2>Clients</h2>
        <button
          className="btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          + Add New Client
        </button>
      </div>

      {/* Add Client Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Client</h3>
              <button
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Company Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Person*</label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email*</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Prospect">Prospect</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                ></textarea>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingClient(null);
                    setFormData({
                      name: '',
                      contact: '',
                      email: '',
                      phone: '',
                      company: '',
                      status: 'Active',
                      address: ''
                    });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingClient ? 'Update Client' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="client-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span>🔍</span>
        </div>
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Prospect</option>
          </select>
        </div>
        <div className="sort-group">
          <select value={sortBy} onChange={handleSortChange}>
            <option value="newest">Sort by: Newest</option>
            <option value="name-asc">Sort by: Name (A-Z)</option>
            <option value="name-desc">Sort by: Name (Z-A)</option>
            <option value="oldest">Sort by: Oldest</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading clients...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No clients found</h3>
          <p>Try adjusting your search or filter criteria</p>
          <button
            className="btn-primary"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('All Status');
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="client-grid">
          {filteredClients.map(client => (
            <div key={client.id} className="client-card">
              <div className="client-logo" title={client.name}>
                {client.logo || client.name.charAt(0).toUpperCase()}
              </div>
              <div className="client-details">
                <h3 title={client.name}>
                  {client.name || 'Unnamed Client'}
                </h3>
                {client.contact && (
                  <p className="client-contact" title="Contact">
                    <span className="icon">👤</span>
                    {client.contact}
                  </p>
                )}
                {client.email && (
                  <p className="client-email" title="Email">
                    <span className="icon">✉️</span>
                    <a href={`mailto:${client.email}`}>{client.email}</a>
                  </p>
                )}
                {client.phone && (
                  <p className="client-phone" title="Phone">
                    <span className="icon">📞</span>
                    <a href={`tel:${client.phone.replace(/[^0-9+]/g, '')}`}>
                      {client.phone}
                    </a>
                  </p>
                )}
                {client.company && (
                  <p className="client-company" title="Company">
                    <span className="icon">🏢</span>
                    {client.company}
                  </p>
                )}
                <div className="client-meta">
                  {client.projects !== undefined && (
                    <span className="project-count" title="Projects">
                      📊 {client.projects} {client.projects === 1 ? 'Project' : 'Projects'}
                    </span>
                  )}
                  <span
                    className={`status-badge ${(client.status || 'active').toLowerCase()}`}
                    title={`Status: ${client.status || 'Active'}`}
                  >
                    {client.status || 'Active'}
                  </span>
                </div>
              </div>
              <div className="client-actions">
                <button
                  className="btn-icon"
                  title="Edit"
                  onClick={() => handleEdit(client)}
                  aria-label={`Edit ${client.name || 'client'}`}
                >
                  ✏️
                </button>
                <button
                  className="btn-icon"
                  title="Delete"
                  onClick={() => handleDelete(client.id)}
                  aria-label={`Delete ${client.name || 'client'}`}
                  style={{ color: '#e53e3e' }}
                >
                  🗑️
                </button>
                <button
                  className="btn-icon"
                  title="View Projects"
                  onClick={() => {
                    // Navigate to projects page or show projects modal
                    toast.info('View projects functionality will be implemented here');
                  }}
                >
                  👁️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`pagination-button ${currentPage === number ? 'active' : ''}`}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Client;