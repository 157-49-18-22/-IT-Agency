import React, { useState, useEffect } from 'react';
import './Client.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Client = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clients, setClients] = useState([]);
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
    try {
      const response = await axios.get('http://localhost:5000/api/clients', {
        params: {
          page: currentPage,
          limit: clientsPerPage,
          sort: sortBy,
          status: statusFilter === 'All Status' ? '' : statusFilter,
          search: searchTerm
        }
      });
      setClients(response.data);
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
        const response = await axios.put(
          `http://localhost:5000/api/clients/${editingClient.id}`,
          formData
        );
        setClients(clients.map(client => 
          client.id === editingClient.id ? response.data : client
        ));
        toast.success('Client updated successfully!');
      } else {
        // Add new client
        const response = await axios.post('http://localhost:5000/api/clients', formData);
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
        await axios.delete(`http://localhost:5000/api/clients/${clientId}`);
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

  const filteredClients = [...clients]
    .filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.email.toLowerCase().includes(searchTerm.toLowerCase());
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
        <div className="loading">Loading clients...</div>
      ) : filteredClients.length === 0 ? (
        <div className="no-results">No clients found matching your criteria.</div>
      ) : (
        <div className="client-grid">
        {filteredClients.map(client => (
          <div key={client.id} className="client-card">
            <div className="client-logo">{client.logo}</div>
            <div className="client-details">
              <h3>{client.name}</h3>
              <p className="client-contact">👤 {client.contact}</p>
              <p className="client-email">✉️ {client.email}</p>
              <p className="client-phone">📞 {client.phone || 'N/A'}</p>
              <div className="client-meta">
                <span className="project-count">📊 {client.projects || 0} Projects</span>
                <span className={`status-badge ${client.status ? client.status.toLowerCase() : 'active'}`}>
                  {client.status || 'Active'}
                </span>
              </div>
            </div>
            <div className="client-actions">
              <button 
                className="btn-icon" 
                title="Edit"
                onClick={() => handleEdit(client)}
              >
                ✏️
              </button>
              <button 
                className="btn-icon" 
                title="Delete"
                onClick={() => handleDelete(client.id)}
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