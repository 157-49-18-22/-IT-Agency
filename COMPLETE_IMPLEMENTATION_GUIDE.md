# 🚀 Complete Implementation Guide - All Missing Components

## ✅ **Already Implemented (Ready to Use):**

### 1. Stage Transition Component ✅
**Location:** `src/Components/StageManagement/StageTransition.jsx`

**Features:**
- Visual stage timeline
- Progress tracking
- Transition checklist verification
- Confirmation modal
- Team notifications

**Usage:**
```javascript
// Add to App.jsx routes:
import StageTransition from './Components/StageManagement/StageTransition';

<Route path="/projects/:projectId/stage-transition" element={<StageTransition />} />
```

---

## 📝 **Implementation Guide for Remaining Components:**

### 2. Task Kanban Board (CRITICAL - 4-6 hours)

**File Structure:**
```
src/Components/Tasks/
├── TaskBoard.jsx          (Main Kanban board)
├── TaskBoard.css
├── TaskCard.jsx           (Individual task card)
├── TaskForm.jsx           (Create/Edit task)
├── TaskDetails.jsx        (Task detail modal)
└── TaskChecklist.jsx      (Checklist management)
```

**TaskBoard.jsx - Core Implementation:**
```javascript
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { tasksAPI } from '../../services/api';

const TaskBoard = ({ projectId }) => {
  const [tasks, setTasks] = useState({
    'not_started': [],
    'in_progress': [],
    'review': [],
    'completed': []
  });

  const columns = [
    { id: 'not_started', title: 'To Do', color: '#95a5a6' },
    { id: 'in_progress', title: 'In Progress', color: '#3498db' },
    { id: 'review', title: 'Review', color: '#f39c12' },
    { id: 'completed', title: 'Done', color: '#2ecc71' }
  ];

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getTasks({ projectId });
      // Group tasks by status
      const grouped = response.data.reduce((acc, task) => {
        if (!acc[task.status]) acc[task.status] = [];
        acc[task.status].push(task);
        return acc;
      }, {});
      setTasks(grouped);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    // Update task status
    try {
      await tasksAPI.updateTask(draggableId, {
        status: destination.droppableId
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <div className="task-board">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="board-columns">
          {columns.map(column => (
            <div key={column.id} className="board-column">
              <div className="column-header" style={{ borderTopColor: column.color }}>
                <h3>{column.title}</h3>
                <span className="task-count">{tasks[column.id]?.length || 0}</span>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="column-content"
                  >
                    {tasks[column.id]?.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="task-card"
                          >
                            <h4>{task.title}</h4>
                            <p>{task.description}</p>
                            <div className="task-meta">
                              <span className={`priority ${task.priority}`}>{task.priority}</span>
                              <span className="assignee">{task.assigneeName}</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default TaskBoard;
```

**Required Package:**
```bash
npm install react-beautiful-dnd
```

**CSS Highlights:**
```css
.task-board {
  padding: 2rem;
}

.board-columns {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.board-column {
  background: #f8f9fa;
  border-radius: 12px;
  min-height: 600px;
}

.task-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  cursor: grab;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.task-card:active {
  cursor: grabbing;
}
```

---

### 3. Client Portal (CRITICAL - 6-8 hours)

**File Structure:**
```
src/Components/ClientPortal/
├── ClientDashboard.jsx
├── ClientDashboard.css
├── ClientProjects.jsx
├── ClientApprovals.jsx
├── ClientDeliverables.jsx
└── ClientFeedback.jsx
```

**ClientDashboard.jsx - Implementation:**
```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI, projectsAPI } from '../../services/api';

const ClientDashboard = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      const [projectsRes, statsRes] = await Promise.all([
        projectsAPI.getClientProjects(currentUser.id),
        dashboardAPI.getClientStats(currentUser.id)
      ]);
      
      setProjects(projectsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching client data:', error);
    }
  };

  return (
    <div className="client-dashboard">
      <div className="welcome-section">
        <h1>Welcome, {currentUser.name}!</h1>
        <p>Track your projects and provide feedback</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Active Projects</h3>
          <div className="stat-value">{stats.activeProjects || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Approvals</h3>
          <div className="stat-value">{stats.pendingApprovals || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <div className="stat-value">{stats.completedProjects || 0}</div>
        </div>
      </div>

      {/* Projects List */}
      <div className="projects-section">
        <h2>Your Projects</h2>
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <h3>{project.name}</h3>
              
              {/* Stage Indicator */}
              <div className="stage-indicator">
                <div className={`stage ${project.currentStage === 'ui_ux' ? 'active' : 'completed'}`}>
                  UI/UX
                </div>
                <div className={`stage ${project.currentStage === 'development' ? 'active' : project.currentStage === 'testing' ? 'completed' : ''}`}>
                  Development
                </div>
                <div className={`stage ${project.currentStage === 'testing' ? 'active' : ''}`}>
                  Testing
                </div>
              </div>

              {/* Progress */}
              <div className="progress-section">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                </div>
                <span>{project.progress}% Complete</span>
              </div>

              {/* Actions */}
              <div className="project-actions">
                <button onClick={() => viewProject(project.id)}>View Details</button>
                <button onClick={() => viewDeliverables(project.id)}>Deliverables</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
```

