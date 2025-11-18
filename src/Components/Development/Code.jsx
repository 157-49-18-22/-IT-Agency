import React, { useState, useEffect } from 'react';
import { FiCode, FiGitBranch, FiClock, FiUser, FiAlertCircle, FiCheckCircle, FiEdit2, FiTrash2, FiPlus, FiSearch, FiFilter, FiEye } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Prism as SyntaxHighlighter } from 'prism-react-renderer';
import './Code.css';
import { codeAPI } from '../../services/api';

const Code = () => {
  // State declarations at the top
  // State declarations at the top
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([
    {
      id: 1,
      name: 'App.jsx',
      content: `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;`,
      language: 'javascript',
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Current User',
      path: '/src',
      branch: 'main',
      issues: 0
    },
    {
      id: 2,
      name: 'index.css',
      content: `:root {
        --primary: #4f46e5;
        --secondary: #7c3aed;
        --text: #1f2937;
        --bg: #f9fafb;
      }
      
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background-color: var(--bg);
        color: var(--text);
      }`,
      language: 'css',
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Current User',
      path: '/src',
      branch: 'main',
      issues: 0
    }
  ]);

  const [activeFile, setActiveFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false);
  const [newFile, setNewFile] = useState({
    name: '',
    content: '',
    language: 'javascript'
  });

  // Fetch files function is defined inside the useEffect

  const handleFileSelect = (file) => {
    setActiveFile(file);
  };

  const handleFileUpdate = async (content) => {
    if (!activeFile) return;
    
    try {
      const updatedFile = {
        ...activeFile,
        content,
        lastUpdated: new Date().toISOString()
      };
      
      // Update local state immediately for better UX
      setFiles(prevFiles => 
        prevFiles.map(file => 
          file.id === activeFile.id ? updatedFile : file
        )
      );
      setActiveFile(updatedFile);
      
      // Call API to update the file
      await codeAPI.update(activeFile.id, { content });
      
      // Show success message
      toast.success('File saved successfully!');
    } catch (error) {
      console.error('Error updating file:', error);
      toast.error('Failed to save file. Please try again.');
      
      // Revert local state on error
      setActiveFile(prevFile => ({
        ...prevFile,
        content: activeFile.content // Revert to previous content
      }));
    }
  };

  const handleCreateFile = async () => {
    if (!newFile.name.trim()) {
      setError('File name is required');
      return;
    }

    // Basic validation for file name
    const invalidChars = /[<>:"\/\\|?*\x00-\x1F]/g;
    if (invalidChars.test(newFile.name)) {
      setError('File name contains invalid characters');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const extension = newFile.language === 'javascript' ? 'js' : newFile.language;
      const fileName = newFile.name.endsWith(`.${extension}`) 
        ? newFile.name 
        : `${newFile.name}.${extension}`;
      
      // Prepare the data according to the backend's expected format
      const fileData = {
        name: fileName,  // Required field
        content: newFile.content || `// New ${newFile.language} file\n`,
        language: newFile.language.toLowerCase(), // Ensure lowercase language
        path: '/src'
      };
      
      // Get project ID from URL or use a default value (1 for now)
      const pathSegments = window.location.pathname.split('/');
      let projectId = 1; // Default project ID if not found in URL
      
      // Try to get project ID from URL
      const urlProjectId = pathSegments[pathSegments.length - 1];
      if (urlProjectId && !isNaN(parseInt(urlProjectId, 10))) {
        projectId = parseInt(urlProjectId, 10);
      }
      
      // Always include projectId as it's required by the backend
      fileData.projectId = projectId;
      
      console.log('Creating file with data:', fileData);
      
      // Call the API to create the file
      const response = await codeAPI.create(fileData);
      
      console.log('API Response:', response);
      
      if (response.data) {
        // Format the new file data to match the frontend's expected structure
        const newFileData = {
          id: response.data.id || Date.now(),
          name: response.data.name,
          content: response.data.content,
          language: response.data.language,
          path: response.data.path || '/src',
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Current User',
          branch: 'main',
          issues: 0
        };
        
        // Update local state with the new file
        setFiles(prevFiles => [...prevFiles, newFileData]);
        setActiveFile(newFileData);
        setNewFile({ name: '', content: '', language: 'javascript' });
        setIsNewFileModalOpen(false);
        
        // Show success message
        toast.success('File created successfully!');
      }
    } catch (error) {
      console.error('Error creating file:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Failed to create file. Please try again.';
      
      if (error.response?.data?.errors) {
        // Handle validation errors from backend
        errorMessage = error.response.data.errors.map(err => err.msg).join(' ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFile = (id) => {
    const newFiles = files.filter(file => file.id !== id);
    setFiles(newFiles);
    if (activeFile && activeFile.id === id) {
      setActiveFile(newFiles[0] || null);
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.content && file.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getLanguageIcon = (language) => {
    switch(language) {
      case 'javascript':
        return <span className="file-icon">JS</span>;
      case 'css':
        return <span className="file-icon">CSS</span>;
      case 'html':
        return <span className="file-icon">HTML</span>;
      default:
        return <FiCode className="file-icon" />;
    }
  };

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'css', label: 'CSS' },
    { value: 'html', label: 'HTML' },
    { value: 'json', label: 'JSON' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' }
  ];

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const updated = new Date(dateString);
    const diffInHours = Math.floor((now - updated) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  // Fetch files when component mounts
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setIsLoading(true);
        // Get project ID from URL or use a default value (1 for now)
        const pathSegments = window.location.pathname.split('/');
        let projectId = 1; // Default project ID if not found in URL
        
        // Try to get project ID from URL
        const urlProjectId = pathSegments[pathSegments.length - 1];
        if (urlProjectId && !isNaN(parseInt(urlProjectId, 10))) {
          projectId = parseInt(urlProjectId, 10);
        }
        
        // Fetch files for the current project
        const response = await codeAPI.getByProject(projectId);
        
        if (response.data && response.data.length > 0) {
          // Format the files to match the expected structure
          const formattedFiles = response.data.map(file => ({
            id: file.id,
            name: file.name,
            content: file.content || '',
            language: file.language || 'javascript',
            path: file.path || '/src',
            lastUpdated: file.updatedAt || new Date().toISOString(),
            updatedBy: file.updatedBy || 'Current User',
            branch: file.branch || 'main',
            issues: file.issues || 0
          }));
          
          setFiles(formattedFiles);
          if (!activeFile) {
            setActiveFile(formattedFiles[0]);
          }
        } else {
          // If no files found, keep the default files
          setError('No files found for this project.');
        }
      } catch (error) {
        console.error('Error fetching files:', error);
        setError('Failed to load files. Please try again later.');
        // Keep the existing files in state instead of resetting
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [activeFile]); // Add activeFile to dependencies to prevent unnecessary re-fetches

  if (isLoading) {
    return (
      <div className="code-loading">
        <div className="loading-spinner"></div>
        <p>Loading code files...</p>
      </div>
    );
  }

  return (
    <div className="code-container">
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* New File Modal */}
      {isNewFileModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New File</h3>
              <button className="close-button" onClick={() => setIsNewFileModalOpen(false)}>
                <FiPlus style={{ transform: 'rotate(45deg)' }} />
              </button>
            </div>
            <div className="form-group">
              <label htmlFor="fileName">File Name</label>
              <div className="input-with-extension">
                <input 
                  type="text" 
                  id="fileName"
                  value={newFile.name}
                  onChange={(e) => setNewFile({...newFile, name: e.target.value})}
                  placeholder="Enter file name"
                />
                <select 
                  value={newFile.language}
                  onChange={(e) => setNewFile({...newFile, language: e.target.value})}
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="fileContent">Initial Content (Optional)</label>
              <textarea
                id="fileContent"
                rows="6"
                value={newFile.content}
                onChange={(e) => setNewFile({...newFile, content: e.target.value})}
                placeholder="Enter initial file content"
              ></textarea>
            </div>
            <div className="form-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setIsNewFileModalOpen(false);
                  setError(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleCreateFile}
                disabled={!newFile.name.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Creating...
                  </>
                ) : 'Create File'}
              </button>
              {error && (
                <div className="error-message" style={{ 
                  color: '#ef4444', 
                  marginTop: '10px', 
                  padding: '8px', 
                  backgroundColor: '#fef2f2', 
                  borderRadius: '4px',
                  fontSize: '14px',
                  gridColumn: '1 / -1'
                }}>
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="code-header">
        <div>
          <h2>Code Repository</h2>
          <p>Browse and manage your project's source code</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsNewFileModalOpen(true)}>
          <FiCode className="btn-icon" />
          <span>New File</span>
        </button>
      </div>

      <div className="code-toolbar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <FiFilter className="filter-icon" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Files</option>
            <option value="with-issues">With Issues</option>
            <option value="no-issues">No Issues</option>
          </select>
        </div>

        <div className="sort-group">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Recently Updated</option>
            <option value="name">Name (A-Z)</option>
            <option value="most-issues">Most Issues</option>
          </select>
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="empty-state">
          <FiCode className="empty-icon" size={48} />
          <h3>No files found</h3>
          <p>Try adjusting your search or create a new file</p>
          <button className="btn btn-primary" onClick={() => setIsNewFileModalOpen(true)}>
            <FiCode className="btn-icon" />
            <span>New File</span>
          </button>
        </div>
      ) : (
        <div className="code-files">
          <div className="files-header">
            <div className="header-name">Name</div>
            <div className="header-branch">Branch</div>
            <div className="header-updated">Last Updated</div>
            <div className="header-issues">Issues</div>
            <div className="header-actions">Actions</div>
          </div>
          
          <div className="files-list">
            {filteredFiles.map((file) => (
              <div key={file.id} className="file-item">
                <div className="file-info">
                  {getLanguageIcon(file.language)}
                  <div className="file-details">
                    <div className="file-name">{file.name}</div>
                    <div className="file-path">{file.path}</div>
                  </div>
                </div>
                
                <div className="file-branch">
                  <FiGitBranch className="branch-icon" />
                  <span>{file.branch}</span>
                </div>
                
                <div className="file-updated">
                  <div className="updated-time">{formatTimeAgo(file.lastUpdated)}</div>
                  <div className="updated-by">by {file.updatedBy}</div>
                </div>
                
                <div className="file-issues">
                  {file.issues > 0 ? (
                    <span className="issues-badge has-issues">
                      <FiAlertCircle className="issues-icon" />
                      {file.issues} {file.issues === 1 ? 'issue' : 'issues'}
                    </span>
                  ) : (
                    <span className="issues-badge no-issues">
                      <FiCheckCircle className="issues-icon" />
                      No issues
                    </span>
                  )}
                </div>
                
                <div className="file-actions">
                  <button className="btn-icon" title="View">
                    <FiEye size={16} />
                  </button>
                  <button className="btn-icon" title="Edit">
                    <FiEdit2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Code;