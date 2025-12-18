# UI/UX Layout - Missing Features Implementation

## ✅ Changes Made to UILayout.jsx

### 1. Added Navigation Links (Lines 827-850)
```jsx
{/* Design Section */}
<li className="nav-section-header">
  <FaPalette className="nav-icon" />
  <span>Design Work</span>
</li>
<li className={isActive('/design/wireframes')}>
  <Link to="/design/wireframes">
    <FaImage className="nav-icon" />
    <span>Wireframes</span>
  </Link>
</li>
<li className={isActive('/design/mockups')}>
  <Link to="/design/mockups">
    <FaDesktop className="nav-icon" />
    <span>Mockups</span>
  </Link>
</li>
<li className={isActive('/design/prototypes')}>
  <Link to="/design/prototypes">
    <FaMobileAlt className="nav-icon" />
    <span>Prototypes</span>
  </Link>
</li>
```

### 2. Added State Variables (After line 491)
```javascript
// Wireframes state
const [wireframes, setWireframes] = useState([]);
const [wireframeForm, setWireframeForm] = useState({
  title: '',
  description: '',
  files: [],
  status: 'Draft'
});

// Mockups state
const [mockups, setMockups] = useState([]);
const [mockupForm, setMockupForm] = useState({
  title: '',
  description: '',
  files: [],
  status: 'Draft'
});

// Prototypes state
const [prototypes, setPrototypes] = useState([]);
const [prototypeForm, setPrototypeForm] = useState({
  title: '',
  description: '',
  link: '',
  files: [],
  status: 'Draft'
});

// Modal states
const [showWireframeModal, setShowWireframeModal] = useState(false);
const [showMockupModal, setShowMockupModal] = useState(false);
const [showPrototypeModal, setShowPrototypeModal] = useState(false);
```

### 3. Handler Functions to Add (After line 759)

```javascript
// Wireframe handlers
const handleWireframeSubmit = async (e) => {
  e.preventDefault();
  try {
    const newWireframe = {
      id: Date.now(),
      ...wireframeForm,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Designer',
      projectId: projectId
    };
    
    setWireframes([...wireframes, newWireframe]);
    setShowWireframeModal(false);
    setWireframeForm({ title: '', description: '', files: [], status: 'Draft' });
    
    // Update deliverables
    setMockDeliverables(prev => 
      prev.map(d => d.name === 'Wireframes' ? {...d, status: 'In Progress'} : d)
    );
  } catch (error) {
    console.error('Error submitting wireframe:', error);
    setError('Failed to submit wireframe');
  }
};

const handleWireframeFileUpload = (e) => {
  const files = Array.from(e.target.files);
  setWireframeForm(prev => ({
    ...prev,
    files: [...prev.files, ...files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      url: URL.createObjectURL(f)
    }))]
  }));
};

// Mockup handlers
const handleMockupSubmit = async (e) => {
  e.preventDefault();
  try {
    const newMockup = {
      id: Date.now(),
      ...mockupForm,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Designer',
      projectId: projectId
    };
    
    setMockups([...mockups, newMockup]);
    setShowMockupModal(false);
    setMockupForm({ title: '', description: '', files: [], status: 'Draft' });
    
    // Update deliverables
    setMockDeliverables(prev => 
      prev.map(d => d.name === 'Mockups' ? {...d, status: 'In Progress'} : d)
    );
  } catch (error) {
    console.error('Error submitting mockup:', error);
    setError('Failed to submit mockup');
  }
};

const handleMockupFileUpload = (e) => {
  const files = Array.from(e.target.files);
  setMockupForm(prev => ({
    ...prev,
    files: [...prev.files, ...files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      url: URL.createObjectURL(f)
    }))]
  }));
};

// Prototype handlers
const handlePrototypeSubmit = async (e) => {
  e.preventDefault();
  try {
    const newPrototype = {
      id: Date.now(),
      ...prototypeForm,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Designer',
      projectId: projectId
    };
    
    setPrototypes([...prototypes, newPrototype]);
    setShowPrototypeModal(false);
    setPrototypeForm({ title: '', description: '', link: '', files: [], status: 'Draft' });
    
    // Update deliverables
    setMockDeliverables(prev => 
      prev.map(d => d.name === 'Prototype' ? {...d, status: 'In Progress'} : d)
    );
  } catch (error) {
    console.error('Error submitting prototype:', error);
    setError('Failed to submit prototype');
  }
};

const handlePrototypeFileUpload = (e) => {
  const files = Array.from(e.target.files);
  setPrototypeForm(prev => ({
    ...prev,
    files: [...prev.files, ...files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      url: URL.createObjectURL(f)
    }))]
  }));
};

// Approve/Reject handlers
const handleApproveWireframe = (id) => {
  setWireframes(prev =>
    prev.map(w => w.id === id ? {...w, status: 'Approved'} : w)
  );
};

const handleRejectWireframe = (id, reason) => {
  setWireframes(prev =>
    prev.map(w => w.id === id ? {...w, status: 'Rejected', rejectionReason: reason} : w)
  );
};
```

