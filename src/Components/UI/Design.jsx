import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './Design.css';

const Design = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('wireframes');

  // Update active tab based on URL
  React.useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (['wireframes', 'mockups', 'prototypes'].includes(path)) {
      setActiveTab(path);
    }
  }, [location]);

  return (
    <div className="design-container">
      <div className="design-header">
        <h1>UI/UX Design</h1>
        <p>Manage your design assets and prototypes in one place</p>
      </div>

      <div className="design-tabs">
        <Link 
          to="wireframes" 
          className={`tab ${activeTab === 'wireframes' ? 'active' : ''}`}
          onClick={() => setActiveTab('wireframes')}
        >
          <span className="tab-icon">📐</span>
          <span className="tab-label">Wireframes</span>
        </Link>
        
        <Link 
          to="mockups" 
          className={`tab ${activeTab === 'mockups' ? 'active' : ''}`}
          onClick={() => setActiveTab('mockups')}
        >
          <span className="tab-icon">🎨</span>
          <span className="tab-label">Mockups</span>
        </Link>
        
        <Link 
          to="prototypes" 
          className={`tab ${activeTab === 'prototypes' ? 'active' : ''}`}
          onClick={() => setActiveTab('prototypes')}
        >
          <span className="tab-icon">🖥️</span>
          <span className="tab-label">Prototypes</span>
        </Link>
      </div>

      <div className="design-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Design;