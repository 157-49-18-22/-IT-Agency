import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, Divider,
  TextField, IconButton, Badge, Avatar, Menu, MenuItem, ListItemIcon,
  Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, Grid, Card, CardContent, CardActions, Chip,
  LinearProgress, Tabs, Tab, AppBar, Toolbar, Checkbox, FormGroup,
  FormControlLabel, CircularProgress, Button, ButtonGroup
} from '@mui/material';
import {
  FaSearch, FaFilter, FaSort, FaPlus, FaCheck, FaTimes,
  FaEllipsisV, FaEdit, FaTrash, FaUpload, FaDownload, FaComments,
  FaHistory, FaRegClock, FaRegCheckCircle, FaRegTimesCircle, FaRegCalendarAlt,
  FaRegUser, FaRegFileAlt, FaRegFilePdf, FaRegFileImage, FaRegFileCode,
  FaRegFileArchive, FaRegFileWord, FaRegFileVideo, FaRegFileAudio, FaRegFileExcel,
  FaRegFolder, FaRegFolderOpen, FaRegStar, FaStar, FaRegBookmark, FaBookmark,
  FaRegThumbsUp, FaRegThumbsDown, FaRegComment, FaRegShareSquare, FaRegBookmark as FaRegBookmarkOutline,
  FaRegClock, FaRegCalendar, FaRegUserCircle, FaRegEnvelope, FaRegBell, FaRegBellSlash,
  FaRegCheckSquare, FaRegSquare, FaRegDotCircle, FaRegCircle, FaRegWindowClose, FaRegWindowMaximize,
  FaRegWindowMinimize, FaRegWindowRestore, FaRegQuestionCircle, FaRegLightbulb, FaRegCommentDots,
  FaRegSmile, FaRegFrown, FaRegMeh, FaRegGrin, FaRegGrinBeam, FaRegGrinHearts, FaRegGrinSquint,
  FaRegGrinSquintTears, FaRegGrinStars, FaRegGrinTears, FaRegGrinTongue, FaRegGrinTongueSquint,
  FaRegGrinTongueWink, FaRegGrimace, FaRegFlushed, FaRegFrownOpen, FaRegGrinWink, FaRegKiss,
  FaRegKissBeam, FaRegKissWinkHeart, FaRegLaugh, FaRegLaughBeam, FaRegLaughSquint, FaRegLaughWink,
  FaRegMehBlank, FaRegMehRollingEyes, FaRegSadCry, FaRegSadTear, FaRegSmileBeam, FaRegSmileWink,
  FaRegTired
} from 'react-icons/fa';