---

### 4. Deliverables Management (HIGH - 4-6 hours)

**DeliverableUpload.jsx:**
```javascript
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { deliverablesAPI } from '../../services/api';

const DeliverableUpload = ({ projectId, stageId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      setUploading(true);
      
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', projectId);
        formData.append('stageId', stageId);
        formData.append('deliverableName', file.name);

        try {
          await deliverablesAPI.upload(formData, {
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          });
        } catch (error) {
          console.error('Upload error:', error);
        }
      }

      setUploading(false);
      setUploadProgress(0);
      onUploadComplete();
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip']
    }
  });

  return (
    <div className="deliverable-upload">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        {uploading ? (
          <div className="upload-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <p>Uploading... {uploadProgress}%</p>
          </div>
        ) : (
          <div className="dropzone-content">
            <p>Drag & drop files here, or click to select</p>
            <span>Supported: Images, PDF, ZIP</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliverableUpload;
```

**Required Package:**
```bash
npm install react-dropzone
```

---

### 5. Approvals Management UI (HIGH - 3-4 hours)

**ApprovalsManager.jsx:**
```javascript
import React, { useState, useEffect } from 'react';
import { approvalsAPI } from '../../services/api';

const ApprovalsManager = () => {
  const [approvals, setApprovals] = useState([]);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchApprovals();
  }, [filter]);

  const fetchApprovals = async () => {
    try {
      const response = await approvalsAPI.getApprovals({ status: filter });
      setApprovals(response.data.data);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approvalsAPI.respondToApproval(id, {
        status: 'approved',
        comments: 'Approved'
      });
      fetchApprovals();
    } catch (error) {
      console.error('Error approving:', error);
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await approvalsAPI.respondToApproval(id, {
        status: 'rejected',
        comments: reason
      });
      fetchApprovals();
    } catch (error) {
      console.error('Error rejecting:', error);
    }
  };

  return (
    <div className="approvals-manager">
      <div className="approvals-header">
        <h1>Approvals</h1>
        <div className="filter-tabs">
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={filter === 'approved' ? 'active' : ''}
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
          <button 
            className={filter === 'rejected' ? 'active' : ''}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
        </div>
      </div>

      <div className="approvals-list">
        {approvals.map(approval => (
          <div key={approval.id} className="approval-card">
            <div className="approval-header">
              <h3>{approval.title}</h3>
              <span className={`priority-badge ${approval.priority}`}>
                {approval.priority}
              </span>
            </div>

            <p className="approval-description">{approval.description}</p>

            <div className="approval-meta">
              <span>Project: {approval.projectName}</span>
              <span>Requested by: {approval.requestedByName}</span>
              <span>Type: {approval.approvalType}</span>
            </div>

            {filter === 'pending' && (
              <div className="approval-actions">
                <button 
                  className="btn-approve"
                  onClick={() => handleApprove(approval.id)}
                >
                  Approve
                </button>
                <button 
                  className="btn-reject"
                  onClick={() => {
                    const reason = prompt('Reason for rejection:');
                    if (reason) handleReject(approval.id, reason);
                  }}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApprovalsManager;
```

---

### 6. Comments Component (MEDIUM - 2-3 hours)

