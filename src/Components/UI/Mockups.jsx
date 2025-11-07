import React from 'react';
import { Link } from 'react-router-dom';
import './Mockups.css';
import { deliverableAPI } from '../../services/api';

const Mockups = () => {
  const [mockups, setMockups] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await deliverableAPI.getAll({ stage: 'UI/UX', type: 'Mockup' });
        setMockups(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);
  if (loading) return <div className="loading">Loading...</div>;
  // Mock mockups data
  const mockups = [
    {
      id: 1,
      title: 'Dashboard UI',
      description: 'High-fidelity mockup of the main dashboard',
      version: 'v2.1',
      date: '2023-10-18',
      status: 'Approved',
      thumbnail: '🖥️',
      category: 'Web App',
      updatedBy: 'Emma Wilson',
      previewUrl: '#'
    },
    {
      id: 2,
      title: 'Mobile App Screens',
      description: 'Complete set of mobile app screens',
      version: 'v1.5',
      date: '2023-10-12',
      status: 'In Review',
      thumbnail: '📱',
      category: 'Mobile',
      updatedBy: 'James Lee',
      previewUrl: '#'
    },
    {
      id: 3,
      title: 'Landing Page',
      description: 'Marketing landing page design',
      version: 'v1.0',
      date: '2023-10-05',
      status: 'Draft',
      thumbnail: '🌐',
      category: 'Marketing',
      updatedBy: 'Sophia Chen',
      previewUrl: '#'
    },
    {
      id: 4,
      title: 'Admin Panel',
      description: 'Admin interface with data visualization',
      version: 'v3.2',
      date: '2023-09-28',
      status: 'In Progress',
      thumbnail: '📊',
      category: 'Web App',
      updatedBy: 'David Kim',
      previewUrl: '#'
    },
  ];

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'in review':
        return 'status-review';
      case 'in progress':
        return 'status-progress';
      case 'draft':
      default:
        return 'status-draft';
    }
  };

  return (
    <div className="mockups-container">
      <div className="mockups-header">
        <div>
          <h2>Mockups</h2>
          <p>High-fidelity designs and visual mockups</p>
        </div>
        <button className="btn-primary">
          <span className="btn-icon">+</span> New Mockup
        </button>
      </div>

      <div className="mockups-toolbar">
        <div className="search-box">
          <input type="text" placeholder="Search mockups..." />
          <span className="search-icon">🔍</span>
        </div>
        <div className="filter-group">
          <select>
            <option>All Categories</option>
            <option>Web App</option>
            <option>Mobile</option>
            <option>Marketing</option>
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

      <div className="mockups-grid">
        {mockups.map((mockup) => (
          <div key={mockup.id} className="mockup-card">
            <div className="mockup-thumbnail">
              <div className="thumbnail-content">
                {mockup.thumbnail}
              </div>
              <div className={`status-badge ${getStatusClass(mockup.status)}`}>
                {mockup.status}
              </div>
              <a href={mockup.previewUrl} className="preview-overlay" target="_blank" rel="noopener noreferrer">
                View Preview
              </a>
            </div>
            <div className="mockup-details">
              <div className="mockup-header">
                <h3>{mockup.title}</h3>
                <span className="version">{mockup.version}</span>
              </div>
              <p className="description">{mockup.description}</p>
              <div className="mockup-meta">
                <span className="category">{mockup.category}</span>
                <span className="date">Updated {mockup.date}</span>
              </div>
              <div className="mockup-footer">
                <div className="updated-by">
                  <span className="avatar">{mockup.updatedBy.charAt(0)}</span>
                  <span>{mockup.updatedBy}</span>
                </div>
                <div className="actions">
                  <a href={mockup.previewUrl} className="btn-icon" title="Preview" target="_blank" rel="noopener noreferrer">👁️</a>
                  <button className="btn-icon" title="Edit">✏️</button>
                  <button className="btn-icon" title="More">⋮</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mockups;