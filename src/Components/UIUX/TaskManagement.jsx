import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaTasks, FaClipboardCheck, FaUsers, FaChevronRight, FaClipboardList, FaRedo } from 'react-icons/fa';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  TextField,
  IconButton,
  Chip,
  LinearProgress,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Avatar,
  Badge,
  Tooltip,
  Grid,
  Fab,
  Tabs,
  Tab,
  styled,
  MenuItem as MuiMenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import uiuxService from "../../services/uiuxService";
import {
  FaCheckCircle,
  FaClock,
  FaUpload,
  FaDownload,
  FaComment,
  FaPaperclip,
  FaPlus,
  FaCheck,
  FaTimes,
  FaUserTag,
  FaRegClock,
  FaEllipsisV,
  FaTrash,
  FaEdit,
  FaUserPlus,
  FaUserTimes,
  FaSearch
} from 'react-icons/fa';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Styled Tabs component
const StyledTabs = styled(Tabs)({
  '& .MuiTabs-indicator': {
    backgroundColor: '#1976d2',
  },
});

// Styled Tab component
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 72,
  fontWeight: theme.typography.fontWeightRegular,
  marginRight: theme.spacing(4),
  '&:hover': {
    color: '#1976d2',
    opacity: 1,
  },
  '&.Mui-selected': {
    color: '#1976d2',
    fontWeight: theme.typography.fontWeightMedium,
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
  },
}));

// Helper function for tab accessibility
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

// Status options for tasks
const TASK_STATUS = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'Review',
  COMPLETED: 'Completed'
};

// Sample data structure for tasks
const initialTasks = [
  {
    id: 1,
    title: 'Research Documentation',
    description: 'Research and document UI/UX best practices',
    status: TASK_STATUS.NOT_STARTED,
    dueDate: '2025-12-15',
    assignedTo: 'UI/UX Team',
    files: [],
    comments: [],
    hoursLogged: 0,
    checklist: [
      { id: 1, text: 'Competitor analysis', completed: false },
      { id: 2, text: 'User personas', completed: false },
      { id: 3, text: 'User flows', completed: false }
    ]
  },
  // Add more sample tasks as needed
];

