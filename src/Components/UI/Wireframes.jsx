import React from 'react';
import { Link } from 'react-router-dom';
import './Wireframes.css';
import { deliverableAPI } from '../../services/api';

const Wireframes = () => {
  const [wireframes, setWireframes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await deliverableAPI.getAll({ stage: 'UI/UX', type: 'Wireframe' });
        setWireframes(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  // Mock wireframe data
  const wireframes = [
    {
      id: 1,
      title: 'Dashboard Layout',
      description: 'Main dashboard with analytics and quick actions',
      version: 'v1.2',
      date: '2023-10-15',
      status: 'In Review',
      thumbnail: '📊',
      category: 'Web App',
      updatedBy: 'Alex Johnson'
    },
    {
      id: 2,
      title: 'Mobile Navigation',
      description: 'Mobile menu and navigation patterns',
      version: 'v2.0',
      date: '2023-10-10',
      status: 'Approved',
      thumbnail: '📱',
      category: 'Mobile',
      updatedBy: 'Sarah Kim'
    },
    {
      id: 3,
      title: 'Checkout Flow',
      description: 'Step-by-step checkout process',
      version: 'v1.0',
      date: '2023-10-05',
      status: 'Draft',
      thumbnail: '🛒',
      category: 'E-commerce',
      updatedBy: 'Mike Chen'
    },
    {
      id: 4,
      title: 'User Profile',
      description: 'User profile and settings page',
      version: 'v1.5',
      date: '2023-09-28',
      status: 'In Progress',
      thumbnail: '👤',
      category: 'Web App',
      updatedBy: 'Emma Davis'
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
    <div className="wireframes-container">
      <div className="wireframes-header">
        <div>
          <h2>Wireframes</h2>
          <p>Low-fidelity layouts and structure for your projects</p>
        </div>
        <button className="btn-primary">
          <span className="btn-icon">+</span> New Wireframe
        </button>
      </div>

      <div className="wireframes-toolbar">
        <div className="search-box">
          <input type="text" placeholder="Search wireframes..." />
          <span className="search-icon">🔍</span>
        </div>
        <div className="filter-group">
          <select>
            <option>All Categories</option>
            <option>Web App</option>
            <option>Mobile</option>
            <option>E-commerce</option>
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

      <div className="wireframes-grid">
        {wireframes.map((wireframe) => (
          <div key={wireframe.id} className="wireframe-card">
            <div className="wireframe-thumbnail">
              <div className="thumbnail-content">
                {wireframe.thumbnail}
              </div>
              <div className={`status-badge ${getStatusClass(wireframe.status)}`}>
                {wireframe.status}
              </div>
            </div>
            <div className="wireframe-details">
              <div className="wireframe-header">
                <h3>{wireframe.title}</h3>
                <span className="version">{wireframe.version}</span>
              </div>
              <p className="description">{wireframe.description}</p>
              <div className="wireframe-meta">
                <span className="category">{wireframe.category}</span>
                <span className="date">Updated {wireframe.date}</span>
              </div>
              <div className="wireframe-footer">
                <div className="updated-by">
                  <span className="avatar">{wireframe.updatedBy.charAt(0)}</span>
                  <span>{wireframe.updatedBy}</span>
                </div>
                <div className="actions">
                  <button className="btn-icon" title="Preview">👁️</button>
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

export default Wireframes;