const ProjectManagement = () => {
  // State for projects
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    client: '',
    startDate: new Date().toISOString().split('T')[0],
    deadline: '',
    status: 'planning',
    priority: 'medium',
    team: [],
    tags: []
  });

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Projects' },
    { value: 'planning', label: 'Planning' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'review', label: 'In Review' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'deadline_asc', label: 'Deadline (Earliest)' },
    { value: 'deadline_desc', label: 'Deadline (Latest)' }
  ];

  // Mock data for projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        const mockProjects = [
          {
            id: '1',
            name: 'E-commerce Website Redesign',
            description: 'Complete redesign of the main e-commerce platform with improved UX',
            client: 'FashionHub',
            startDate: '2025-11-01',
            deadline: '2025-12-15',
            status: 'in_progress',
            priority: 'high',
            progress: 65,
            team: ['John D.', 'Sarah M.', 'Mike T.'],
            tags: ['UI/UX', 'E-commerce', 'Redesign']
          },
          {
            id: '2',
            name: 'Mobile Banking App',
            description: 'Design a new mobile banking application with enhanced security features',
            client: 'Global Bank',
            startDate: '2025-10-15',
            deadline: '2026-01-20',
            status: 'in_progress',
            priority: 'high',
            progress: 30,
            team: ['Jane S.', 'Alex K.', 'David L.'],
            tags: ['Mobile', 'Banking', 'Security']
          },
          {
            id: '3',
            name: 'Healthcare Portal',
            description: 'Patient portal for healthcare provider with appointment scheduling',
            client: 'MediCare',
            startDate: '2025-11-10',
            deadline: '2025-12-30',
            status: 'planning',
            priority: 'medium',
            progress: 15,
            team: ['Sarah M.', 'Mike T.'],
            tags: ['Healthcare', 'Portal', 'Scheduling']
          },
          {
            id: '4',
            name: 'Food Delivery App',
            description: 'Mobile app for food delivery service with real-time tracking',
            client: 'QuickBite',
            startDate: '2025-09-01',
            deadline: '2025-11-30',
            status: 'review',
            priority: 'high',
            progress: 90,
            team: ['John D.', 'Jane S.'],
            tags: ['Mobile', 'Food', 'Delivery']
          },
          {
            id: '5',
            name: 'Corporate Website',
            description: 'New corporate website with modern design and CMS integration',
            client: 'TechSolutions Inc.',
            startDate: '2025-08-15',
            deadline: '2025-10-31',
            status: 'completed',
            priority: 'medium',
            progress: 100,
            team: ['Alex K.', 'David L.'],
            tags: ['Website', 'Corporate', 'CMS']
          }
        ];
        
        setProjects(mockProjects);
        setFilteredProjects(mockProjects);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filter and sort projects
  useEffect(() => {
    let result = [...projects];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(project => 
        project.name.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        project.client.toLowerCase().includes(term) ||
        project.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(project => project.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.startDate) - new Date(a.startDate);
        case 'oldest':
          return new Date(a.startDate) - new Date(b.startDate);
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'deadline_asc':
          return new Date(a.deadline) - new Date(b.deadline);
        case 'deadline_desc':
          return new Date(b.deadline) - new Date(a.deadline);
        default:
          return 0;
      }
    });
    
    setFilteredProjects(result);
  }, [projects, searchTerm, statusFilter, sortBy]);

  // Handle project selection
  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setIsViewDialogOpen(true);
  };

  // Handle new project form changes
  const handleNewProjectChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle new project submission
  const handleNewProjectSubmit = (e) => {
    e.preventDefault();
    // TODO: Add API call to create new project
    const project = {
      ...newProject,
      id: Date.now().toString(),
      progress: 0,
      team: [],
      tags: newProject.tags.length ? newProject.tags.split(',').map(tag => tag.trim()) : []
    };
    
    setProjects(prev => [...prev, project]);
    setNewProject({
      name: '',
      description: '',
      client: '',
      startDate: new Date().toISOString().split('T')[0],
      deadline: '',
      status: 'planning',
      priority: 'medium',
      team: [],
      tags: []
    });
    setIsNewProjectDialogOpen(false);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'review':
        return 'warning';
      case 'on_hold':
        return 'secondary';
      case 'cancelled':
        return 'error';
      case 'planning':
      default:
        return 'info';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate days remaining
  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `${diffDays} days remaining`;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle style={{ color: '#4caf50' }} />;
      case 'in_progress':
        return <FaRegClock style={{ color: '#1976d2' }} />;
      case 'review':
        return <FaRegClock style={{ color: '#ed6c02' }} />;
      case 'on_hold':
        return <FaRegClock style={{ color: '#9e9e9e' }} />;
      case 'cancelled':
        return <FaTimes style={{ color: '#f44336' }} />;
      case 'planning':
      default:
        return <FaRegClock style={{ color: '#2196f3' }} />;
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
          <Typography color="error" variant="h6">{error}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => window.location.reload()}
            style={{ marginTop: '16px' }}
          >
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            All Projects
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage and track all your projects in one place
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FaPlus />}
          onClick={() => setIsNewProjectDialogOpen(true)}
        >
          New Project
        </Button>
      </Box>

      {/* Filters and Search */}
      <Paper elevation={2} style={{ padding: '16px', marginBottom: '24px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <FaSearch style={{ marginRight: '8px', color: '#9e9e9e' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
                startAdornment={
                  <FaFilter style={{ marginRight: '8px', color: '#9e9e9e' }} />
                }
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort by"
                startAdornment={
                  <FaSort style={{ marginRight: '8px', color: '#9e9e9e' }} />
                }
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSortBy('newest');
              }}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card 
                elevation={2} 
                style={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                  }
                }}
                onClick={() => handleProjectClick(project)}
              >
                <CardContent style={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {project.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {project.description.length > 100 
                          ? `${project.description.substring(0, 100)}...` 
                          : project.description}
                      </Typography>
                    </Box>
                    <Chip 
                      label={statusOptions.find(s => s.value === project.status)?.label || project.status}
                      color={getStatusColor(project.status)}
                      size="small"
                      variant="outlined"
                      icon={getStatusIcon(project.status)}
                    />
                  </Box>
                  
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="caption" color="textSecondary">
                        Progress
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {project.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={project.progress} 
                      style={{ height: 8, borderRadius: 4 }}
                      color={project.progress === 100 ? 'success' : 'primary'}
                    />
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      <FaRegCalendarAlt style={{ marginRight: '4px' }} />
                      Deadline: {formatDate(project.deadline)}
                      <span style={{ 
                        color: new Date(project.deadline) < new Date() ? '#f44336' : '#4caf50',
                        marginLeft: '8px',
                        fontWeight: 500
                      }}>
                        {getDaysRemaining(project.deadline)}
                      </span>
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                      <FaRegUser style={{ marginRight: '4px' }} />
                      Client: {project.client}
                    </Typography>
                  </Box>
                  
                  <Box>
                    {project.tags.map((tag, index) => (
                      <Chip 
                        key={index}
                        label={tag}
                        size="small"
                        style={{ marginRight: '4px', marginBottom: '4px' }}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
                <CardActions style={{ padding: '16px', borderTop: '1px solid #eee' }}>
                  <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
                    <Box display="flex" alignItems="center">
                      <Box display="flex" alignItems="center" mr={2}>
                        <FaUsers style={{ marginRight: '4px', color: '#757575', fontSize: '14px' }} />
                        <Typography variant="caption" color="textSecondary">
                          {project.team.length} members
                        </Typography>
                      </Box>
                      <Chip 
                        label={project.priority}
                        size="small"
                        color={getPriorityColor(project.priority)}
                        variant="outlined"
                      />
                    </Box>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProjectClick(project);
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper elevation={2} style={{ padding: '40px 20px', textAlign: 'center' }}>
          <FaSearch style={{ fontSize: '48px', color: '#9e9e9e', marginBottom: '16px' }} />
          <Typography variant="h6" gutterBottom>
            No projects found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Try adjusting your search or filter criteria, or create a new project.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FaPlus />}
            onClick={() => setIsNewProjectDialogOpen(true)}
          >
            Create New Project
          </Button>
        </Paper>
      )}

      {/* Project Details Dialog */}
      <Dialog 
        open={isViewDialogOpen} 
        onClose={() => setIsViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedProject && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5">{selectedProject.name}</Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Chip 
                      label={statusOptions.find(s => s.value === selectedProject.status)?.label || selectedProject.status}
                      color={getStatusColor(selectedProject.status)}
                      size="small"
                      style={{ marginRight: '8px' }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      Created on {formatDate(selectedProject.startDate)}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setIsViewDialogOpen(false)}>
                  <FaTimes />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Box mb={3}>
                    <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>
                      Project Description
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {selectedProject.description}
                    </Typography>
                  </Box>
                  
                  <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                        Progress
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {selectedProject.progress}% Complete
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={selectedProject.progress} 
                      style={{ height: 8, borderRadius: 4, marginBottom: '8px' }}
                      color={selectedProject.progress === 100 ? 'success' : 'primary'}
                    />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="textSecondary">
                        Start Date: {formatDate(selectedProject.startDate)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Deadline: {formatDate(selectedProject.deadline)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box mb={3}>
                    <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>
                      Team Members
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {selectedProject.team.map((member, index) => (
                        <Chip 
                          key={index}
                          avatar={
                            <Avatar style={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                              {member.charAt(0)}
                            </Avatar>
                          }
                          label={member}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      <IconButton size="small" color="primary">
                        <FaUserPlus size={16} />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 600 }}>
                      Tags
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {selectedProject.tags.map((tag, index) => (
                        <Chip 
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      <IconButton size="small" color="primary">
                        <FaPlus size={14} />
                      </IconButton>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper elevation={0} style={{ padding: '16px', border: '1px solid #eee', borderRadius: '8px' }}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      PROJECT DETAILS
                    </Typography>
                    
                    <Box mb={2}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Client
                      </Typography>
                      <Typography variant="body2">
                        {selectedProject.client}
                      </Typography>
                    </Box>
                    
                    <Box mb={2}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Priority
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <Box 
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: 
                              selectedProject.priority === 'high' ? '#f44336' :
                              selectedProject.priority === 'medium' ? '#ff9800' : '#4caf50',
                            marginRight: '8px'
                          }}
                        />
                        <Typography variant="body2" style={{ textTransform: 'capitalize' }}>
                          {selectedProject.priority}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box mb={2}>
                      <Typography variant="caption" color="textSecondary" display="block">
                        Timeline
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(selectedProject.startDate)} - {formatDate(selectedProject.deadline)}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color={new Date(selectedProject.deadline) < new Date() ? 'error' : 'textSecondary'}
                      >
                        {getDaysRemaining(selectedProject.deadline)}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                        Attachments
                      </Typography>
                      <Box>
                        {[1, 2, 3].map((item) => (
                          <Box 
                            key={item} 
                            display="flex" 
                            alignItems="center" 
                            p={1} 
                            mb={1} 
                            style={{ 
                              border: '1px dashed #e0e0e0', 
                              borderRadius: '4px',
                              backgroundColor: '#fafafa'
                            }}
                          >
                            <FaRegFileAlt style={{ marginRight: '8px', color: '#757575' }} />
                            <Box flexGrow={1}>
                              <Typography variant="body2" noWrap>
                                project_document_{item}.pdf
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                2.{item} MB • {item} day ago
                              </Typography>
                            </Box>
                            <IconButton size="small" color="primary">
                              <FaDownload size={14} />
                            </IconButton>
                          </Box>
                        ))}
                        <Button 
                          variant="outlined" 
                          size="small" 
                          startIcon={<FaUpload size={12} />}
                          fullWidth
                          style={{ marginTop: '8px' }}
                        >
                          Upload File
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions style={{ padding: '16px 24px', borderTop: '1px solid #eee' }}>
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<FaEdit />}
                onClick={() => {
                  // Handle edit project
                  setIsViewDialogOpen(false);
                }}
              >
                Edit Project
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<FaTasks />}
                onClick={() => {
                  // Navigate to tasks
                  setIsViewDialogOpen(false);
                }}
              >
                View Tasks
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* New Project Dialog */}
      <Dialog 
        open={isNewProjectDialogOpen} 
        onClose={() => setIsNewProjectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleNewProjectSubmit}>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Project Name"
                  name="name"
                  value={newProject.name}
                  onChange={handleNewProjectChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={3}
                  label="Description"
                  name="description"
                  value={newProject.description}
                  onChange={handleNewProjectChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Client"
                  name="client"
                  value={newProject.client}
                  onChange={handleNewProjectChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={newProject.status}
                    onChange={handleNewProjectChange}
                    label="Status"
                  >
                    {statusOptions.filter(opt => opt.value !== 'all').map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={newProject.startDate}
                  onChange={handleNewProjectChange}
                  variant="outlined"
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Deadline"
                  name="deadline"
                  type="date"
                  value={newProject.deadline}
                  onChange={handleNewProjectChange}
                  variant="outlined"
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0],
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" margin="normal">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={newProject.priority}
                    onChange={handleNewProjectChange}
                    label="Priority"
                  >
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tags (comma separated)"
                  name="tags"
                  value={newProject.tags}
                  onChange={handleNewProjectChange}
                  variant="outlined"
                  margin="normal"
                  placeholder="e.g., UI/UX, Web, Mobile"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions style={{ padding: '16px 24px' }}>
            <Button 
              variant="outlined" 
              onClick={() => setIsNewProjectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              type="submit"
            >
              Create Project
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ProjectManagement;
