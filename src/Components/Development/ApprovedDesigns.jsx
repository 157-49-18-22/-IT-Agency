import React, { useState, useEffect } from 'react';
import { FaImage, FaDownload, FaExternalLinkAlt, FaSearch, FaFilter, FaEye } from 'react-icons/fa';
import axios from 'axios';
import './ApprovedDesigns.css';

const ApprovedDesigns = () => {
    const [wireframes, setWireframes] = useState([]);
    const [mockups, setMockups] = useState([]);
    const [prototypes, setPrototypes] = useState([]);
    const [activeTab, setActiveTab] = useState('wireframes');
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDesign, setSelectedDesign] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchApprovedDesigns();
    }, []);

    const fetchApprovedDesigns = async () => {
        try {
            setIsLoading(true);
            const [wireframesRes, mockupsRes, prototypesRes] = await Promise.all([
                axios.get('/api/wireframes?status=approved'),
                axios.get('/api/mockups?status=approved'),
                axios.get('/api/prototypes?status=approved')
            ]);

            setWireframes(wireframesRes.data.wireframes || wireframesRes.data || []);
            setMockups(mockupsRes.data.mockups || mockupsRes.data || []);
            setPrototypes(prototypesRes.data.prototypes || prototypesRes.data || []);
        } catch (error) {
            console.error('Error fetching approved designs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getCurrentData = () => {
        switch (activeTab) {
            case 'wireframes':
                return wireframes;
            case 'mockups':
                return mockups;
            case 'prototypes':
                return prototypes;
            default:
                return [];
        }
    };

    const filteredData = getCurrentData().filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewDetails = (design) => {
        setSelectedDesign(design);
        setShowModal(true);
    };

    const handleDownload = async (design) => {
        try {
            const response = await fetch(`http://localhost:5000${design.imageUrl}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${design.title}.png`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="approved-designs-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading approved designs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="approved-designs-container">
            <div className="page-header">
                <div className="header-content">
                    <h1>Approved Design Files</h1>
                    <p>Access all approved wireframes, mockups, and prototypes</p>
                </div>
            </div>

            <div className="design-tabs">
                <button
                    className={`tab-button ${activeTab === 'wireframes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('wireframes')}
                >
                    <FaImage /> Wireframes ({wireframes.length})
                </button>
                <button
                    className={`tab-button ${activeTab === 'mockups' ? 'active' : ''}`}
                    onClick={() => setActiveTab('mockups')}
                >
                    <FaImage /> Mockups ({mockups.length})
                </button>
                <button
                    className={`tab-button ${activeTab === 'prototypes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('prototypes')}
                >
                    <FaImage /> Prototypes ({prototypes.length})
                </button>
            </div>

            <div className="search-filter-bar">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search designs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="designs-grid">
                {filteredData.length > 0 ? (
                    filteredData.map((design) => (
                        <div key={design.id} className="design-card">
                            <div className="design-image">
                                {design.imageUrl ? (
                                    <img
                                        src={`http://localhost:5000${design.imageUrl}`}
                                        alt={design.title}
                                        onError={(e) => {
                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                                        }}
                                    />
                                ) : (
                                    <div className="no-image">
                                        <FaImage size={48} />
                                        <span>No preview available</span>
                                    </div>
                                )}
                                <div className="design-overlay">
                                    <button
                                        className="overlay-button"
                                        onClick={() => handleViewDetails(design)}
                                    >
                                        <FaEye /> View Details
                                    </button>
                                </div>
                            </div>
                            <div className="design-info">
                                <h3>{design.title}</h3>
                                {design.description && <p>{design.description}</p>}
                                <div className="design-meta">
                                    <span className="version">v{design.version}</span>
                                    <span className="category">{design.category}</span>
                                </div>
                                <div className="design-actions">
                                    <button
                                        className="action-button download"
                                        onClick={() => handleDownload(design)}
                                    >
                                        <FaDownload /> Download
                                    </button>
                                    {design.link && (
                                        <a
                                            href={design.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="action-button link"
                                        >
                                            <FaExternalLinkAlt /> Open Link
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <FaImage size={64} />
                        <h3>No approved {activeTab} found</h3>
                        <p>Approved designs will appear here once available</p>
                    </div>
                )}
            </div>

            {/* Design Details Modal */}
            {showModal && selectedDesign && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        <div className="modal-header">
                            <h2>{selectedDesign.title}</h2>
                            <span className="modal-version">Version {selectedDesign.version}</span>
                        </div>
                        <div className="modal-body">
                            <div className="modal-image">
                                <img
                                    src={`http://localhost:5000${selectedDesign.imageUrl}`}
                                    alt={selectedDesign.title}
                                />
                            </div>
                            <div className="modal-details">
                                <div className="detail-row">
                                    <label>Description:</label>
                                    <p>{selectedDesign.description || 'No description provided'}</p>
                                </div>
                                <div className="detail-row">
                                    <label>Category:</label>
                                    <p>{selectedDesign.category}</p>
                                </div>
                                <div className="detail-row">
                                    <label>Status:</label>
                                    <span className="status-badge approved">Approved</span>
                                </div>
                                {selectedDesign.link && (
                                    <div className="detail-row">
                                        <label>Prototype Link:</label>
                                        <a href={selectedDesign.link} target="_blank" rel="noopener noreferrer">
                                            {selectedDesign.link}
                                        </a>
                                    </div>
                                )}
                                <div className="detail-row">
                                    <label>Created By:</label>
                                    <p>{selectedDesign.creator?.name || 'Unknown'}</p>
                                </div>
                                <div className="detail-row">
                                    <label>Approved Date:</label>
                                    <p>{new Date(selectedDesign.approvedAt || selectedDesign.updatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="modal-button download"
                                onClick={() => handleDownload(selectedDesign)}
                            >
                                <FaDownload /> Download
                            </button>
                            {selectedDesign.link && (
                                <a
                                    href={selectedDesign.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="modal-button link"
                                >
                                    <FaExternalLinkAlt /> Open Prototype
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApprovedDesigns;
