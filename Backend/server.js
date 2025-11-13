const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database.sql');

const app = express();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const approvalRoutes = require('./routes/approval.routes');
const deliverableRoutes = require('./routes/deliverable.routes');
const messageRoutes = require('./routes/message.routes');
const notificationRoutes = require('./routes/notification.routes');
const activityRoutes = require('./routes/activity.routes');
const teamRoutes = require('./routes/team.routes');
const clientRoutes = require('./routes/client.routes');
const reportRoutes = require('./routes/report.routes');
const calendarRoutes = require('./routes/calendar.routes');
const timeTrackingRoutes = require('./routes/timeTracking.routes');
// NEW Routes
const uploadRoutes = require('./routes/upload.routes');
const wireframeRoutes = require('./routes/wireframe.routes');
const sprintRoutes = require('./routes/sprint.routes');
const auditLogRoutes = require('./routes/auditLog.routes');
const mockupRoutes = require('./routes/mockup.routes');
const prototypeRoutes = require('./routes/prototype.routes');
const codeRoutes = require('./routes/code.routes');

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev')); // Logging

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Static files (for uploads)
app.use('/uploads', express.static('uploads'));

// SQL Database Connection
connectDB();

// Health check route
app.get('/health', async (req, res) => {
  const { sequelize } = require('./config/database.sql');
  let dbStatus = 'Disconnected';
  try {
    await sequelize.authenticate();
    dbStatus = 'Connected';
  } catch (error) {
    dbStatus = 'Disconnected';
  }
  
  res.json({ 
    status: 'OK', 
    message: 'IT Agency PMS API is running',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    dbType: process.env.DB_DIALECT || 'mysql'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/deliverables', deliverableRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/time-tracking', timeTrackingRoutes);
// NEW API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/wireframes', wireframeRoutes);
app.use('/api/mockups', mockupRoutes);
app.use('/api/prototypes', prototypeRoutes);
app.use('/api/code', codeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Socket.IO setup for real-time features
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join user to their room
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Join project room
  socket.on('join_project', (projectId) => {
    socket.join(`project_${projectId}`);
    console.log(`User joined project room: ${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    const { sequelize } = require('./config/database.sql');
    await sequelize.close();
    console.log('Database connection closed');
    process.exit(0);
  });
});

module.exports = app;
