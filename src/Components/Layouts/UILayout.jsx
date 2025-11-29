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
  FaRegSmile,
  FaRegSmileBeam,
  FaRegSmileWink,
  FaRegSnowflake,
  FaRegSquare,
  FaRegStar as FaRegStarIcon,
  FaRegStarHalf,
  FaRegStickyNote,
  FaRegStopCircle,
  FaRegSun,
  FaRegThumbsDown as FaRegThumbsDown2,
  FaRegThumbsUp as FaRegThumbsUp2,
  FaRegTrashAlt,
  FaRegUser,
  FaRegUserCircle,
  FaRegWindowMaximize,
  FaRegWindowMinimize,
  FaRegWindowRestore,
  FaRegClock as FaRegClock2,
  FaRegCalendarAlt as FaRegCalendarAlt2,
  FaRegFileAlt as FaRegFileAlt3,
  FaRegFileArchive as FaRegFileArchive3,
  FaRegFileAudio as FaRegFileAudio3,
  FaRegFileCode as FaRegFileCode3,
  FaRegFileExcel as FaRegFileExcel2,
  FaRegFileImage as FaRegFileImage3,
  FaRegFilePdf as FaRegFilePdf3,
  FaRegFilePowerpoint as FaRegFilePowerpoint2,
  FaRegFileVideo as FaRegFileVideo3,
  FaRegFileWord as FaRegFileWord3,
  FaRegStar as FaRegStar2,
  FaRegThumbsUp as FaRegThumbsUp3,
  FaRegThumbsDown as FaRegThumbsDown3
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { ProjectContext } from '../../context/ProjectContext';
import './UILayout.css';

// Mock data for tasks and deliverables
const mockTasks = [
  { 
    id: 1, 
    title: 'Design Login Page', 
    status: 'In Progress', 
    dueDate: '2025-12-01', 
    priority: 'high', 
    assignedTo: 'Me',
    description: 'Create a modern and user-friendly login page with social media integration',
    checklist: [
      { id: 1, text: 'Research documentation uploaded', completed: true },
      { id: 2, text: 'Wireframes created and reviewed', completed: true },
      { id: 3, text: 'High-fidelity mockups delivered', completed: false },
      { id: 4, text: 'Interactive prototype shared', completed: false },
      { id: 5, text: 'Design specifications documented', completed: false },
      { id: 6, text: 'Asset library organized', completed: false }
    ],
    comments: [
      { id: 1, user: 'John D.', text: 'Please review the color scheme', time: '2 hours ago' },
      { id: 2, user: 'You', text: 'Working on the final mockups', time: '1 hour ago' }
    ],
    attachments: [
      { id: 1, name: 'login_wireframe.pdf', type: 'pdf', size: '2.4 MB', url: '#' },
      { id: 2, name: 'style_guide.pdf', type: 'pdf', size: '1.8 MB', url: '#' }
    ],
    timeSpent: '4h 30m',
    progress: 45
  },
  { 
    id: 2, 
    title: 'Create User Dashboard', 
    status: 'Not Started', 
    dueDate: '2025-12-05', 
    priority: 'medium', 
    assignedTo: 'Me',
    description: 'Design an intuitive dashboard with key metrics and quick actions',
    checklist: [
      { id: 1, text: 'Research documentation uploaded', completed: false },
      { id: 2, text: 'Wireframes created and reviewed', completed: false },
      { id: 3, text: 'High-fidelity mockups delivered', completed: false },
      { id: 4, text: 'Interactive prototype shared', completed: false },
      { id: 5, text: 'Design specifications documented', completed: false },
      { id: 6, text: 'Asset library organized', completed: false }
    ],
    comments: [],
    attachments: [],
    timeSpent: '0h 0m',
    progress: 0
  },
  { 
    id: 3, 
    title: 'Mobile Responsive Design', 
    status: 'Review', 
    dueDate: '2025-11-30', 
    priority: 'high', 
    assignedTo: 'John D.',
    description: 'Ensure all designs are responsive across mobile devices',
    checklist: [
      { id: 1, text: 'Research documentation uploaded', completed: true },
      { id: 2, text: 'Wireframes created and reviewed', completed: true },
      { id: 3, text: 'High-fidelity mockups delivered', completed: true },
      { id: 4, text: 'Interactive prototype shared', completed: true },
      { id: 5, text: 'Design specifications documented', completed: true },
      { id: 6, text: 'Asset library organized', completed: true }
    ],
    comments: [
      { id: 1, user: 'John D.', text: 'Please review the mobile navigation', time: '1 day ago' },
      { id: 2, user: 'Sarah M.', text: 'Looks good! Just a few minor adjustments needed', time: '5 hours ago' }
    ],
    attachments: [
      { id: 1, name: 'mobile_mockups.zip', type: 'zip', size: '5.2 MB', url: '#' },
      { id: 2, name: 'responsive_guide.pdf', type: 'pdf', size: '3.1 MB', url: '#' }
    ],
    timeSpent: '12h 15m',
    progress: 90
  },
];