### 4. UI Components to Add (Before closing return statement)

Add these sections in the main content area based on route:

```jsx
{/* Wireframes Section */}
{location.pathname === '/design/wireframes' && (
  <div className="wireframes-section">
    <div className="section-header">
      <h2><FaImage /> Wireframes</h2>
      <Button
        variant="contained"
        color="primary"
        startIcon={<FaPlus />}
        onClick={() => setShowWireframeModal(true)}
      >
        Upload Wireframe
      </Button>
    </div>

    <div className="wireframes-grid">
      {wireframes.length === 0 ? (
        <div className="empty-state">
          <FaImage size={64} />
          <h3>No Wireframes Yet</h3>
          <p>Upload your first wireframe to get started</p>
        </div>
      ) : (
        wireframes.map(wireframe => (
          <Card key={wireframe.id} className="wireframe-card">
            <CardContent>
              <div className="wireframe-header">
                <h3>{wireframe.title}</h3>
                <Chip 
                  label={wireframe.status} 
                  color={
                    wireframe.status === 'Approved' ? 'success' :
                    wireframe.status === 'Rejected' ? 'error' :
                    wireframe.status === 'Submitted' ? 'warning' : 'default'
                  }
                />
              </div>
              <p>{wireframe.description}</p>
              <div className="wireframe-files">
                {wireframe.files.map((file, idx) => (
                  <div key={idx} className="file-item">
                    <FaFileImage />
                    <span>{file.name}</span>
                    <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
                  </div>
                ))}
              </div>
              <div className="wireframe-meta">
                <span><FaClock /> {new Date(wireframe.createdAt).toLocaleDateString()}</span>
                <span><FaUser /> {wireframe.createdBy}</span>
              </div>
            </CardContent>
            <CardActions>
              {wireframe.status === 'Draft' && (
                <Button size="small" color="primary">
                  Submit for Review
                </Button>
              )}
              <Button size="small">View Details</Button>
            </CardActions>
          </Card>
        ))
      )}
    </div>

    {/* Upload Modal */}
    <Dialog open={showWireframeModal} onClose={() => setShowWireframeModal(false)} maxWidth="md" fullWidth>
      <DialogTitle>Upload Wireframe</DialogTitle>
      <form onSubmit={handleWireframeSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={wireframeForm.title}
            onChange={(e) => setWireframeForm({...wireframeForm, title: e.target.value})}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={wireframeForm.description}
            onChange={(e) => setWireframeForm({...wireframeForm, description: e.target.value})}
            multiline
            rows={4}
            margin="normal"
          />
          <div className="file-upload-area">
            <input
              type="file"
              multiple
              accept=".sketch,.fig,.xd,.pdf,.png,.jpg"
              onChange={handleWireframeFileUpload}
              id="wireframe-upload"
              style={{display: 'none'}}
            />
            <label htmlFor="wireframe-upload">
              <Button variant="outlined" component="span" startIcon={<FaUpload />}>
                Choose Files
              </Button>
            </label>
            {wireframeForm.files.length > 0 && (
              <div className="uploaded-files">
                {wireframeForm.files.map((file, idx) => (
                  <Chip key={idx} label={file.name} onDelete={() => {
                    setWireframeForm(prev => ({
                      ...prev,
                      files: prev.files.filter((_, i) => i !== idx)
                    }));
                  }} />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWireframeModal(false)}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">Upload</Button>
        </DialogActions>
      </form>
    </Dialog>
  </div>
)}

{/* Mockups Section */}
{location.pathname === '/design/mockups' && (
  <div className="mockups-section">
    <div className="section-header">
      <h2><FaDesktop /> Mockups</h2>
      <Button
        variant="contained"
        color="primary"
        startIcon={<FaPlus />}
        onClick={() => setShowMockupModal(true)}
      >
        Upload Mockup
      </Button>
    </div>

    <div className="mockups-grid">
      {mockups.length === 0 ? (
        <div className="empty-state">
          <FaDesktop size={64} />
          <h3>No Mockups Yet</h3>
          <p>Upload your first high-fidelity mockup</p>
        </div>
      ) : (
        mockups.map(mockup => (
          <Card key={mockup.id} className="mockup-card">
            <CardContent>
              <div className="mockup-header">
                <h3>{mockup.title}</h3>
                <Chip 
                  label={mockup.status} 
                  color={
                    mockup.status === 'Approved' ? 'success' :
                    mockup.status === 'Rejected' ? 'error' :
                    mockup.status === 'Submitted' ? 'warning' : 'default'
                  }
                />
              </div>
              <p>{mockup.description}</p>
              <div className="mockup-files">
                {mockup.files.map((file, idx) => (
                  <div key={idx} className="file-item">
                    <FaFileImage />
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardActions>
              {mockup.status === 'Draft' && (
                <Button size="small" color="primary">Submit for Review</Button>
              )}
              <Button size="small">View Details</Button>
            </CardActions>
          </Card>
        ))
      )}
    </div>

    {/* Upload Modal */}
    <Dialog open={showMockupModal} onClose={() => setShowMockupModal(false)} maxWidth="md" fullWidth>
      <DialogTitle>Upload Mockup</DialogTitle>
      <form onSubmit={handleMockupSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={mockupForm.title}
            onChange={(e) => setMockupForm({...mockupForm, title: e.target.value})}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={mockupForm.description}
            onChange={(e) => setMockupForm({...mockupForm, description: e.target.value})}
            multiline
            rows={4}
            margin="normal"
          />
          <div className="file-upload-area">
            <input
              type="file"
              multiple
              accept=".sketch,.fig,.xd,.pdf,.png,.jpg"
              onChange={handleMockupFileUpload}
              id="mockup-upload"
              style={{display: 'none'}}
            />
            <label htmlFor="mockup-upload">
              <Button variant="outlined" component="span" startIcon={<FaUpload />}>
                Choose Files
              </Button>
            </label>
            {mockupForm.files.length > 0 && (
              <div className="uploaded-files">
                {mockupForm.files.map((file, idx) => (
                  <Chip key={idx} label={file.name} onDelete={() => {
                    setMockupForm(prev => ({
                      ...prev,
                      files: prev.files.filter((_, i) => i !== idx)
                    }));
                  }} />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMockupModal(false)}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">Upload</Button>
        </DialogActions>
      </form>
    </Dialog>
  </div>
)}

{/* Prototypes Section */}
{location.pathname === '/design/prototypes' && (
  <div className="prototypes-section">
    <div className="section-header">
      <h2><FaMobileAlt /> Prototypes</h2>
      <Button
        variant="contained"
        color="primary"
        startIcon={<FaPlus />}
        onClick={() => setShowPrototypeModal(true)}
      >
        Add Prototype
      </Button>
    </div>

    <div className="prototypes-grid">
      {prototypes.length === 0 ? (
        <div className="empty-state">
          <FaMobileAlt size={64} />
          <h3>No Prototypes Yet</h3>
          <p>Add your first interactive prototype</p>
        </div>
      ) : (
        prototypes.map(prototype => (
          <Card key={prototype.id} className="prototype-card">
            <CardContent>
              <div className="prototype-header">
                <h3>{prototype.title}</h3>
                <Chip 
                  label={prototype.status} 
                  color={
                    prototype.status === 'Approved' ? 'success' :
                    prototype.status === 'Rejected' ? 'error' :
                    prototype.status === 'Submitted' ? 'warning' : 'default'
                  }
                />
              </div>
              <p>{prototype.description}</p>
              {prototype.link && (
                <div className="prototype-link">
                  <FaLink />
                  <a href={prototype.link} target="_blank" rel="noopener noreferrer">
                    View Prototype
                  </a>
                </div>
              )}
            </CardContent>
            <CardActions>
              {prototype.status === 'Draft' && (
                <Button size="small" color="primary">Submit for Review</Button>
              )}
              <Button size="small">View Details</Button>
            </CardActions>
          </Card>
        ))
      )}
    </div>

    {/* Add Modal */}
    <Dialog open={showPrototypeModal} onClose={() => setShowPrototypeModal(false)} maxWidth="md" fullWidth>
      <DialogTitle>Add Prototype</DialogTitle>
      <form onSubmit={handlePrototypeSubmit}>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={prototypeForm.title}
            onChange={(e) => setPrototypeForm({...prototypeForm, title: e.target.value})}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={prototypeForm.description}
            onChange={(e) => setPrototypeForm({...prototypeForm, description: e.target.value})}
            multiline
            rows={4}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Prototype Link (Figma, InVision, etc.)"
            value={prototypeForm.link}
            onChange={(e) => setPrototypeForm({...prototypeForm, link: e.target.value})}
            margin="normal"
            placeholder="https://..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPrototypeModal(false)}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">Add Prototype</Button>
        </DialogActions>
      </form>
    </Dialog>
  </div>
)}
```

