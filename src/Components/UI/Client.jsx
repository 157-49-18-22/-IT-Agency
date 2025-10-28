import React from 'react';
import './Client.css';

const Client = () => {
  // Mock client data
  const clients = [
    {
      id: 1,
      name: 'Acme Corp',
      contact: 'John Smith',
      email: 'john@acmecorp.com',
      projects: 5,
      status: 'Active',
      logo: '🏢'
    },
    {
      id: 2,
      name: 'Globex',
      contact: 'Sarah Johnson',
      email: 'sarah@globex.com',
      projects: 3,
      status: 'Active',
      logo: '🌐'
    },
    {
      id: 3,
      name: 'Initech',
      contact: 'Peter Gibbons',
      email: 'peter@initech.com',
      projects: 2,
      status: 'Inactive',
      logo: '💼'
    },
    {
      id: 4,
      name: 'Umbrella Corp',
      contact: 'Alice Wesker',
      email: 'alice@umbrella.com',
      projects: 7,
      status: 'Active',
      logo: '☂️'
    },
  ];

  return (
    <div className="client-container">
      <div className="client-header">
        <h2>Clients</h2>
        <button className="btn-primary">+ Add New Client</button>
      </div>
      
      <div className="client-toolbar">
        <div className="search-box">
          <input type="text" placeholder="Search clients..." />
          <span>🔍</span>
        </div>
        <div className="filter-group">
          <select>
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <div className="sort-group">
          <select>
            <option>Sort by: Newest</option>
            <option>Sort by: Name (A-Z)</option>
            <option>Sort by: Projects</option>
          </select>
        </div>
      </div>

      <div className="client-grid">
        {clients.map(client => (
          <div key={client.id} className="client-card">
            <div className="client-logo">{client.logo}</div>
            <div className="client-details">
              <h3>{client.name}</h3>
              <p className="client-contact">👤 {client.contact}</p>
              <p className="client-email">✉️ {client.email}</p>
              <div className="client-meta">
                <span className="project-count">📊 {client.projects} Projects</span>
                <span className={`status-badge ${client.status.toLowerCase()}`}>
                  {client.status}
                </span>
              </div>
            </div>
            <div className="client-actions">
              <button className="btn-icon" title="Edit">✏️</button>
              <button className="btn-icon" title="View Projects">👁️</button>
              <button className="btn-icon" title="Message">💬</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Client;