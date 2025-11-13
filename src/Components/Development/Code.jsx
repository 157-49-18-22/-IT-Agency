import React, { useState, useEffect } from 'react';
import { FiCode, FiGitBranch, FiClock, FiUser, FiAlertCircle, FiCheckCircle, FiEdit2, FiTrash2, FiPlus, FiSearch, FiFilter, FiEye } from 'react-icons/fi';
import { Prism as SyntaxHighlighter } from 'prism-react-renderer';
import './Code.css';
import { codeAPI } from '../../services/api';

const Code = () => {
  const [isLoading, setIsLoading] = useState(true);
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

  // Fetch code files and set active file
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        // Simulate API call with a timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // If you want to fetch from API, uncomment this:
        // const response = await codeAPI.getAll();
        // setFiles(response.data);
        
        // For now, use the mock data already in state
        if (files.length > 0 && !activeFile) {
          setActiveFile(files[0]);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFiles();
    
    // Cleanup function
    return () => {
      // Any cleanup code if needed
    };
  }, [files, activeFile]);

  const handleFileSelect = (file) => {
    setActiveFile(file);
  };

  const handleFileUpdate = (content) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === activeFile.id ? { ...file, content, lastUpdated: new Date().toISOString() } : file
      )
    );
    setActiveFile(prevFile => ({...prevFile, content, lastUpdated: new Date().toISOString()}));
  };

  const handleCreateFile = () => {
    const newId = Math.max(0, ...files.map(f => f.id)) + 1;
    const extension = newFile.language === 'javascript' ? 'js' : newFile.language;
    const fileName = newFile.name.endsWith(`.${extension}`) ? newFile.name : `${newFile.name}.${extension}`;
    
    const file = {
      id: newId,
      name: fileName,
      content: newFile.content || `// New ${newFile.language} file\n`,
      language: newFile.language,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Current User'
    };

    setFiles([...files, file]);
    setActiveFile(file);
    setNewFile({ name: '', content: '', language: 'javascript' });
    setIsNewFileModalOpen(false);
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
                onClick={() => setIsNewFileModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleCreateFile}
                disabled={!newFile.name.trim()}
              >
                Create File
              </button>
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