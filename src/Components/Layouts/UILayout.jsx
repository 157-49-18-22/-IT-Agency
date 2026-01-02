import React, { useState, useContext, useEffect, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  FaHome,
  FaPalette,
  FaCalendarAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaTasks,
  FaImage,
  FaMobileAlt,
  FaDesktop,
  FaClipboardList,
  FaProjectDiagram,
  FaCheckCircle,
  FaClock,
  FaUsers,
  FaFileImage,
  FaCheckSquare,
  FaCommentDots,
  FaPlus,
  FaUpload,
  FaComments,
  FaTools,
  FaBook,
  FaExclamationTriangle,
  FaLaptopCode,
  FaTabletAlt,
  FaSearch,
  FaCog,
  FaPencilRuler,
  FaEyeDropper,
  FaVectorSquare,
  FaDownload,
  FaCloudUploadAlt,
  FaCheck,
  FaTimes,
  FaPaperclip,
  FaBell,
  FaEnvelope,
  FaUserFriends,
  FaClipboardCheck,
  FaFolderOpen,
  FaFilePdf,
  FaFileWord,
  FaFileImage as FaImageFile,
  FaVideo,
  FaFileArchive,
  FaBoxOpen,
  FaFileAlt,
  FaRedo,
  FaUserTie,
  FaQuestionCircle,
  FaArrowRight,
  FaShareAlt,
  FaAt,
  FaUserCircle,
  FaEllipsisH,
  FaPaperPlane,
  FaThumbsUp,
  FaReply,
  FaEdit,
  FaTrash,
  FaSmile,
  FaImage as FaImageIcon,
  FaLink,
  FaFileAlt as FaFileAltIcon,
  FaVideo as FaVideoIcon,
  FaMusic,
  FaMapMarkerAlt,
  FaGift,
  FaStickyNote,
  FaUserPlus,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaUserEdit,
  FaUserCog,
  FaUserShield,
  FaUserTag,
  FaUserGraduate,
  FaUsersCog,
  FaUserInjured,
  FaUserMd,
  FaUserNurse,
  FaUserSecret,
  FaEye,
  FaPhone,
  FaPlusCircle,
  FaFilter,
  FaSort,
  FaClock as FaClockSolid,
  FaRegClock,
  FaRegCheckCircle,
  FaRegTimesCircle,
  FaRegThumbsUp,
  FaRegThumbsDown,
  FaRegCommentDots,
  FaHistory,
  FaRegCalendarAlt,
  FaRegClock as FaRegClockAlt,
  FaRegFileAlt,
  FaRegFileArchive,
  FaRegFilePdf,
  FaRegFileWord,
  FaRegFileImage,
  FaRegFileVideo,
  FaRegFileAudio,
  FaRegFileCode,
  FaRegFile,
  FaRegStar,
  FaStar,
  FaRegBell,
  FaBellSlash,
  FaRegCalendarPlus,
  FaRegCalendarCheck,
  FaRegCalendarMinus,
  FaRegCalendarTimes,
  FaRegCalendarAlt as FaRegCalendar,
  FaRegChartBar,
  FaRegCheckSquare,
  FaRegCircle,
  FaRegClock as FaRegClockIcon,
  FaRegClone,
  FaRegComment,
  FaRegCommentAlt,
  FaRegComments,
  FaRegCopy,
  FaRegDotCircle,
  FaRegEdit,
  FaRegEnvelope,
  FaRegEnvelopeOpen,
  FaRegEye,
  FaRegEyeSlash,
  FaRegFileAlt as FaRegFileAlt2,
  FaRegFileArchive as FaRegFileArchive2,
  FaRegFileAudio as FaRegFileAudio2,
  FaRegFileCode as FaRegFileCode2,
  FaRegFileExcel,
  FaRegFileImage as FaRegFileImage2,
  FaRegFilePdf as FaRegFilePdf2,
  FaRegFilePowerpoint,
  FaRegFileVideo as FaRegFileVideo2,
  FaRegFileWord as FaRegFileWord2,
  FaRegFlag,
  FaRegFolder,
  FaRegFolderOpen,
  FaRegFrown,
  FaRegFrownOpen,
  FaRegGrin,
  FaRegGrinBeam,
  FaRegGrinHearts,
  FaRegGrinStars,
  FaRegHandPaper,
  FaRegHandPeace,
  FaRegHandPointDown,
  FaRegHandPointLeft,
  FaRegHandPointRight,
  FaRegHandPointUp,
  FaRegHandPointer,
  FaRegHandRock,
  FaRegHandScissors,
  FaRegHandshake,
  FaRegHeart,
  FaRegHospital,
  FaRegHourglass,
  FaRegIdBadge,
  FaRegIdCard,
  FaRegImage,
  FaRegImages,
  FaRegKeyboard,
  FaRegLaugh,
  FaRegLaughBeam,
  FaRegLaughSquint,
  FaRegLaughWink,
  FaRegLemon,
  FaRegLifeRing,
  FaRegLightbulb,
  FaRegListAlt,
  FaRegMap,
  FaRegMeh,
  FaRegMehBlank,
  FaRegMehRollingEyes,
  FaRegMinusSquare,
  FaRegMoneyBillAlt,
  FaRegMoon,
  FaRegNewspaper,
  FaRegObjectGroup,
  FaRegObjectUngroup,
  FaRegPaperPlane,
  FaRegPauseCircle,
  FaRegPlayCircle,
  FaRegPlusSquare,
  FaRegQuestionCircle,
  FaRegRegistered,
  FaRegSadCry,
  FaRegSadTear,
  FaRegSave,
  FaRegShareSquare,
  FaRegWindowMinimize,
  FaRegWindowRestore,
  FaRegClock as FaRegClock2,
  FaRegCalendarAlt as FaRegCalendarAlt2,

  FaRegFileAlt as FaRegFileAlt3,
  FaRegFileArchive as FaRegFileArchive3,
  FaRegFileAudio as FaRegFileAudio3,
  FaRegFileCode as FaRegFileCode3,
  FaRegClipboard,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { ProjectContext } from '../../context/ProjectContext';
import uiuxService from '../../services/uiuxService';
import { projectsAPI, messageAPI } from '../../services/api';
import './UILayout.css';

// Status options for tasks
const statusOptions = [
  { value: 'To Do', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'In Review', label: 'In Review' },
  { value: 'Completed', label: 'Completed' },
];

const UILayout = ({ projectId, onComplete }) => {
  const { logout, currentUser } = useAuth();
  const { getProjectsByUser, getProjectsByDepartment } = useContext(ProjectContext);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread messages
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        if (!currentUser) return;
        const res = await messageAPI.getMessages();
        const messages = res.data?.data || [];
        const rawMessages = Array.isArray(messages) ? messages : [];

        const count = rawMessages.filter(msg => {
          // Check if I am NOT the sender
          if (msg.senderId === currentUser.id) return false;

          // Check if I haven't read it
          const readByMe = msg.readBy && Array.isArray(msg.readBy) && msg.readBy.some(r => r.user === currentUser.id);
          return !readByMe;
        }).length;

        setUnreadCount(count);
      } catch (e) {
        console.error("Failed to fetch unread messages", e);
      }
    };

    fetchUnreadCount();
    // Poll every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleMessageClick = () => {
    navigate('/messages');
  };

  // State for projects, tasks and comments
  const [uiuxProjects, setUiuxProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [currentDate] = useState(new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  // Fetch tasks from the backend
  const fetchTasks = useCallback(async () => {
    if (!projectId) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await uiuxService.getProjectTasks(projectId);
      setTasks(response.data);

      // Check if all deliverables are completed
      const allCompleted = response.data.every(task => task.status === 'Completed');
      setPhaseCompleted(allCompleted);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Fetch projects and tasks on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectsAPI.getProjects();

        let fetchedProjects = [];
        // Robust data extraction
        if (response.data) {
          if (Array.isArray(response.data)) {
            fetchedProjects = response.data;
          } else if (Array.isArray(response.data.data)) {
            fetchedProjects = response.data.data;
          } else if (Array.isArray(response.data.projects)) {
            fetchedProjects = response.data.projects;
          }
        }

        setUiuxProjects(fetchedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setUiuxProjects([]);
      }
    };

    fetchProjects();
    fetchTasks();
  }, [fetchTasks]);

  // Toggle task status
  const toggleTaskStatus = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Completed' ? 'In Progress' : 'Completed';
      await uiuxService.updateTaskStatus(taskId, { status: newStatus });

      // Update local state
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? { ...task, status: newStatus }
            : task
        )
      );

      // Check if all tasks are completed
      const allCompleted = tasks.every(task =>
        task.id === taskId ? newStatus === 'Completed' : task.status === 'Completed'
      );
      setPhaseCompleted(allCompleted);
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status. Please try again.');
    }
  };

  // Handle file upload
  const handleFileUpload = async (e, taskId) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      const uploadPromises = files.map(file =>
        uiuxService.uploadAttachment(taskId, file)
      );

      const results = await Promise.all(uploadPromises);

      // Update local state with new attachments
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? {
              ...task,
              attachments: [
                ...(task.attachments || []),
                ...results.map(res => res.data)
              ]
            }
            : task
        )
      );

      // Update uploaded files state for UI feedback
      setUploadedFiles(prev => [
        ...prev,
        ...files.map(file => ({
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'completed'
        }))
      ]);

    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Failed to upload files. Please try again.');
    }
  };

  // Handle comment form submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (activeTask && comment.trim()) {
      handleAddComment(activeTask.id, comment);
    }
  };

  // Handle adding a comment
  const handleAddComment = async (taskId, content) => {
    if (!content.trim()) return;

    try {
      const response = await uiuxService.addComment(taskId, { content });

      // Update local state with new comment
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId
            ? {
              ...task,
              comments: [
                ...(task.comments || []),
                {
                  ...response.data,
                  user: currentUser?.name || 'Current User',
                  time: 'Just now',
                  timestamp: new Date().toISOString()
                }
              ]
            }
            : task
        )
      );

      setComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    }
  };

  // Handle completing a checklist item
  const toggleChecklistItem = async (taskId, itemId, completed) => {
    try {
      // Find the task
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Update the checklist item
      const updatedChecklist = task.checklist.map(item =>
        item.id === itemId ? { ...item, completed: !completed } : item
      );

      // Update the task in the backend
      await uiuxService.updateTask(taskId, {
        ...task,
        checklist: updatedChecklist
      });

      // Update local state
      setTasks(prev =>
        prev.map(t =>
          t.id === taskId
            ? { ...t, checklist: updatedChecklist }
            : t
        )
      );
    } catch (err) {
      console.error('Error updating checklist:', err);
      setError('Failed to update checklist. Please try again.');
    }
  };

  // State for UI
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  // Helper function to check if a route is active
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // The AuthProvider will handle the redirection
    } catch (error) {
      console.error('Error during logout:', error);
      setError('Failed to log out. Please try again.');
    }
  };

  // State for tasks and UI
  const [activeTask, setActiveTask] = useState(null);
  const [activeDeliverable, setActiveDeliverable] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [phaseCompleted, setPhaseCompleted] = useState(false);
  const [deliverables, setDeliverables] = useState([]);
  const [mockDeliverables, setMockDeliverables] = useState([
    { id: 1, name: 'Wireframes', status: 'In Progress', dueDate: '2025-12-15' },
    { id: 2, name: 'Mockups', status: 'Not Started', dueDate: '2025-12-22' },
    { id: 3, name: 'Prototype', status: 'Not Started', dueDate: '2025-12-29' },
  ]);

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

  const handleCompletePhase = () => {
    // TODO: Save any final UI/UX phase data

    // Mark phase as completed
    setPhaseCompleted(true);

    // Notify parent component
    if (onComplete) {
      onComplete();
    }
  };

  const checkPhaseCompletion = useCallback(() => {
    const allCompleted = mockDeliverables.every(d => d.status === 'Completed');
    setPhaseCompleted(allCompleted);
  }, []);

  useEffect(() => {
    checkPhaseCompletion();
  }, [mockDeliverables, checkPhaseCompletion]);

  const [timeLogs, setTimeLogs] = useState([
    { id: 1, taskId: 1, date: '2025-11-29', hours: 2.5, description: 'Worked on login page design' },
    { id: 2, taskId: 1, date: '2025-11-28', hours: 3, description: 'Initial design concepts' },
  ]);

  const [activeTimer, setActiveTimer] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [timerDescription, setTimerDescription] = useState('');

  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    dueDate: 'all',
    assignedTo: 'all',
  });

  const [sortConfig, setSortConfig] = useState({
    key: 'dueDate',
    direction: 'asc',
  });

  const [clientFeedback, setClientFeedback] = useState([
    {
      id: 1,
      taskId: 1,
      clientName: 'Acme Corp',
      comment: 'The login page looks great! Just a few minor adjustments needed on the mobile view.',
      status: 'pending',
      attachments: [],
      timestamp: '2025-11-29T14:30:00',
      responses: [
        {
          id: 1,
          userId: currentUser?.id || 1,
          userName: currentUser?.name || 'You',
          comment: 'Thanks for the feedback! We\'ll make those adjustments.',
          timestamp: '2025-11-29T15:15:00',
          attachments: []
        }
      ]
    }
  ]);

  const [versionHistory, setVersionHistory] = useState([
    {
      id: 1,
      taskId: 1,
      version: '1.0.0',
      date: '2025-11-28',
      changes: 'Initial design concept',
      author: currentUser?.name || 'John Doe',
      files: [
        { id: 1, name: 'login_v1.sketch', size: '2.4 MB', type: 'sketch' },
        { id: 2, name: 'style_guide_v1.pdf', size: '1.2 MB', type: 'pdf' }
      ]
    },
    {
      id: 2,
      taskId: 1,
      version: '1.1.0',
      date: '2025-11-29',
      changes: 'Updated color scheme and typography',
      author: currentUser?.name || 'John Doe',
      files: [
        { id: 3, name: 'login_v2.sketch', size: '2.6 MB', type: 'sketch' },
        { id: 4, name: 'style_guide_v2.pdf', size: '1.3 MB', type: 'pdf' }
      ]
    }
  ]);

  const startTimer = (taskId) => {
    if (activeTimer && activeTimer.taskId !== taskId) {
      // If another timer is running, stop it first
      stopTimer();
    }

    setActiveTimer({
      taskId,
      startTime: new Date(),
      description: ''
    });
    setIsTracking(true);
    setElapsedTime(0);
  };

  const stopTimer = () => {
    if (!activeTimer) return;

    const endTime = new Date();
    const timeSpent = (endTime - activeTimer.startTime) / (1000 * 60 * 60); // Convert to hours

    // Save the time log
    const newTimeLog = {
      id: Date.now(),
      taskId: activeTimer.taskId,
      date: new Date().toISOString().split('T')[0],
      hours: parseFloat(timeSpent.toFixed(2)),
      description: timerDescription || `Worked on task ${activeTimer.taskId}`
    };

    setTimeLogs([...timeLogs, newTimeLog]);
    setActiveTimer(null);
    setIsTracking(false);
    setTimerDescription('');

    // Update task's time spent
    const task = tasks.find(t => t.id === activeTimer.taskId);
    if (task) {
      const currentHours = parseFloat(task.timeSpent) || 0;
      const newHours = currentHours + timeSpent;

      setTasks(prev => prev.map(t =>
        t.id === activeTimer.taskId
          ? { ...t, timeSpent: newHours.toFixed(2) + 'h' }
          : t
      ));
    }
  };

  const getFilteredAndSortedTasks = () => {
    let filtered = [...tasks];

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.dueDate !== 'all') {
      const today = new Date().toISOString().split('T')[0];

      switch (filters.dueDate) {
        case 'today':
          filtered = filtered.filter(task => task.dueDate === today);
          break;
        case 'this_week':
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          filtered = filtered.filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate >= new Date(today) && taskDate <= nextWeek;
          });
          break;
        case 'overdue':
          filtered = filtered.filter(task => new Date(task.dueDate) < new Date(today));
          break;
        default:
          break;
      }
    }

    if (filters.assignedTo !== 'all') {
      filtered = filtered.filter(task =>
        filters.assignedTo === 'me'
          ? task.assignedTo === 'Me' || task.assignedTo === (currentUser?.name || 'You')
          : true
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const addClientFeedback = (taskId, comment, attachments = []) => {
    const newFeedback = {
      id: Date.now(),
      taskId,
      clientName: currentUser?.name || 'Client',
      comment,
      status: 'pending',
      attachments,
      timestamp: new Date().toISOString(),
      responses: []
    };

    setClientFeedback([newFeedback, ...clientFeedback]);
  };

  const respondToFeedback = (feedbackId, comment, attachments = []) => {
    const response = {
      id: Date.now(),
      userId: currentUser?.id || 1,
      userName: currentUser?.name || 'You',
      comment,
      timestamp: new Date().toISOString(),
      attachments
    };

    setClientFeedback(prev =>
      prev.map(fb =>
        fb.id === feedbackId
          ? { ...fb, responses: [...fb.responses, response] }
          : fb
      )
    );
  };

  const updateFeedbackStatus = (feedbackId, status) => {
    setClientFeedback(prev =>
      prev.map(fb =>
        fb.id === feedbackId
          ? { ...fb, status }
          : fb
      )
    );
  };

  const addNewVersion = (taskId, version, changes, files = []) => {
    const newVersion = {
      id: Date.now(),
      taskId,
      version,
      date: new Date().toISOString().split('T')[0],
      changes,
      author: currentUser?.name || 'John Doe',
      files: files.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        size: file.size,
        type: file.type || 'file'
      }))
    };

    setVersionHistory([newVersion, ...versionHistory]);
  };

  const filteredTasks = getFilteredAndSortedTasks();

  const totalHoursLogged = timeLogs.reduce((total, log) => total + log.hours, 0);

  const currentTask = activeTimer ? tasks.find(t => t.id === activeTimer.taskId) : null;

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-logo">
          <h2>UI/UX Portal</h2>
        </div>

        <div className="user-profile">
          <div className="user-avatar">
            <img
              src={currentUser?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg'}
              alt="User"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2NjYyIgZD0iTTEyLDEyQzE0LjIxLDEyIDE2LDEwLjIxIDE2LDhTMTQuMjEsNCAxMiw0UzgsNS43OSA4LDhTOS43OSwxMiAxMiwxMk0xMiwxNEM3LjU4LDE0IDQsMTUuNzkgNCwxOFYyMEgyMFYxOEMyMCwxNS43OSAxNi40MiwxNCAxMiwxNFoiLz48L3N2Zz4=';
              }}
            />
          </div>
          <div className="user-info">
            <span className="user-name">{currentUser?.name || 'John Doe'}</span>

            <span className="user-role">
              <FaPalette className="role-icon" /> UI/UX Team
            </span>
            <div className="user-actions">


            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className={isActive('/dashboard')}>
              <Link to="/dashboard">
                <FaHome className="nav-icon" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className={isActive('/projects')}>
              <Link to="/projects">
                <FaProjectDiagram className="nav-icon" />
                <span>Projects</span>
                <span className="badge">{uiuxProjects.length}</span>
              </Link>
            </li>
            {/* <li className={isActive('/tasks')}>
              <Link to="/tasks">
                <FaTasks className="nav-icon" />
                <span>My Tasks</span>
                <span className="badge">5</span>
              </Link>
            </li> */}

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

            <li className={isActive('/files')}>
              <Link to="/files">
                <FaFolderOpen className="nav-icon" />
                <span>Deliverables</span>
              </Link>
            </li>

            <li className={isActive('/calendar')}>
              <Link to="/calendar">
                <FaCalendarAlt className="nav-icon" />
                <span>Calendar</span>
              </Link>
            </li>
            <li className={isActive('/messages')}>
              <Link to="/messages">
                <FaEnvelope className="nav-icon" />
                <span>Messages</span>
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </Link>
            </li>
            <li className={isActive('/task-management')}>
              <Link to="/task-management">
                <FaClipboardList className="nav-icon" />
                <span>Task Management</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Phase Completion Button */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          disabled={!phaseCompleted}
          onClick={handleCompletePhase}
          startIcon={<FaCheckCircle />}
        >
          {phaseCompleted ? 'Complete UI/UX Phase' : 'Complete All Deliverables First'}
        </Button>
      </Box>

      {/* Time Tracking Bar */}
      {isTracking && activeTimer && (
        <div className="time-tracking-bar">
          <div className="time-tracking-content">
            <div className="time-tracking-info">
              <FaClockSolid className="pulse" />
              <span className="task-name">
                Tracking time for: <strong>{currentTask?.title || 'Task'}</strong>
              </span>
              <span className="elapsed-time">
                {Math.floor(elapsedTime / 3600).toString().padStart(2, '0')}:
                {Math.floor((elapsedTime % 3600) / 60).toString().padStart(2, '0')}:
                {(elapsedTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="time-tracking-actions">
              <TextField
                size="small"
                placeholder="What are you working on?"
                value={timerDescription}
                onChange={(e) => setTimerDescription(e.target.value)}
                className="timer-description"
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={stopTimer}
                startIcon={<FaRegStopCircle />}
              >
                Stop
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default UILayout;