const mockDeliverables = [
  { 
    id: 1, 
    name: 'Wireframes', 
    status: 'Completed', 
    type: 'wireframe', 
    files: 3, 
    lastUpdated: '2025-11-26',
    submittedBy: 'You',
    submittedOn: '2025-11-25',
    reviewStatus: 'Approved',
    filesList: [
      { id: 1, name: 'login_wireframe.pdf', type: 'pdf', size: '2.4 MB', url: '#' },
      { id: 2, name: 'dashboard_wireframe.pdf', type: 'pdf', size: '3.1 MB', url: '#' },
      { id: 3, name: 'profile_wireframe.pdf', type: 'pdf', size: '2.8 MB', url: '#' }
    ],
    feedback: 'Great work! The wireframes look clean and intuitive. Just a few minor adjustments needed.'
  },
  { id: 2, name: 'Mockups', status: 'In Review', type: 'mockup', files: 5, lastUpdated: '2025-11-25' },
  { id: 3, name: 'Prototype', status: 'In Progress', type: 'prototype', files: 2, lastUpdated: '2025-11-24' },
];

const UILayout = ({ projectId, onComplete }) => {
  const { logout, currentUser } = useAuth();
  const { getProjectsByUser, getProjectsByDepartment } = useContext(ProjectContext);
  const [showFileUpload, setShowFileUpload] = useState(false);
  
  // Initialize comments state with sample data
  const [comments, setComments] = useState([
    {
      id: 1,
      user: 'John Doe',
      text: 'Completed the login page design',
      time: '2 hours ago',
      project: 'JSNJA',
      type: 'update',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      user: 'Jane Smith',
      text: 'Left a comment on the dashboard layout',
      time: '5 hours ago',
      project: 'Network',
      type: 'comment',
      timestamp: '5 hours ago'
    },
    {
      id: 3,
      user: 'Mike Johnson',
      text: 'Updated the color scheme',
      time: '1 day ago',
      project: 'E-commerce',
      type: 'update',
      timestamp: '1 day ago'
    }
  ]);
  
  const [comment, setComment] = useState('');
  
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    const newComment = {
      id: Date.now(),
      user: currentUser?.name || 'Current User',
      text: comment,
      time: 'Just now',
      project: 'Current Project',
      type: 'comment',
      timestamp: 'Just now'
    };
    
    setComments([newComment, ...comments]);
    setComment('');
  };

  const [myProjects, setMyProjects] = useState([
    { id: 1, name: 'JSNJA', type: 'Web App', progress: 75 },
    { id: 2, name: 'Network', type: 'Mobile App', progress: 45 },
  ]);
  const [uiuxProjects, setUiuxProjects] = useState([
    { id: 1, name: 'E-commerce Redesign', type: 'Web Design', progress: 90 },
    { id: 2, name: 'Mobile Banking App', type: 'Mobile App', progress: 65 },
  ]);
  
  const [teamMembers] = useState([
    { id: 1, name: 'John Doe', role: 'UI/UX Designer', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: 2, name: 'Jane Smith', role: 'Frontend Developer', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
    { id: 3, name: 'Mike Johnson', role: 'Backend Developer', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
    { id: 4, name: 'Sarah Williams', role: 'Project Manager', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
  ]);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = useCallback((path) => {
    return location.pathname === path ? 'active' : '';
  }, [location.pathname]);
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Load projects and tasks for the current user
  useEffect(() => {
    if (currentUser?.id) {
      const projects = getProjectsByUser(currentUser.id);
      const uiuxProjects = getProjectsByDepartment('UI/UX');
      setMyProjects(projects);
      setUiuxProjects(uiuxProjects);
    }
  }, [currentUser, getProjectsByUser, getProjectsByDepartment]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending'
    }));
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    switch(ext) {
      case 'pdf':
        return <FaFilePdf className="file-icon pdf" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FaImage className="file-icon image" />;
      case 'zip':
      case 'rar':
        return <FaFileArchive className="file-icon archive" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="file-icon word" />;
      default:
        return <FaFileAlt className="file-icon" />;
    }
  };

  const [activeTask, setActiveTask] = useState(null);
  const [activeDeliverable, setActiveDeliverable] = useState(null);

  const toggleTaskStatus = (taskId, currentStatus) => {
    setMockTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: currentStatus === 'Completed' ? 'In Progress' : 'Completed'
          } 
        : task
    ));
  };

  const [mockTasks, setMockTasks] = useState([
    { 
      id: 1, 
      title: 'Design Login Page', 
      status: 'In Progress', 
      dueDate: '2025-12-01', 
      priority: 'high', 
      assignedTo: 'Me',
      description: 'Create a modern and user-friendly login page with social media integration',
      checklist: [
        { id: 1, text: 'Research documentation uploaded', completed: true },
        { id: 2, text: 'Wireframes created and reviewed', completed: true },
        { id: 3, text: 'High-fidelity mockups delivered', completed: false },
        { id: 4, text: 'Interactive prototype shared', completed: false },
        { id: 5, text: 'Design specifications documented', completed: false },
        { id: 6, text: 'Asset library organized', completed: false }
      ],
      comments: [
        { id: 1, user: 'John D.', text: 'Please review the color scheme', time: '2 hours ago' },
        { id: 2, user: 'You', text: 'Working on the final mockups', time: '1 hour ago' }
      ],
      attachments: [
        { id: 1, name: 'login_wireframe.pdf', type: 'pdf', size: '2.4 MB', url: '#' },
        { id: 2, name: 'style_guide.pdf', type: 'pdf', size: '1.8 MB', url: '#' }
      ],
      timeSpent: '4h 30m',
      progress: 45
    },
    { 
      id: 2, 
      title: 'Create User Dashboard', 
      status: 'Not Started', 
      dueDate: '2025-12-05', 
      priority: 'medium', 
      assignedTo: 'Me',
      description: 'Design an intuitive dashboard with key metrics and quick actions',
      checklist: [
        { id: 1, text: 'Research documentation uploaded', completed: false },
        { id: 2, text: 'Wireframes created and reviewed', completed: false },
        { id: 3, text: 'High-fidelity mockups delivered', completed: false },
        { id: 4, text: 'Interactive prototype shared', completed: false },
        { id: 5, text: 'Design specifications documented', completed: false },
        { id: 6, text: 'Asset library organized', completed: false }
      ],
      comments: [],
      attachments: [],
      timeSpent: '0h 0m',
      progress: 0
    },
    { 
      id: 3, 
      title: 'Mobile Responsive Design', 
      status: 'Review', 
      dueDate: '2025-11-30', 
      priority: 'high', 
      assignedTo: 'John D.',
      description: 'Ensure all designs are responsive across mobile devices',
      checklist: [
        { id: 1, text: 'Research documentation uploaded', completed: true },
        { id: 2, text: 'Wireframes created and reviewed', completed: true },
        { id: 3, text: 'High-fidelity mockups delivered', completed: true },
        { id: 4, text: 'Interactive prototype shared', completed: true },
        { id: 5, text: 'Design specifications documented', completed: true },
        { id: 6, text: 'Asset library organized', completed: true }
      ],
      comments: [
        { id: 1, user: 'John D.', text: 'Please review the mobile navigation', time: '1 day ago' },
        { id: 2, user: 'Sarah M.', text: 'Looks good! Just a few minor adjustments needed', time: '5 hours ago' }
      ],
      attachments: [
        { id: 1, name: 'mobile_mockups.zip', type: 'zip', size: '5.2 MB', url: '#' },
        { id: 2, name: 'responsive_guide.pdf', type: 'pdf', size: '3.1 MB', url: '#' }
      ],
      timeSpent: '12h 15m',
      progress: 90
    }
  ]);

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

  const [activeTab, setActiveTab] = useState('wireframes');
  const [phaseCompleted, setPhaseCompleted] = useState(false);

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
    const task = mockTasks.find(t => t.id === activeTimer.taskId);
    if (task) {
      const currentHours = parseFloat(task.timeSpent) || 0;
      const newHours = currentHours + timeSpent;
      
      setMockTasks(prev => prev.map(t => 
        t.id === activeTimer.taskId 
          ? { ...t, timeSpent: newHours.toFixed(2) + 'h' } 
          : t
      ));
    }
  };

  const getFilteredAndSortedTasks = () => {
    let filtered = [...mockTasks];
    
    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }
    
    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }
    
    if (filters.dueDate !== 'all') {
      const today = new Date().toISOString().split('T')[0];
      
      switch(filters.dueDate) {
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
  
  const currentTask = activeTimer ? mockTasks.find(t => t.id === activeTimer.taskId) : null;

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
            <span className="user-email">john.doe@example.com</span>
            <span className="user-role">
              <FaPalette className="role-icon" /> UI/UX Team
            </span>
            <div className="user-actions">
              <button className="icon-btn" title="Notifications">
                <FaBell />
                <span className="notification-badge">3</span>
              </button>
              <button className="icon-btn" title="Messages">
                <FaEnvelope />
                <span className="notification-badge">2</span>
              </button>
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
            <li className={isActive('/tasks')}>
              <Link to="/tasks">
                <FaTasks className="nav-icon" />
                <span>My Tasks</span>
                <span className="badge">5</span>
              </Link>
            </li>
            <li className={isActive('/team')}>
              <Link to="/team">
                <FaUsers className="nav-icon" />
                <span>Team</span>
              </Link>
            </li>
            <li className={isActive('/calendar')}>
              <Link to="/calendar">
                <FaCalendarAlt className="nav-icon" />
                <span>Calendar</span>
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
      <main className="main-content">
        <div className="top-bar">
          <div className="page-title">
            <h1>UI/UX Dashboard</h1>
            <div className="dashboard-stats">
              <div className="stat-item">
                <FaRegClock />
                <span>{totalHoursLogged.toFixed(1)} hours logged</span>
              </div>
              <div className="stat-item">
                <FaRegCheckCircle />
                <span>{mockTasks.filter(t => t.status === 'Completed').length} of {mockTasks.length} tasks completed</span>
              </div>
              <div className="stat-item">
                <FaRegCalendarAlt />
                <span>{currentDate}</span>
              </div>
            </div>
          </div>
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search tasks, projects..." />
            <button className="btn btn-primary">
              <FaPlus /> New Task
            </button>
          </div>
        </div>
        <div className="content-header">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <span className="divider">/</span>
            <span className="active">Dashboard</span>
          </div>
          
          {/* UI/UX Team Dashboard */}
          <div className="dashboard-cards">
            <div className="card">
              <div className="card-icon blue">
                <FaProjectDiagram />
              </div>
              <div className="card-content">
                <h3>Active Projects</h3>
                <div className="card-value">{uiuxProjects.length}</div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-icon green">
                <FaTasks />
              </div>
              <div className="card-content">
                <h3>My Tasks</h3>
                <div className="card-value">{mockTasks.filter(t => t.assignedTo === 'Me').length}</div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-icon orange">
                <FaClock />
              </div>
              <div className="card-content">
                <h3>Due Soon</h3>
                <div className="card-value">
                  {mockTasks.filter(t => new Date(t.dueDate) - new Date() < 7 * 24 * 60 * 60 * 1000).length}
                </div>
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search projects, tasks..." />
            </div>
            
            <div className="quick-access">
              <button className="btn btn-icon" title="Quick Add">
                <FaPlus />
              </button>
              <button className="btn btn-icon" title="Notifications">
                <FaBell />
                <span className="badge">3</span>
              </button>
              <div className="user-menu">
                <img 
                  src={currentUser?.avatar || 'https://via.placeholder.com/32'} 
                  alt="User" 
                  className="user-avatar"
                />
                <span className="user-name">{currentUser?.name?.split(' ')[0] || 'User'}</span>
                <FaChevronDown className="dropdown-icon" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="content-wrapper">
          <Outlet />
          
          {/* Task Management Dashboard */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2><FaTasks /> Task Management</h2>
              <Link to="/tasks" className="view-all">View All</Link>
            </div>
            
            <div className="tasks-list">
              <div className="tasks-header">
                <div className="header-cell" onClick={() => requestSort('title')}>
                  Task Name {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </div>
                <div className="header-cell" onClick={() => requestSort('status')}>
                  Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </div>
                <div className="header-cell" onClick={() => requestSort('priority')}>
                  Priority {sortConfig.key === 'priority' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </div>
                <div className="header-cell" onClick={() => requestSort('dueDate')}>
                  Due Date {sortConfig.key === 'dueDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </div>
                <div className="header-cell">Time Spent</div>
                <div className="header-cell">Progress</div>
                <div className="header-cell">Actions</div>
              </div>
              
              {filteredTasks.length === 0 ? (
                <div className="no-tasks">
                  <FaRegClipboard size={48} />
                  <p>No tasks match your filters</p>
                  <Button 
                    variant="outlined" 
                    onClick={() => setFilters({
                      status: 'all',
                      priority: 'all',
                      dueDate: 'all',
                      assignedTo: 'all'
                    })}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                filteredTasks.map(task => (
                  <div key={task.id} className="task-card" onClick={() => setActiveTask(task)}>
                    <div className="task-header">
                      <h3>{task.title}</h3>
                      <span className={`task-priority ${task.priority}`}>{task.priority}</span>
                    </div>
                    <div className="task-meta">
                      <span className="task-status">{task.status}</span>
                      <span className="task-due">Due: {task.dueDate}</span>
                    </div>
                    <div className="task-assignee">
                      <span className="assignee">Assigned to: {task.assignedTo}</span>
                      <button 
                        className={`status-toggle ${task.status.toLowerCase().replace(' ', '-')}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskStatus(task.id, task.status);
                        }}
                      >
                        {task.status === 'Completed' ? <FaCheck /> : <FaArrowRight />}
                      </button>
                    </div>
                    <div className="task-time-spent">
                      <FaRegClock className="icon" />
                      {task.timeSpent}
                      {isTracking && activeTimer?.taskId === task.id && (
                        <span className="tracking-indicator">
                          <span className="pulse"></span> Tracking
                        </span>
                      )}
                    </div>
                    <div className="task-progress">
                      <LinearProgress 
                        variant="determinate" 
                        value={task.progress} 
                        className={`progress-${task.priority}`}
                      />
                      <span className="progress-text">{task.progress}%</span>
                    </div>
                    <div className="task-actions">
                      {!isTracking || activeTimer?.taskId !== task.id ? (
                        <IconButton 
                          size="small" 
                          title="Start time tracking"
                          onClick={() => startTimer(task.id)}
                          className="action-icon"
                        >
                          <FaRegClock />
                        </IconButton>
                      ) : (
                        <IconButton 
                          size="small" 
                          color="secondary"
                          title="Stop time tracking"
                          onClick={stopTimer}
                          className="action-icon"
                        >
                          <FaRegStopCircle />
                        </IconButton>
                      )}
                      <IconButton 
                        size="small" 
                        title="Add comment"
                        onClick={() => {
                          setActiveTask(task);
                          // Open comment dialog
                        }}
                        className="action-icon"
                      >
                        <FaRegComment />
                        {task.comments && task.comments.length > 0 && (
                          <span className="badge">{task.comments.length}</span>
                        )}
                      </IconButton>
                      <IconButton 
                        size="small" 
                        title="View details"
                        onClick={() => {
                          setActiveTask(task);
                          // Open task details dialog
                        }}
                        className="action-icon"
                      >
                        <FaRegEye />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        title="View history"
                        onClick={() => {
                          // Open version history dialog
                        }}
                        className="action-icon"
                      >
                        <FaHistory />
                      </IconButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Deliverables Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2><FaClipboardCheck /> Deliverables</h2>
              <div className="section-actions">
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => setShowFileUpload(!showFileUpload)}
                >
                  <FaUpload /> Upload Files
                </button>
                <Link to="/deliverables" className="view-all">View All</Link>
              </div>
            </div>
            
            {showFileUpload && (
              <div className="file-upload-container">
                <div className="file-upload-box">
                  <FaCloudUploadAlt className="upload-icon" />
                  <p>Drag & drop files here or <span>browse</span></p>
                  <input 
                    type="file" 
                    id="file-upload" 
                    multiple 
                    onChange={handleFileUpload}
                    style={{ display: 'none' }} 
                  />
                  <label htmlFor="file-upload" className="btn btn-outline">
                    Select Files
                  </label>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="uploaded-files">
                    <h4>Files to Upload ({uploadedFiles.length})</h4>
                    <div className="file-list">
                      {uploadedFiles.map((file, index) => (
                        <div key={file.id} className="file-item">
                          {getFileIcon(file.name)}
                          <div className="file-info">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{formatFileSize(file.size)}</span>
                          </div>
                          <div className="file-actions">
                            {file.status === 'uploading' ? (
                              <div className="spinner"></div>
                            ) : (
                              <>
                                <button className="icon-btn" title="Preview">
                                  <FaEye />
                                </button>
                                <button 
                                  className="icon-btn" 
                                  title="Remove"
                                  onClick={() => {
                                    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                                  }}
                                >
                                  <FaTimes />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="upload-actions">
                      <button 
                        className="btn btn-outline"
                        onClick={() => setShowFileUpload(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn btn-primary"
                        disabled={uploadedFiles.some(f => f.status === 'uploading')}
                      >
                        Upload All
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="deliverables-grid">
              {mockDeliverables.map(deliverable => (
                <div 
                  key={deliverable.id} 
                  className="deliverable-card"
                  onClick={() => setActiveDeliverable(deliverable)}
                >
                  <div className="deliverable-icon">
                    {deliverable.type === 'wireframe' && <FaPencilRuler />}
                    {deliverable.type === 'mockup' && <FaImage />}
                    {deliverable.type === 'prototype' && <FaMobileAlt />}
                  </div>
                  <div className="deliverable-info">
                    <h3>{deliverable.name}</h3>
                    <div className="deliverable-meta">
                      <span className={`status ${deliverable.status.toLowerCase().replace(' ', '-')}`}>
                        {deliverable.status}
                      </span>
                      <span className="files">{deliverable.files} files</span>
                    </div>
                    <div className="deliverable-date">
                      Last updated: {deliverable.lastUpdated}
                    </div>
                  </div>
                  <div className="deliverable-actions">
                    <button className="icon-btn" title="Download">
                      <FaDownload />
                    </button>
                    <button className="icon-btn" title="Share">
                      <FaShareAlt />
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="deliverable-card add-deliverable" onClick={() => {}}>
                <FaPlus className="add-icon" />
                <span>New Deliverable</span>
              </div>
            </div>
          </div>
          
          {/* Collaboration Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2><FaComments /> Recent Activity</h2>
              <Link to="/activity" className="view-all">View All</Link>
            </div>
            
            <div className="activity-feed">
              {comments.map(comment => (
                <div key={comment.id} className="activity-item">
                  <div className="activity-avatar">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user)}&background=random`} 
                      alt={comment.user}
                    />
                  </div>
                  <div className="activity-content">
                    <div className="activity-header">
                      <span className="activity-user">{comment.user}</span>
                      <span className="activity-time">{comment.timestamp}</span>
                    </div>
                    <p className="activity-text">{comment.text}</p>
                    <div className="activity-actions">
                      <button className="btn btn-link">Reply</button>
                      <button className="btn btn-link">View</button>
                    </div>
                  </div>
                </div>
              ))}
              
              <form onSubmit={handleCommentSubmit} className="comment-form">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary" disabled={!comment.trim()}>
                    Post
                  </button>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-icon">
                    <FaPaperclip />
                  </button>
                  <button type="button" className="btn btn-icon">
                    <FaImage />
                  </button>
                  <button type="button" className="btn btn-icon">
                    <FaAt />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UILayout;