const TaskManagement = () => {
  // State management
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [file, setFile] = useState(null);
  const [hoursWorked, setHoursWorked] = useState('');
  const [activeTab, setActiveTab] = useState('tasks');
  const [expandedTask, setExpandedTask] = useState(null);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 'user-1',
      name: 'Current User',
      email: 'user@example.com',
      avatar: 'https://i.pravatar.cc/150?img=1',
      role: 'admin'
    },
    {
      id: 'user-2',
      name: 'Team Member',
      email: 'member@example.com',
      avatar: 'https://i.pravatar.cc/150?img=2',
      role: 'member'
    }
  ]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignedTo: 'all',
    search: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [openNewTaskDialog, setOpenNewTaskDialog] = useState(false);

  // Refs
  const fileInputRef = useRef(null);
  const wsSubscriptionRef = useRef(null);

  // Get project ID and user from context
  const { projectId } = useParams();
  const { user: currentUser } = useAuth() || {
    id: 'user-1',
    name: 'Current User',
    email: 'user@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    role: 'admin'
  };

  // Handle task status update
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Optimistic update
      const previousTasks = [...tasks];
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      await uiuxService.updateTaskStatus(taskId, newStatus);

    } catch (err) {
      // Revert on error
      setTasks(previousTasks);
      console.error('Error updating task status:', err);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e, taskId, onProgress) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setFile(file);
      const response = await uiuxService.uploadAttachment(
        taskId,
        file,
        onProgress
      );

      // The WebSocket update will handle the state update
      return { success: true, data: response };
    } catch (err) {
      console.error('Error uploading file:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to upload file'
      };
    }
  };

  // Handle hours logging
  const logHours = (taskId, hours) => {
    const hoursNum = parseFloat(hours);
    if (!isNaN(hoursNum) && hoursNum > 0) {
      setTasks(tasks.map(task =>
        task.id === taskId
          ? { ...task, hoursLogged: (task.hoursLogged || 0) + hoursNum }
          : task
      ));
      setHoursWorked('');
    }
  };

  // Handle checklist item toggle
  const toggleChecklistItem = (taskId, itemId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedChecklist = task.checklist.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        return { ...task, checklist: updatedChecklist };
      }
      return task;
    }));
  };

  // Add comment to task
  const addComment = (taskId) => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      text: newComment,
      author: currentUser?.name || 'Anonymous',
      timestamp: new Date().toISOString(),
      isAdmin: currentUser?.role === 'admin'
    };

    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, comments: [...(task.comments || []), comment] }
        : task
    ));
    setNewComment('');
  };

  // Calculate progress percentage for a task
  const calculateProgress = (task) => {
    if (!task.checklist?.length) return 0;
    const completed = task.checklist.filter(item => item.completed).length;
    return Math.round((completed / task.checklist.length) * 100);
  };
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksData, usersData] = await Promise.all([
        uiuxService.getProjectTasks(projectId, filters),
        uiuxService.getUsers(),
        uiuxService.getProjectTeam(projectId)
      ]);

      setTasks(tasksData);
      setUsers(usersData);

      // Set up WebSocket for real-time updates
      setupWebSocket();

    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Set up WebSocket connection and subscriptions
  const setupWebSocket = useCallback(() => {
    // Initialize WebSocket connection
    const wsService = uiuxService.initWebSocket();

    // Subscribe to task updates
    wsSubscriptionRef.current = wsService.subscribe('TASK_UPDATED', (updatedTask) => {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task
        )
      );

      // Update selected task if it's the one being updated
      if (selectedTask && selectedTask.id === updatedTask.id) {
        setSelectedTask(prev => ({ ...prev, ...updatedTask }));
      }
    });

    // Subscribe to new task creation
    wsService.subscribe('TASK_CREATED', (newTask) => {
      setTasks(prevTasks => [newTask, ...prevTasks]);
    });

    // Subscribe to comment updates
    wsService.subscribe('COMMENT_ADDED', ({ taskId, comment }) => {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? {
              ...task,
              comments: [...(task.comments || []), comment]
            }
            : task
        )
      );
    });

    // Subscribe to attachment updates
    wsService.subscribe('ATTACHMENT_ADDED', ({ taskId, attachment }) => {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? {
              ...task,
              attachments: [...(task.attachments || []), attachment]
            }
            : task
        )
      );
    });

    // Cleanup function will be called on component unmount
    return () => {
      if (wsSubscriptionRef.current) {
        wsSubscriptionRef.current();
      }
    };
  }, [selectedTask]);

  // Fetch data on component mount
  useEffect(() => {
    fetchInitialData();

    // Cleanup WebSocket on unmount
    return () => {
      if (wsSubscriptionRef.current) {
        wsSubscriptionRef.current();
      }
    };
  }, [fetchInitialData]);

  // Handle filter changes
  useEffect(() => {
    const fetchFilteredTasks = async () => {
      try {
        setLoading(true);
        // If no projectId, fetch all tasks or handle accordingly
        if (!projectId) {
          // Option 1: Set empty tasks
          setTasks([]);
          // Option 2: Or fetch all tasks if your API supports it
          // const tasksData = await uiuxService.getAllTasks(filters);
          // setTasks(tasksData);
        } else {
          const tasksData = await uiuxService.getProjectTasks(projectId, filters);
          setTasks(tasksData);
        }
      } catch (err) {
        setError('Failed to filter tasks. Please try again.');
        console.error('Error filtering tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredTasks();
  }, [filters, projectId]);

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    // Apply status filter
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }

    // Apply priority filter
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }

    // Apply assignedTo filter
    if (filters.assignedTo !== 'all') {
      if (filters.assignedTo === 'me' && task.assignedTo !== 'me') {
        return false;
      }
      if (filters.assignedTo === 'others' && task.assignedTo === 'me') {
        return false;
      }
    }

    // Apply search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });


  // Handle work time logging
  const handleLogWorkTime = async (taskId, timeData) => {
    try {
      const response = await uiuxService.logWorkTime(taskId, {
        ...timeData,
        userId: currentUser.id, // Assuming you have currentUser in context
        date: new Date().toISOString()
      });

      // The WebSocket update will handle the state update
      return { success: true, data: response };
    } catch (err) {
      console.error('Error logging work time:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to log work time'
      };
    }
  };

  // Handle adding a comment with attachments
  const handleAddComment = async (taskId, content, attachments = []) => {
    try {
      const response = await uiuxService.addComment(
        taskId,
        content,
        null, // parentId for replies
        attachments
      );

      // The WebSocket update will handle the state update
      return { success: true, data: response };
    } catch (err) {
      console.error('Error adding comment:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to add comment'
      };
    }
  };

  // Handle user assignment
  const handleAssignUser = async (taskId, userId) => {
    try {
      await uiuxService.assignTask(taskId, userId);
      // The WebSocket update will handle the state update
      return { success: true };
    } catch (err) {
      console.error('Error assigning user:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to assign user'
      };
    }
  };

  // Handle adding team member
  const handleAddTeamMember = async (userId, role = 'member') => {
    try {
      const response = await uiuxService.addTeamMember(projectId, userId, role);
      setTeamMembers(prev => [...prev, response]);
      return { success: true, data: response };
    } catch (err) {
      console.error('Error adding team member:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to add team member'
      };
    }
  };

  // Handle removing team member
  const handleRemoveTeamMember = async (userId) => {
    try {
      await uiuxService.removeTeamMember(projectId, userId);
      setTeamMembers(prev => prev.filter(member => member.id !== userId));
      return { success: true };
    } catch (err) {
      console.error('Error removing team member:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to remove team member'
      };
    }
  };

  // Handle updating team member role
  const handleUpdateTeamMemberRole = async (userId, role) => {
    try {
      const response = await uiuxService.updateTeamMemberRole(projectId, userId, role);
      setTeamMembers(prev =>
        prev.map(member =>
          member.id === userId ? { ...member, role } : member
        )
      );
      return { success: true, data: response };
    } catch (err) {
      console.error('Error updating team member role:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Failed to update role'
      };
    }
  };
  const EnhancedTaskManagement = () => {
    const [tasks, setTasks] = useState(initialTasks);
    const [selectedTask, setSelectedTask] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openNewTaskDialog, setOpenNewTaskDialog] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [hoursWorked, setHoursWorked] = useState('');
    const [file, setFile] = useState(null);
    const [filter, setFilter] = useState('all');
    const [anchorEl, setAnchorEl] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [newTask, setNewTask] = useState({
      title: '',
      description: '',
      status: TASK_STATUS.NOT_STARTED,
      dueDate: null,
      checklist: [
        { id: 1, text: 'Research', completed: false },
        { id: 2, text: 'Wireframe', completed: false },
        { id: 3, text: 'Prototype', completed: false }
      ]
    });

    const { user } = useAuth();
    const { projectId } = useParams();

    // Filter tasks based on status
    const filteredTasks = filter === 'all'
      ? tasks
      : tasks.filter(task => task.status === filter);

    // Handle task creation
    const handleCreateTask = () => {
      if (!newTask.title.trim()) {
        showSnackbar('Task title is required', 'error');
        return;
      }

      const task = {
        ...newTask,
        id: Date.now(),
        files: [],
        comments: [],
        hoursLogged: 0,
        createdAt: new Date().toISOString(),
        createdBy: user?.id || 'system'
      };

      setTasks([...tasks, task]);
      setOpenNewTaskDialog(false);
      setNewTask({
        title: '',
        description: '',
        status: TASK_STATUS.NOT_STARTED,
        dueDate: null,
        checklist: [
          { id: 1, text: 'Research', completed: false },
          { id: 2, text: 'Wireframe', completed: false },
          { id: 3, text: 'Prototype', completed: false }
        ]
      });
      showSnackbar('Task created successfully', 'success');
    };

    // Handle task deletion
    const handleDeleteTask = (taskId) => {
      setTasks(tasks.filter(task => task.id !== taskId));
      setAnchorEl(null);
      showSnackbar('Task deleted', 'info');
    };

    // Show snackbar notification
    const showSnackbar = (message, severity = 'success') => {
      setSnackbar({ open: true, message, severity });
    };

    // Close snackbar
    const handleCloseSnackbar = () => {
      setSnackbar({ ...snackbar, open: false });
    };

    // ... (keep existing handler functions)

    // Add this to your existing code
    const renderNewTaskDialog = () => (
      <Dialog
        open={openNewTaskDialog}
        onClose={() => setOpenNewTaskDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Task Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            margin="normal"
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Due Date"
              value={newTask.dueDate}
              onChange={(date) => setNewTask({ ...newTask, dueDate: date })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                />
              )}
            />
          </LocalizationProvider>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={newTask.status}
              label="Status"
              onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
            >
              {Object.values(TASK_STATUS).map(status => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Checklist
          </Typography>
          <FormGroup>
            {newTask.checklist.map((item) => (
              <FormControlLabel
                key={item.id}
                control={
                  <Checkbox
                    checked={item.completed}
                    onChange={(e) => {
                      const updatedChecklist = newTask.checklist.map(i =>
                        i.id === item.id ? { ...i, completed: e.target.checked } : i
                      );
                      setNewTask({ ...newTask, checklist: updatedChecklist });
                    }}
                  />
                }
                label={
                  <TextField
                    value={item.text}
                    onChange={(e) => {
                      const updatedChecklist = newTask.checklist.map(i =>
                        i.id === item.id ? { ...i, text: e.target.value } : i
                      );
                      setNewTask({ ...newTask, checklist: updatedChecklist });
                    }}
                    variant="standard"
                    fullWidth
                  />
                }
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewTaskDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">
            Create Task
          </Button>
        </DialogActions>
      </Dialog>
    );

    // Update the filter chips in the return statement
    <Box display="flex" gap={1} mb={2} flexWrap="wrap">
      <Chip
        label="All"
        color={filter === 'all' ? 'primary' : 'default'}
        variant={filter === 'all' ? 'filled' : 'outlined'}
        onClick={() => setFilter('all')}
      />
      {Object.values(TASK_STATUS).map(status => (
        <Chip
          key={status}
          label={status}
          color={filter === status ? 'primary' : 'default'}
          variant={filter === status ? 'filled' : 'outlined'}
          onClick={() => setFilter(status)}
        />
      ))}
    </Box>

    // Add task menu
    const renderTaskMenu = (task) => (
      <>
        <IconButton
          size="small"
          onClick={(e) => {
            setSelectedTask(task);
            setAnchorEl(e.currentTarget);
          }}
        >
          <FaEllipsisV />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl && selectedTask?.id === task.id)}
          onClose={() => setAnchorEl(null)}
        >
          <MuiMenuItem onClick={() => {
            setNewTask({
              ...task,
              dueDate: task.dueDate ? new Date(task.dueDate) : null
            });
            setOpenNewTaskDialog(true);
            setAnchorEl(null);
          }}>
            <ListItemIcon>
              <FaEdit fontSize="small" />
            </ListItemIcon>
            Edit
          </MuiMenuItem>
          <MuiMenuItem onClick={() => {
            if (window.confirm('Are you sure you want to delete this task?')) {
              handleDeleteTask(task.id);
            }
          }}>
            <ListItemIcon>
              <FaTrash fontSize="small" color="error" />
            </ListItemIcon>
            <Typography color="error">Delete</Typography>
          </MuiMenuItem>
        </Menu>
      </>
    );

    // Update the task item to include the menu
    const renderTaskItem = (task) => {
      const progress = calculateProgress(task);

      return (
        <Paper key={task.id} sx={{ mb: 2, p: 2, position: 'relative' }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box flexGrow={1} mr={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">{task.title}</Typography>
                {renderStatusChip(task.status)}
              </Box>

              <Typography variant="body2" color="text.secondary" mb={2}>
                {task.description}
              </Typography>

              {/* Progress and other details */}
              {/* ... existing progress and details code ... */}
            </Box>

            {renderTaskMenu(task)}
          </Box>

          {/* Rest of the task item */}
          {/* ... existing task item code ... */}
        </Paper>
      );
    };

    return (
      <Box sx={{ p: 3 }}>
        {/* Header and filter section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Task Management</Typography>
          <Button
            variant="contained"
            startIcon={<FaPlus />}
            onClick={() => setOpenNewTaskDialog(true)}
          >
            New Task
          </Button>
        </Box>

        {/* Filter chips */}
        <Box mb={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Filter Tasks
            </Typography>
            <Box display="flex" gap={1} mb={2} flexWrap="wrap">
              <Chip
                label="All"
                color={filter === 'all' ? 'primary' : 'default'}
                variant={filter === 'all' ? 'filled' : 'outlined'}
                onClick={() => setFilter('all')}
              />
              {Object.values(TASK_STATUS).map(status => (
                <Chip
                  key={status}
                  label={status}
                  color={filters.status === status ? 'primary' : 'default'}
                  variant={filters.status === status ? 'filled' : 'outlined'}
                  onClick={() => setFilters(prev => ({ ...prev, status }))}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
              <Chip
                label="Clear Filter"
                variant="outlined"
                onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                sx={{ mb: 1 }}
              />
            </Box>
          </Paper>
        </Box>

        {/* Task list */}
        <Box>
          {filteredTasks.length > 0 ? (
            <List>
              {filteredTasks.map(task => renderTaskItem(task))}
            </List>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No tasks found{filters.status !== 'all' ? ` with status "${filters.status}"` : ''}.
                {filters.status !== 'all' && (
                  <Button
                    color="primary"
                    onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                    sx={{ ml: 1 }}
                  >
                    Show all tasks
                  </Button>
                )}
              </Typography>
            </Paper>
          )}
        </Box>

        {/* Dialogs */}
        {renderTaskDialog()}
        {renderNewTaskDialog()}

        {/* FAB for new task */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24
          }}
          onClick={() => setOpenNewTaskDialog(true)}
        >
          <FaPlus />
        </Fab>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };





  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Render task list
  const renderTaskList = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box my={4} textAlign="center">
          <Typography color="error">{error}</Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => window.location.reload()}
            startIcon={<FaRedo />}
          >
            Retry
          </Button>
        </Box>
      );
    }

    if (filteredTasks.length === 0) {
      return (
        <Box my={4} textAlign="center">
          <FaClipboardList size={48} color="#ccc" />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No tasks found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {Object.values(filters).some(f => f !== 'all' && f !== '')
              ? 'Try adjusting your filters'
              : 'Create a new task to get started'}
          </Typography>
        </Box>
      );
    }

    return (
      <List>
        {filteredTasks.map((task) => (
          <React.Fragment key={task.id}>
            <ListItem
              button
              onClick={() => setSelectedTask(task)}
              className="task-list-item"
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={task.status === 'completed'}
                  onChange={(e) =>
                    handleStatusChange(
                      task.id,
                      e.target.checked ? 'completed' : 'in_progress'
                    )
                  }
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    style={{
                      textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                      color: task.status === 'completed' ? 'text.secondary' : 'text.primary'
                    }}
                  >
                    {task.title}
                  </Typography>
                }
                secondary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </Typography>
                    {task.priority && (
                      <Chip
                        label={task.priority}
                        size="small"
                        style={{
                          marginLeft: 8,
                          backgroundColor:
                            task.priority === 'high' ? '#ffebee' :
                              task.priority === 'medium' ? '#fff8e1' : '#e8f5e9',
                          color:
                            task.priority === 'high' ? '#c62828' :
                              task.priority === 'medium' ? '#f57f17' : '#2e7d32'
                        }}
                      />
                    )}
                  </React.Fragment>
                }
              />
              <Box display="flex" alignItems="center">
                {task.assignedToUser && (
                  <Avatar
                    src={task.assignedToUser.avatar}
                    alt={task.assignedToUser.name}
                    sx={{ width: 32, height: 32, marginRight: 1 }}
                  />
                )}
                <FaChevronRight />
              </Box>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    );
  };

  // Render task details dialog
  const renderTaskDialog = () => {
    if (!selectedTask) return null;

    return (
      <Dialog
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{selectedTask.title}</Typography>
            <IconButton onClick={() => setSelectedTask(null)}>
              <FaTimes />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>Description</Typography>
                <Typography variant="body1" paragraph>
                  {selectedTask.description || 'No description provided.'}
                </Typography>
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>Checklist</Typography>
                <FormGroup>
                  {(selectedTask.checklist || []).map((item) => (
                    <FormControlLabel
                      key={item.id}
                      control={
                        <Checkbox
                          checked={item.completed}
                          onChange={() => { }}
                          name={item.text}
                        />
                      }
                      label={item.text}
                    />
                  ))}
                </FormGroup>
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>Comments</Typography>
                <List>
                  {(selectedTask.comments || []).map((comment) => (
                    <Box key={comment.id} mb={2}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Avatar
                          src={comment.user?.avatar}
                          alt={comment.user?.name}
                          sx={{ width: 32, height: 32, marginRight: 1 }}
                        />
                        <Box>
                          <Typography variant="subtitle2">
                            {comment.user?.name || 'Anonymous'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(comment.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body1" style={{ marginLeft: 48 }}>
                        {comment.content}
                      </Typography>
                    </Box>
                  ))}
                </List>
                <Box mt={2} display="flex">
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Add a comment..."
                    multiline
                    rows={2}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ marginLeft: 8, alignSelf: 'flex-end' }}
                  >
                    Comment
                  </Button>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>Details</Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><FaRegCalendarAlt /></ListItemIcon>
                    <ListItemText
                      primary="Due Date"
                      secondary={new Date(selectedTask.dueDate).toLocaleDateString()}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><FaUserTie /></ListItemIcon>
                    <ListItemText
                      primary="Assigned To"
                      secondary={
                        selectedTask.assignedToUser ? (
                          <Box display="flex" alignItems="center">
                            <Avatar
                              src={selectedTask.assignedToUser.avatar}
                              alt={selectedTask.assignedToUser.name}
                              sx={{ width: 24, height: 24, marginRight: 1 }}
                            />
                            {selectedTask.assignedToUser.name}
                          </Box>
                        ) : 'Unassigned'
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><FaRegClock /></ListItemIcon>
                    <ListItemText
                      primary="Time Spent"
                      secondary={`${selectedTask.timeSpent || 0} hours`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><FaRegChartBar /></ListItemIcon>
                    <ListItemText
                      primary="Progress"
                      secondary={
                        <Box width="100%" display="flex" alignItems="center">
                          <Box width="100%" mr={1}>
                            <LinearProgress
                              variant="determinate"
                              value={selectedTask.progress || 0}
                            />
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            {selectedTask.progress || 0}%
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </List>
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>Attachments</Typography>
                <List>
                  {(selectedTask.attachments || []).map((file) => (
                    <ListItem key={file.id} button>
                      <ListItemIcon>
                        {file.mimeType?.includes('image/') ? (
                          <FaRegImage />
                        ) : file.mimeType?.includes('pdf') ? (
                          <FaRegFilePdf />
                        ) : (
                          <FaRegFile />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024).toFixed(1)} KB`}
                      />
                      <IconButton
                        edge="end"
                        aria-label="download"
                        href={file.url}
                        download
                      >
                        <FaDownload />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
                <input
                  accept="*"
                  style={{ display: 'none' }}
                  id="upload-file"
                  type="file"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleFileUpload(selectedTask.id, e.target.files[0]);
                    }
                  }}
                />
                <label htmlFor="upload-file">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<FaUpload />}
                    fullWidth
                  >
                    Upload File
                  </Button>
                </label>
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>Time Tracking</Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<FaRegClock />}
                  fullWidth
                  onClick={() => {
                    // Open time tracking dialog
                  }}
                >
                  Log Time
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTask(null)}>Close</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              // Handle task completion
              handleStatusChange(selectedTask.id, 'completed');
              setSelectedTask(null);
            }}
          >
            Mark as Complete
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Team management state is already declared at the top of the component
  // Reusing existing state variables:
  // - showAddMemberDialog
  // - userSearch

  // Render main content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'tasks':
        return renderTaskList();
      case 'deliverables':
        return (
          <Box textAlign="center" py={4}>
            <FaClipboardCheck size={48} color="#ccc" />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Deliverables
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Track and manage project deliverables
            </Typography>
          </Box>
        );
      case 'time':
        return (
          <Box textAlign="center" py={4}>
            <FaRegClock size={48} color="#ccc" />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Time Tracking
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Track time spent on tasks
            </Typography>
          </Box>
        );
      case 'team':
        return (
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Team Management
            </Typography>
            <Typography color="textSecondary">
              Team management features coming soon.
            </Typography>
          </Box>
        );
      default:
        return renderTaskList();
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" component="h1">UI/UX Task Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<FaPlus />}
          onClick={() => {
            // Handle new task creation
          }}
        >
          New Task
        </Button>
      </Box>

      <Paper elevation={2} style={{ marginBottom: 24, padding: 16 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="not_started">Not Started</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="in_review">In Review</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                label="Priority"
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Assigned To</InputLabel>
              <Select
                value={filters.assignedTo}
                onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
                label="Assigned To"
              >
                <MenuItem value="all">Everyone</MenuItem>
                <MenuItem value="me">Assigned to Me</MenuItem>
                <MenuItem value="others">Assigned to Others</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: <FaSearch style={{ marginRight: 8, color: 'rgba(0, 0, 0, 0.54)' }} />
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <StyledTabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="task management tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label={
                <Box display="flex" alignItems="center">
                  <FaTasks style={{ marginRight: 8 }} />
                  <span>Tasks</span>
                </Box>
              }
              value="tasks"
              {...a11yProps(0)}
            />
            <Tab
              label={
                <Box display="flex" alignItems="center">
                  <FaClipboardCheck style={{ marginRight: 8 }} />
                  <span>Deliverables</span>
                </Box>
              }
              value="deliverables"
              {...a11yProps(1)}
            />
            <Tab
              label={
                <Box display="flex" alignItems="center">
                  <FaRegClock style={{ marginRight: 8 }} />
                  <span>Time Tracking</span>
                </Box>
              }
              value="time"
              {...a11yProps(2)}
            />
            <Tab
              label={
                <Box display="flex" alignItems="center">
                  <FaUsers style={{ marginRight: 8 }} />
                  <span>Team</span>
                </Box>
              }
              value="team"
              {...a11yProps(3)}
            />
          </StyledTabs>
        </Box>

        {renderTabContent()}
      </Paper>

      {renderTaskDialog()}
    </Box>
  );
};

export default TaskManagement;