## 📋 Summary of Changes

### ✅ Completed:
1. Added "Design Work" section in sidebar navigation
2. Added Wireframes, Mockups, Prototypes links
3. Added state management for all three sections
4. Added modal states for upload dialogs

### 📝 To Complete:
Due to file size (1346 lines), the complete implementation requires:

1. **Add Handler Functions** (after line 759):
   - handleWireframeSubmit
   - handleWireframeFileUpload
   - handleMockupSubmit
   - handleMockupFileUpload
   - handlePrototypeSubmit
   - handlePrototypeFileUpload

2. **Add UI Components** (in main content area):
   - Wireframes section with grid and upload modal
   - Mockups section with grid and upload modal
   - Prototypes section with grid and add modal

3. **Add CSS Styles** to UILayout.css:
   - .wireframes-section, .mockups-section, .prototypes-section
   - .section-header
   - .wireframes-grid, .mockups-grid, .prototypes-grid
   - .empty-state
   - .file-upload-area
   - .uploaded-files

## 🎯 Next Steps:

1. Test the navigation links
2. Implement the handler functions
3. Add the UI components
4. Style the new sections
5. Connect to backend API for persistence

## 📌 Important Notes:

- All sections follow the same pattern: List view + Upload/Add modal
- Status tracking: Draft → Submitted → Approved/Rejected
- File upload support for .sketch, .fig, .xd, .pdf, .png, .jpg
- Prototype section also supports external links (Figma, InVision, etc.)
