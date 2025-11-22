import React, { useEffect, useMemo, useState, useRef } from 'react';
import { 
  FiUploadCloud, FiGrid, FiList, FiSearch, FiFilter, 
  FiDownload, FiEye, FiShare2, FiFile, FiFolder, 
  FiX, FiCheck, FiClock, FiAlertCircle, FiUpload
} from 'react-icons/fi';
import './Deliverables.css';
import { deliverableAPI, uploadAPI } from '../services/api';
import { format } from 'date-fns';

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to get file type from filename
const getFileType = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz'];
  const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  const codeTypes = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'hpp'];
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
  
  if (archiveTypes.includes(extension)) return 'Archive';
  if (documentTypes.includes(extension)) return 'Document';
  if (codeTypes.includes(extension)) return 'Code';
  if (imageTypes.includes(extension)) return 'Image';
  if (extension === 'yaml' || extension === 'yml') return 'YAML';
  if (extension === 'apk') return 'APK';
  return 'File';
};

export default function Deliverables() {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [file, setFile] = useState(null);
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState([]);
  const [description, setDescription] = useState('');
  const [view, setView] = useState('grid');
  const fileInputRef = useRef(null);
  
  // Available stages and types for filtering
  const stages = ['All', 'UI/UX', 'Development', 'Testing', 'Deployment', 'Completed'];
  const types = ['All', 'Document', 'Code', 'Image', 'Archive', 'YAML', 'APK', 'Other'];

  // Fetch projects when component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectAPI.getAll();
        // If no projects are returned, use sample projects
        if (!response.data || response.data.length === 0) {
          const sampleProjects = [
            { id: 1, name: 'E-commerce Website' },
            { id: 2, name: 'Mobile App Development' },
            { id: 3, name: 'Company Website Redesign' },
            { id: 4, name: 'Internal Dashboard' },
            { id: 5, name: 'Marketing Campaign 2023' }
          ];
          setProjects(sampleProjects);
        } else {
          setProjects(response.data);
        }
      } catch (error) {
        console.error('Error fetching projects, using sample data:', error);
        // Use sample projects if there's an error
        const sampleProjects = [
          { id: 1, name: 'E-commerce Website' },
          { id: 2, name: 'Mobile App Development' },
          { id: 3, name: 'Company Website Redesign' }
        ];
        setProjects(sampleProjects);
      }
    };
    
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchDeliverables();
  }, []);

  const fetchDeliverables = async () => {
    try {
      setLoading(true);
      const response = await deliverableAPI.getAll();
      console.log('API Response:', response); // Debug log
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Unexpected API response format:', response);
        alert('Failed to load deliverables: Invalid response format');
        return;
      }

      // Transform the API response to match the expected format
      const formattedDeliverables = response.data.map(item => {
        // Extract file information
        const fileName = item.fileName || item.name || 'unknown';
        const fileSize = item.size || 0;
        const fileType = item.type || getFileType(fileName);
        const fileUrl = item.fileUrl || `/uploads/${fileName}`;
        const projectName = item.project ? item.project.name : 'No Project';
        
        return {
          _id: item.id || item._id || Math.random().toString(36).substr(2, 9),
          name: item.name || fileName,
          filename: fileName,
          size: formatFileSize(fileSize),
          type: fileType,
          date: format(new Date(item.createdAt || new Date()), 'yyyy-MM-dd'),
          project: projectName,
          status: item.status || 'Draft',
          version: item.version || '1.0.0',
          fileUrl: fileUrl,
          // Include additional fields that might be needed
          ...item
        };
      });

      console.log('Formatted Deliverables:', formattedDeliverables);
      setDeliverables(formattedDeliverables);
    } catch (error) {
      console.error('Error fetching deliverables:', error);
      alert('Failed to load deliverables. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-detect project ID from filename if not set
      if (!projectId) {
        // Try to find a matching project based on filename prefix
        const projectNamePrefix = selectedFile.name.split('_')[0].toLowerCase();
        const matchingProject = projects.find(p => 
          p.name.toLowerCase().includes(projectNamePrefix) || 
          p.id.toString() === projectNamePrefix
        );
        if (matchingProject) {
          setProjectId(matchingProject.id);
        }
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !projectId) {
      alert('Please select a file and a project');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      
      // First upload the file
      const uploadResponse = await uploadAPI.single(file, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      });

      // Debug log the upload response
      console.log('Upload Response:', uploadResponse);
      
      // Then create the deliverable record
      const deliverableData = {
        name: file.name,
        fileName: uploadResponse.data.filename || file.name, // Fallback to file.name if filename is not in response
        projectId: projectId, // Using the project ID from the select
        description: description || 'No description provided',
        type: getFileType(file.name), // Required field
        fileType: getFileType(file.name),
        fileSize: file.size,
        fileUrl: uploadResponse.data.path || uploadResponse.data.fileUrl || `/uploads/${uploadResponse.data.filename}`, // Multiple fallbacks
        status: 'Draft',
        phase: 'Initial', // Required field - defaulting to 'Initial'
        version: '1.0.0' // Adding a default version
      };
      
      // Debug log the data being sent
      console.log('Deliverable Data:', deliverableData);

      await deliverableAPI.create(deliverableData);
      
      // Reset form and refresh list
      setFile(null);
      setProjectId('');
      setDescription('');
      setShowUploadModal(false);
      fetchDeliverables();
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const submitForApproval = async (id) => {
    if (!window.confirm('Are you sure you want to submit this deliverable for approval?')) {
      return;
    }
    
    try {
      await deliverableAPI.update(id, { status: 'Pending Approval' });
      fetchDeliverables();
      alert('Deliverable submitted for approval');
    } catch (error) {
      console.error('Error submitting for approval:', error);
      alert('Failed to submit for approval. Please try again.');
    }
  };

  const downloadFile = async (id, filename) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/uploads/${filename}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const filteredDeliverables = useMemo(() => {
    return deliverables.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.project && item.project.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStage = selectedStage === 'All' || item.stage === selectedStage;
      const matchesType = selectedType === 'All' || item.type === selectedType;
      
      return matchesSearch && matchesStage && matchesType;
    });
  }, [deliverables, searchTerm, selectedStage, selectedType]);

  const getStatusBadge = (status) => {
    const statusMap = {
      'Draft': { color: 'gray', icon: <FiFile /> },
      'Pending Approval': { color: 'orange', icon: <FiClock /> },
      'Approved': { color: 'green', icon: <FiCheck /> },
      'Rejected': { color: 'red', icon: <FiX /> }
    };
    
    const statusInfo = statusMap[status] || { color: 'gray', icon: <FiAlertCircle /> };
    
    return (
      <span className={`pill status ${statusInfo.color}`}>
        {statusInfo.icon} {status}
      </span>
    );
  };

  return (
    <div className="deliverables">
      <div className="head">
        <div className="title">Deliverables</div>
        <div className="actions">
          <button 
            className="upload" 
            onClick={() => setShowUploadModal(true)}
          >
            <FiUploadCloud/> Upload Files
          </button>
          <div className="toggle">
            <button 
              className={`icon ${view==='grid'?'active':''}`} 
              onClick={()=>setView('grid')}
              title="Grid View"
            >
              <FiGrid/>
            </button>
            <button 
              className={`icon ${view==='list'?'active':''}`} 
              onClick={()=>setView('list')}
              title="List View"
            >
              <FiList/>
            </button>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <FiSearch/>
          <input 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            placeholder="Search files, projects..." 
          />
        </div>
        <div className="filters">
          <FiFilter/>
          <select 
            value={selectedStage} 
            onChange={e => setSelectedStage(e.target.value)}
            className="filter-select"
          >
            {stages.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select 
            value={selectedType} 
            onChange={e => setSelectedType(e.target.value)}
            className="filter-select"
          >
            {types.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading deliverables...</div>
      ) : filteredDeliverables.length === 0 ? (
        <div className="empty-state">
          <FiFile size={48} className="empty-icon" />
          <h3>No deliverables found</h3>
          <p>Upload your first deliverable to get started</p>
          <button 
            className="primary" 
            onClick={() => setShowUploadModal(true)}
          >
            <FiUploadCloud /> Upload File
          </button>
        </div>
      ) : (

        <>
          {view === 'grid' ? (
            <div className="grid">
              {filteredDeliverables.map(item => (
                <div key={item._id} className="card">
                  <div className="file-icon">
                    {item.type === 'Archive' ? <FiFolder size={32} /> : <FiFile size={32} />}
                  </div>
                  <div className="name" title={item.name}>
                    {item.name}
                  </div>
                  <div className="meta">
                    <span className="project" title={item.project}>
                      {item.project}
                    </span>
                    <span className="sep">•</span>
                    <span>{item.size}</span>
                  </div>
                  <div className="badges">
                    <span className="pill version">v{item.version || '1.0'}</span>
                    {getStatusBadge(item.status || 'Draft')}
                    <span className="pill stage">{item.stage || 'Development'}</span>
                  </div>
                  <div className="card-actions">
                    <button 
                      className="ghost" 
                      onClick={() => window.open(`${process.env.REACT_APP_API_URL}/api/uploads/${item.filename}`, '_blank')}
                      title="Preview"
                    >
                      <FiEye/> Preview
                    </button>
                    <button 
                      className="ghost" 
                      onClick={() => downloadFile(item._id, item.filename)}
                      title="Download"
                    >
                      <FiDownload/> Download
                    </button>
                    {item.status === 'Draft' && (
                      <button 
                        className="primary" 
                        onClick={() => submitForApproval(item._id)}
                        title="Submit for Approval"
                      >
                        <FiShare2/> Submit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="list">
              <div className="list-head">
                <div className="cell w-30">File</div>
                <div className="cell w-20">Project</div>
                <div className="cell w-15">Status</div>
                <div className="cell w-15">Stage</div>
                <div className="cell w-10">Size</div>
                <div className="cell w-10">Date</div>
                <div className="cell w-10 right">Actions</div>
              </div>
              {filteredDeliverables.map(item => (
                <div key={item._id} className="row">
                  <div className="cell w-30 ellipsis" title={item.name}>
                    <FiFile className="file-icon" /> {item.name}
                  </div>
                  <div className="cell w-20 ellipsis" title={item.project}>
                    {item.project}
                  </div>
                  <div className="cell w-15">
                    {getStatusBadge(item.status || 'Draft')}
                  </div>
                  <div className="cell w-15">
                    <span className="pill stage">{item.stage || 'Development'}</span>
                  </div>
                  <div className="cell w-10">{item.size}</div>
                  <div className="cell w-10" title={new Date(item.date).toLocaleDateString()}>
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="cell w-10 right actions">
                    <button 
                      className="ghost" 
                      onClick={() => window.open(`${process.env.REACT_APP_API_URL}/api/uploads/${item.filename}`, '_blank')}
                      title="Preview"
                    >
                      <FiEye/>
                    </button>
                    <button 
                      className="ghost" 
                      onClick={() => downloadFile(item._id, item.filename)}
                      title="Download"
                    >
                      <FiDownload/>
                    </button>
                    {item.status === 'Draft' && (
                      <button 
                        className="primary" 
                        onClick={() => submitForApproval(item._id)}
                        title="Submit for Approval"
                      >
                        <FiShare2/>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Upload New Deliverable</h3>
              <button 
                className="close-button" 
                onClick={() => {
                  setShowUploadModal(false);
                  setFile(null);
                  setProjectId('');
                  setDescription('');
                }}
              >
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpload}>
                <div className="form-group">
                  <label>File</label>
                  <div 
                    className={`file-upload ${file ? 'has-file' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {file ? (
                      <div className="file-info">
                        <FiFile size={24} />
                        <span>{file.name}</span>
                        <span className="file-size">{formatFileSize(file.size)}</span>
                      </div>
                    ) : (
                      <div className="upload-prompt">
                        <FiUpload size={32} />
                        <span>Click to select a file or drag and drop</span>
                      </div>
                    )}
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      onChange={handleFileChange}
                      style={{ display: 'none' }} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="project">Project</label>
                  <select
                    id="project"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    required
                    className="form-control"
                  >
                    <option value="">Select a project</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description (Optional)</label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description for this deliverable"
                    rows="3"
                  />
                </div>

                {uploading && (
                  <div className="upload-progress">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                    <span>Uploading... {uploadProgress}%</span>
                  </div>
                )}

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="secondary"
                    onClick={() => setShowUploadModal(false)}
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="primary"
                    disabled={!file || !projectId || uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Deliverable'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
