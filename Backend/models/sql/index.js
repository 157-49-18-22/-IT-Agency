const { sequelize } = require('../../config/database.sql');

// Import all models
const User = require('./User.model');
const Client = require('./Client.model');
const Project = require('./Project.model');
const Task = require('./Task.model');
const Approval = require('./Approval.model');
const Deliverable = require('./Deliverable.model');
const Message = require('./Message.model');
const Notification = require('./Notification.model');
const Activity = require('./Activity.model');
const TimeTracking = require('./TimeTracking.model');
const CalendarEvent = require('./CalendarEvent.model');
// NEW Models
const Sprint = require('./Sprint.model');
const AuditLog = require('./AuditLog.model');
const TaskChecklist = require('./TaskChecklist.model');
const StageTransition = require('./StageTransition.model');

// Define relationships

// User relationships
User.hasMany(Project, { foreignKey: 'projectManagerId', as: 'managedProjects' });
User.hasMany(Task, { foreignKey: 'assigneeId', as: 'assignedTasks' });
User.hasMany(Task, { foreignKey: 'reporterId', as: 'reportedTasks' });
User.hasMany(Approval, { foreignKey: 'requestedById', as: 'requestedApprovals' });
User.hasMany(Approval, { foreignKey: 'requestedToId', as: 'receivedApprovals' });
User.hasMany(Deliverable, { foreignKey: 'uploadedById', as: 'uploadedDeliverables' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Notification, { foreignKey: 'recipientId', as: 'notifications' });
User.hasMany(Activity, { foreignKey: 'userId', as: 'activities' });
User.hasMany(TimeTracking, { foreignKey: 'userId', as: 'timeEntries' });
User.hasMany(CalendarEvent, { foreignKey: 'organizerId', as: 'organizedEvents' });

// Client relationships
Client.hasMany(Project, { foreignKey: 'clientId', as: 'projects' });

// Project relationships
Project.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Project.belongsTo(User, { foreignKey: 'projectManagerId', as: 'projectManager' });
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });
Project.hasMany(Approval, { foreignKey: 'projectId', as: 'approvals' });
Project.hasMany(Deliverable, { foreignKey: 'projectId', as: 'deliverables' });
Project.hasMany(Message, { foreignKey: 'projectId', as: 'messages' });
Project.hasMany(Activity, { foreignKey: 'projectId', as: 'activities' });
Project.hasMany(TimeTracking, { foreignKey: 'projectId', as: 'timeEntries' });
Project.hasMany(CalendarEvent, { foreignKey: 'projectId', as: 'events' });

// Task relationships
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Task.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });
Task.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });
Task.hasMany(TimeTracking, { foreignKey: 'taskId', as: 'timeEntries' });

// Approval relationships
Approval.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Approval.belongsTo(User, { foreignKey: 'requestedById', as: 'requestedBy' });
Approval.belongsTo(User, { foreignKey: 'requestedToId', as: 'requestedTo' });
Approval.belongsTo(Deliverable, { foreignKey: 'relatedDeliverableId', as: 'relatedDeliverable' });

// Deliverable relationships
Deliverable.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Deliverable.belongsTo(User, { foreignKey: 'uploadedById', as: 'uploadedBy' });

// Message relationships
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Notification relationships
Notification.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });
Notification.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Notification.belongsTo(Project, { foreignKey: 'relatedProjectId', as: 'relatedProject' });
Notification.belongsTo(Task, { foreignKey: 'relatedTaskId', as: 'relatedTask' });
Notification.belongsTo(Approval, { foreignKey: 'relatedApprovalId', as: 'relatedApproval' });

// Activity relationships
Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Activity.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Activity.belongsTo(Task, { foreignKey: 'relatedTaskId', as: 'relatedTask' });
Activity.belongsTo(Approval, { foreignKey: 'relatedApprovalId', as: 'relatedApproval' });

// TimeTracking relationships
TimeTracking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
TimeTracking.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
TimeTracking.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

// CalendarEvent relationships
CalendarEvent.belongsTo(User, { foreignKey: 'organizerId', as: 'organizer' });
CalendarEvent.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// NEW Model Relationships

// Sprint relationships
Sprint.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Project.hasMany(Sprint, { foreignKey: 'projectId', as: 'sprints' });

// AuditLog relationships
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });

// TaskChecklist relationships
TaskChecklist.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });
TaskChecklist.belongsTo(User, { foreignKey: 'completedById', as: 'completedBy' });
Task.hasMany(TaskChecklist, { foreignKey: 'taskId', as: 'checklists' });

// StageTransition relationships
StageTransition.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
StageTransition.belongsTo(User, { foreignKey: 'requestedById', as: 'requestedBy' });
StageTransition.belongsTo(User, { foreignKey: 'approvedById', as: 'approvedBy' });
Project.hasMany(StageTransition, { foreignKey: 'projectId', as: 'transitions' });

module.exports = {
  sequelize,
  User,
  Client,
  Project,
  Task,
  Approval,
  Deliverable,
  Message,
  Notification,
  Activity,
  TimeTracking,
  CalendarEvent,
  Sprint,
  AuditLog,
  TaskChecklist,
  StageTransition
};