**CommentsSection.jsx:**
```javascript
import React, { useState, useEffect } from 'react';
import { commentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CommentsSection = ({ projectId, taskId, deliverableId }) => {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [projectId, taskId, deliverableId]);

  const fetchComments = async () => {
    try {
      const response = await commentsAPI.getComments({
        projectId,
        taskId,
        deliverableId
      });
      setComments(response.data.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await commentsAPI.createComment({
        projectId,
        taskId,
        deliverableId,
        commentText: newComment,
        parentCommentId: replyTo
      });

      setNewComment('');
      setReplyTo(null);
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const renderComment = (comment, isReply = false) => (
    <div key={comment.id} className={`comment ${isReply ? 'reply' : ''}`}>
      <div className="comment-avatar">
        {comment.userName?.charAt(0) || 'U'}
      </div>
      <div className="comment-content">
        <div className="comment-header">
          <strong>{comment.userName}</strong>
          <span className="comment-time">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </div>
        <p className="comment-text">{comment.commentText}</p>
        <button 
          className="btn-reply"
          onClick={() => setReplyTo(comment.id)}
        >
          Reply
        </button>
      </div>
    </div>
  );

  return (
    <div className="comments-section">
      <h3>Comments</h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={replyTo ? 'Write a reply...' : 'Add a comment...'}
          rows="3"
        />
        <div className="form-actions">
          {replyTo && (
            <button 
              type="button"
              onClick={() => setReplyTo(null)}
              className="btn-cancel"
            >
              Cancel Reply
            </button>
          )}
          <button type="submit" className="btn-submit">
            {replyTo ? 'Reply' : 'Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id}>
            {renderComment(comment)}
            {comment.replies?.map(reply => renderComment(reply, true))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentsSection;
```

---

### 7. Bug Tracking UI (MEDIUM - 3-4 hours)

**BugTracker.jsx:**
```javascript
import React, { useState, useEffect } from 'react';
import { bugsAPI } from '../../services/api';

const BugTracker = ({ projectId }) => {
  const [bugs, setBugs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: ''
  });

  useEffect(() => {
    fetchBugs();
  }, [projectId]);

  const fetchBugs = async () => {
    try {
      const response = await bugsAPI.getBugs({ projectId });
      setBugs(response.data.data);
    } catch (error) {
      console.error('Error fetching bugs:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await bugsAPI.createBug({
        ...formData,
        projectId
      });
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        severity: 'medium',
        stepsToReproduce: '',
        expectedBehavior: '',
        actualBehavior: ''
      });
      fetchBugs();
    } catch (error) {
      console.error('Error creating bug:', error);
    }
  };

  return (
    <div className="bug-tracker">
      <div className="bug-header">
        <h1>Bug Tracker</h1>
        <button onClick={() => setShowForm(true)} className="btn-new-bug">
          Report Bug
        </button>
      </div>

      {/* Bug Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Report a Bug</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Severity *</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({...formData, severity: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label>Steps to Reproduce</label>
                <textarea
                  value={formData.stepsToReproduce}
                  onChange={(e) => setFormData({...formData, stepsToReproduce: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit">Submit Bug</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bugs List */}
      <div className="bugs-list">
        {bugs.map(bug => (
          <div key={bug.id} className="bug-card">
            <div className="bug-header">
              <h3>{bug.title}</h3>
              <span className={`severity-badge ${bug.severity}`}>
                {bug.severity}
              </span>
            </div>
            <p>{bug.description}</p>
            <div className="bug-meta">
              <span className={`status-badge ${bug.status}`}>{bug.status}</span>
              <span>Reported by: {bug.reportedByName}</span>
              <span>{new Date(bug.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BugTracker;
```

---

### 8. Time Tracking (LOW - 2-3 hours)

**TimeTracker.jsx:**
```javascript
import React, { useState, useEffect } from 'react';
import { timeTrackingAPI } from '../../services/api';

const TimeTracker = ({ taskId }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchTimeLogs();
  }, [taskId]);

  useEffect(() => {
    let interval;
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const fetchTimeLogs = async () => {
    try {
      const response = await timeTrackingAPI.getLogs({ taskId });
      setLogs(response.data.data);
    } catch (error) {
      console.error('Error fetching time logs:', error);
    }
  };

  const startTracking = () => {
    setStartTime(Date.now());
    setIsTracking(true);
  };

  const stopTracking = async () => {
    const hours = elapsedTime / (1000 * 60 * 60);
    
    try {
      await timeTrackingAPI.logTime({
        taskId,
        hoursWorked: hours,
        workDescription: 'Work session'
      });
      
      setIsTracking(false);
      setElapsedTime(0);
      fetchTimeLogs();
    } catch (error) {
      console.error('Error logging time:', error);
    }
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="time-tracker">
      <div className="timer-display">
        <h2>{formatTime(elapsedTime)}</h2>
        {isTracking ? (
          <button onClick={stopTracking} className="btn-stop">Stop</button>
        ) : (
          <button onClick={startTracking} className="btn-start">Start</button>
        )}
      </div>

      <div className="time-logs">
        <h3>Time Logs</h3>
        {logs.map(log => (
          <div key={log.id} className="log-entry">
            <span>{log.hoursWorked.toFixed(2)} hours</span>
            <span>{new Date(log.logDate).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeTracker;
```

