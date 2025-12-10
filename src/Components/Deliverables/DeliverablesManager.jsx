import React, { useState, useCallback } from 'react';
import { FaUpload, FaFile, FaImage, FaFilePdf, FaFileArchive, FaTrash, FaDownload, FaEye } from 'react-icons/fa';
import './DeliverablesManager.css';

const DeliverablesManager = ({ projectId, stageId }) => {
    const [deliverables, setDeliverables] = useState([
        {
            id: 1,
            name: 'Homepage Wireframes.pdf',
            type: 'pdf',
            size: '2.5 MB',
            uploadedBy: 'John Doe',
            uploadedAt: '2024-01-10',
            status: 'approved',
            version: 'v1.0'
        },
        {
            id: 2,
            name: 'Design Mockups.zip',
            type: 'zip',
            size: '15.8 MB',
            uploadedBy: 'Jane Smith',
            uploadedAt: '2024-01-12',
            status: 'pending',
            version: 'v2.0'
        },
        {
            id: 3,
            name: 'Logo Design.png',
            type: 'image',
            size: '850 KB',
            uploadedBy: 'Mike Johnson',
            uploadedAt: '2024-01-15',
            status: 'approved',
            version: 'v1.0'
        }
    ]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    }, []);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = async (files) => {
        setUploading(true);

        // TODO: Replace with actual API call
        // const formData = new FormData();
        // formData.append('file', files[0]);
        // formData.append('projectId', projectId);
        // formData.append('stageId', stageId);
        // await deliverablesAPI.upload(formData);

        // Simulate upload
        setTimeout(() => {
            const newDeliverable = {
                id: Date.now(),
                name: files[0].name,
                type: getFileType(files[0].name),
                size: formatFileSize(files[0].size),
                uploadedBy: 'Current User',
                uploadedAt: new Date().toISOString().split('T')[0],
                status: 'pending',
                version: 'v1.0'
            };

            setDeliverables([newDeliverable, ...deliverables]);
            setUploading(false);
        }, 1500);
    };

    const getFileType = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
        if (ext === 'pdf') return 'pdf';
        if (['zip', 'rar'].includes(ext)) return 'zip';
        return 'file';
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (type) => {
        switch (type) {
            case 'image': return <FaImage />;
            case 'pdf': return <FaFilePdf />;
            case 'zip': return <FaFileArchive />;
            default: return <FaFile />;
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this file?')) {
            setDeliverables(deliverables.filter(d => d.id !== id));
            // TODO: Call API to delete
        }
    };

    const handleDownload = (deliverable) => {
        // TODO: Implement actual download
        console.log('Downloading:', deliverable.name);
    };

    const handlePreview = (deliverable) => {
        // TODO: Implement preview modal
        console.log('Previewing:', deliverable.name);
    };

    return (
        <div className="deliverables-manager">
            <div className="deliverables-header">
                <h1>Deliverables</h1>
                <p>Upload and manage project deliverables</p>
            </div>

            {/* Upload Area */}
            <div
                className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    onChange={handleChange}
                    style={{ display: 'none' }}
                    multiple
                />

                {uploading ? (
                    <div className="upload-progress">
                        <div className="spinner"></div>
                        <p>Uploading...</p>
                    </div>
                ) : (
                    <>
                        <FaUpload className="upload-icon" />
                        <h3>Drag & Drop files here</h3>
                        <p>or</p>
                        <label htmlFor="file-upload" className="btn-upload">
                            Choose Files
                        </label>
                        <p className="upload-hint">Supported: Images, PDF, ZIP (Max 50MB)</p>
                    </>
                )}
            </div>

            {/* Deliverables List */}
            <div className="deliverables-section">
                <h2>Uploaded Files ({deliverables.length})</h2>

                <div className="deliverables-grid">
                    {deliverables.map(deliverable => (
                        <div key={deliverable.id} className="deliverable-card">
                            <div className="file-icon-wrapper">
                                <div className={`file-icon ${deliverable.type}`}>
                                    {getFileIcon(deliverable.type)}
                                </div>
                                <span className={`status-badge ${deliverable.status}`}>
                                    {deliverable.status}
                                </span>
                            </div>

                            <div className="file-info">
                                <h4 className="file-name">{deliverable.name}</h4>
                                <div className="file-meta">
                                    <span className="file-size">{deliverable.size}</span>
                                    <span className="file-version">{deliverable.version}</span>
                                </div>
                                <div className="file-details">
                                    <span>By {deliverable.uploadedBy}</span>
                                    <span>{new Date(deliverable.uploadedAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="file-actions">
                                <button
                                    className="action-btn preview"
                                    onClick={() => handlePreview(deliverable)}
                                    title="Preview"
                                >
                                    <FaEye />
                                </button>
                                <button
                                    className="action-btn download"
                                    onClick={() => handleDownload(deliverable)}
                                    title="Download"
                                >
                                    <FaDownload />
                                </button>
                                <button
                                    className="action-btn delete"
                                    onClick={() => handleDelete(deliverable.id)}
                                    title="Delete"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {deliverables.length === 0 && (
                    <div className="empty-state">
                        <FaFile className="empty-icon" />
                        <p>No deliverables uploaded yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliverablesManager;
