import React, { useState } from 'react';
import { FaDownload, FaEye, FaFilter, FaFileAlt, FaImage, FaFilePdf } from 'react-icons/fa';
import './ClientPortal.css';

const DeliverablesView = () => {
    const [filter, setFilter] = useState('all');
    const [deliverables] = useState([
        { id: 1, name: 'Homepage Wireframe.pdf', stage: 'UI/UX', type: 'pdf', size: '2.4 MB', date: '2024-01-08', status: 'Approved' },
        { id: 2, name: 'Dashboard Mockup.fig', stage: 'UI/UX', type: 'figma', size: '5.1 MB', date: '2024-01-15', status: 'Approved' },
        { id: 3, name: 'Interactive Prototype', stage: 'UI/UX', type: 'link', size: '-', date: '2024-01-20', status: 'Approved' },
        { id: 4, name: 'Sprint 1 Report.pdf', stage: 'Development', type: 'pdf', size: '1.2 MB', date: '2024-02-03', status: 'Delivered' },
        { id: 5, name: 'API Documentation.pdf', stage: 'Development', type: 'pdf', size: '3.5 MB', date: '2024-02-10', status: 'Delivered' }
    ]);

    const filteredDeliverables = filter === 'all'
        ? deliverables
        : deliverables.filter(d => d.stage.toLowerCase().includes(filter.toLowerCase()));

    const getFileIcon = (type) => {
        switch (type) {
            case 'pdf': return <FaFilePdf />;
            case 'figma': return <FaImage />;
            case 'link': return <FaFileAlt />;
            default: return <FaFileAlt />;
        }
    };

    return (
        <div className="deliverables-page">
            <div className="page-header">
                <h1>Deliverables</h1>
                <p>Download and view all project deliverables</p>
            </div>

            {/* Filter */}
            <div className="filter-section">
                <FaFilter />
                <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
                <button className={filter === 'uiux' ? 'active' : ''} onClick={() => setFilter('uiux')}>UI/UX</button>
                <button className={filter === 'development' ? 'active' : ''} onClick={() => setFilter('development')}>Development</button>
                <button className={filter === 'testing' ? 'active' : ''} onClick={() => setFilter('testing')}>Testing</button>
            </div>

            {/* Deliverables List */}
            <div className="deliverables-table">
                <table>
                    <thead>
                        <tr>
                            <th>File Name</th>
                            <th>Stage</th>
                            <th>Type</th>
                            <th>Size</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDeliverables.map(item => (
                            <tr key={item.id}>
                                <td>
                                    <div className="file-name">
                                        {getFileIcon(item.type)}
                                        <span>{item.name}</span>
                                    </div>
                                </td>
                                <td><span className="stage-tag">{item.stage}</span></td>
                                <td>{item.type.toUpperCase()}</td>
                                <td>{item.size}</td>
                                <td>{new Date(item.date).toLocaleDateString()}</td>
                                <td><span className="status-badge approved">{item.status}</span></td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-icon" title="View"><FaEye /></button>
                                        <button className="btn-icon" title="Download"><FaDownload /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DeliverablesView;