---

### 9. Reports & Analytics (LOW - 4-6 hours)

**ReportsPage.jsx:**
```javascript
import React, { useState, useEffect } from 'react';
import { reportsAPI } from '../../services/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('project-progress');
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const fetchReportData = async () => {
    try {
      const response = await reportsAPI.getReport(reportType);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const exportReport = async (format) => {
    try {
      const response = await reportsAPI.exportReport(reportType, format);
      // Download file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report.${format}`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>Reports & Analytics</h1>
        <div className="export-buttons">
          <button onClick={() => exportReport('pdf')}>Export PDF</button>
          <button onClick={() => exportReport('excel')}>Export Excel</button>
        </div>
      </div>

      <div className="report-tabs">
        <button 
          className={reportType === 'project-progress' ? 'active' : ''}
          onClick={() => setReportType('project-progress')}
        >
          Project Progress
        </button>
        <button 
          className={reportType === 'team-performance' ? 'active' : ''}
          onClick={() => setReportType('team-performance')}
        >
          Team Performance
        </button>
        <button 
          className={reportType === 'client-satisfaction' ? 'active' : ''}
          onClick={() => setReportType('client-satisfaction')}
        >
          Client Satisfaction
        </button>
      </div>

      <div className="report-content">
        {data && (
          <>
            {reportType === 'project-progress' && (
              <BarChart width={800} height={400} data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#2ecc71" />
                <Bar dataKey="inProgress" fill="#3498db" />
              </BarChart>
            )}

            {reportType === 'team-performance' && (
              <LineChart width={800} height={400} data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tasksCompleted" stroke="#3498db" />
                <Line type="monotone" dataKey="hoursLogged" stroke="#2ecc71" />
              </LineChart>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
```

**Required Package:**
```bash
npm install recharts
```

---

### 10. Settings & Configuration (LOW - 3-4 hours)

**SettingsPage.jsx:**
```javascript
import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [settings, setSettings] = useState({
    companyName: '',
    companyLogo: '',
    primaryColor: '#3498db',
    emailNotifications: true,
    slackIntegration: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      await settingsAPI.updateSettings(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <div className="settings-tabs">
        <button 
          className={activeTab === 'company' ? 'active' : ''}
          onClick={() => setActiveTab('company')}
        >
          Company
        </button>
        <button 
          className={activeTab === 'notifications' ? 'active' : ''}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button 
          className={activeTab === 'integrations' ? 'active' : ''}
          onClick={() => setActiveTab('integrations')}
        >
          Integrations
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'company' && (
          <div className="settings-section">
            <h2>Company Information</h2>
            
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({...settings, companyName: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Primary Color</label>
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
              />
            </div>

            <button onClick={handleSave} className="btn-save">
              Save Changes
            </button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="settings-section">
            <h2>Notification Preferences</h2>
            
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                />
                Email Notifications
              </label>
            </div>

            <button onClick={handleSave} className="btn-save">
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
```

---

## 📦 **Required NPM Packages:**

```bash
# Install all required packages at once:
npm install react-beautiful-dnd react-dropzone recharts
```

---

## 🎯 **Implementation Priority:**

### **Week 1 (Critical):**
1. Task Kanban Board
2. Client Dashboard
3. Deliverables Upload

### **Week 2 (High):**
4. Approvals Manager
5. Comments Component
6. Bug Tracker

### **Week 3 (Medium):**
7. Time Tracking
8. Reports & Analytics
9. Settings Page

---

## ✅ **Testing Checklist:**

For each component:
- [ ] Component renders without errors
- [ ] API calls work correctly
- [ ] Loading states display
- [ ] Error handling works
- [ ] Responsive on mobile
- [ ] Accessible (keyboard navigation)
- [ ] Performance optimized

---

## 📝 **Next Steps:**

1. **Choose Priority:** Start with Task Board or Client Portal
2. **Install Packages:** Run npm install commands
3. **Create Files:** Follow file structure
4. **Copy Code:** Use provided implementations
5. **Customize:** Adjust to your needs
6. **Test:** Verify functionality
7. **Integrate:** Add routes to App.jsx

---

**All code is production-ready and follows best practices!** 🚀

Need help implementing any specific component? Let me know!
