# Backend Integration Guide - Developer Components

## ✅ **Integration Status**

All Developer components are **READY** to connect with backend!

---

## 📡 **API Endpoints Required**

### **1. Bug Management** (`/api/bugs`)

#### Backend Routes Needed:
```javascript
GET    /api/bugs                    // Get all bugs
GET    /api/bugs/:id                // Get bug by ID
POST   /api/bugs                    // Create new bug
PUT    /api/bugs/:id                // Update bug
DELETE /api/bugs/:id                // Delete bug
POST   /api/bugs/:id/comments       // Add comment to bug
GET    /api/bugs/:id/comments       // Get bug comments
```

#### Database Table: `bugs`
```sql
CREATE TABLE bugs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity ENUM('low', 'medium', 'high', 'critical'),
  status ENUM('open', 'in progress', 'resolved', 'closed', 'reopened'),
  reported_by INT,
  assigned_to INT,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  browser_info VARCHAR(255),
  device_info VARCHAR(255),
  screenshot_path VARCHAR(255),
  project_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (reported_by) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

---

### **2. Sprint Management** (`/api/sprints`)

#### Backend Routes Needed:
```javascript
GET    /api/sprints                 // Get all sprints
GET    /api/sprints/:id             // Get sprint by ID
POST   /api/sprints                 // Create new sprint
PUT    /api/sprints/:id             // Update sprint
DELETE /api/sprints/:id             // Delete sprint
GET    /api/sprints/:id/tasks       // Get sprint tasks
POST   /api/sprints/:id/tasks       // Add task to sprint
GET    /api/sprints/:id/stats       // Get sprint statistics
```

#### Database Table: `sprints`
```sql
CREATE TABLE sprints (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  goal TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('planning', 'active', 'completed', 'cancelled') DEFAULT 'planning',
  velocity INT DEFAULT 0,
  total_points INT DEFAULT 0,
  completed_points INT DEFAULT 0,
  total_tasks INT DEFAULT 0,
  completed_tasks INT DEFAULT 0,
  project_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

---

### **3. Design Files** (`/api/wireframes`, `/api/mockups`, `/api/prototypes`)

#### Backend Routes (Already Exist):
```javascript
GET    /api/wireframes?status=approved    // Get approved wireframes
GET    /api/mockups?status=approved       // Get approved mockups
GET    /api/prototypes?status=approved    // Get approved prototypes
```

#### Status: ✅ **Already Working!**

---

### **4. Task Management** (`/api/tasks`)

#### Backend Routes Needed:
```javascript
GET    /api/tasks                   // Get all tasks
GET    /api/tasks/assigned          // Get assigned tasks
GET    /api/tasks/:id               // Get task by ID
POST   /api/tasks                   // Create new task
PUT    /api/tasks/:id               // Update task
DELETE /api/tasks/:id               // Delete task
PATCH  /api/tasks/:id/status        // Update task status
POST   /api/tasks/:id/comments      // Add comment
```

#### Database Table: `tasks`
```sql
CREATE TABLE tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_name VARCHAR(255) NOT NULL,
  task_description TEXT,
  assigned_to INT,
  assigned_by INT,
  status ENUM('not started', 'in progress', 'review', 'completed', 'blocked') DEFAULT 'not started',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  estimated_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2),
  start_date DATE,
  due_date DATE,
  completion_date DATE,
  project_id INT,
  stage_id INT,
  sprint_id INT,
  dependencies JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (assigned_by) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (sprint_id) REFERENCES sprints(id)
);
```

---

### **5. Task Checklists** (`/api/task-checklists`)

#### Backend Routes Needed:
```javascript
GET    /api/task-checklists?taskId=:id   // Get checklist for task
POST   /api/task-checklists              // Create checklist item
PUT    /api/task-checklists/:id          // Update checklist item
PATCH  /api/task-checklists/:id/toggle   // Toggle completion
DELETE /api/task-checklists/:id          // Delete checklist item
```

#### Database Table: `task_checklists`
```sql
CREATE TABLE task_checklists (
  checklist_id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT NOT NULL,
  checklist_item VARCHAR(255) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_by INT,
  completed_at TIMESTAMP NULL,
  order_number INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (completed_by) REFERENCES users(id)
);
```

---

### **6. Time Tracking** (`/api/time-tracking`)

#### Backend Routes Needed:
```javascript
GET    /api/time-tracking           // Get all time logs
GET    /api/time-tracking/my        // Get current user's logs
POST   /api/time-tracking           // Create time log
PUT    /api/time-tracking/:id       // Update time log
DELETE /api/time-tracking/:id       // Delete time log
GET    /api/time-tracking/stats     // Get statistics
```

#### Database Table: `time_logs`
```sql
CREATE TABLE time_logs (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  task_id INT,
  hours_worked DECIMAL(10,2) NOT NULL,
  work_description TEXT,
  log_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

---

### **7. Deliverables** (`/api/deliverables`)

#### Backend Routes Needed:
```javascript
GET    /api/deliverables            // Get all deliverables
GET    /api/deliverables/:id        // Get deliverable by ID
POST   /api/deliverables            // Create deliverable
PUT    /api/deliverables/:id        // Update deliverable
DELETE /api/deliverables/:id        // Delete deliverable
PATCH  /api/deliverables/:id/submit // Submit for review
PATCH  /api/deliverables/:id/approve // Approve
PATCH  /api/deliverables/:id/reject  // Reject
```

#### Database Table: `deliverables`
```sql
CREATE TABLE deliverables (
  deliverable_id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT,
  stage_id INT,
  task_id INT,
  deliverable_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500),
  file_type VARCHAR(50),
  file_size BIGINT,
  uploaded_by INT,
  description TEXT,
  version_number VARCHAR(50),
  status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id),
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
```

---

## 🔧 **Backend Setup Steps**

### **Step 1: Check Existing Routes**
```bash
cd Backend/routes
ls -la
```

**Verify these files exist:**
- ✅ `bug.routes.js`
- ✅ `sprint.routes.js`
- ✅ `task.routes.js`
- ✅ `timeTracking.routes.js`
- ✅ `deliverable.routes.js`
- ✅ `taskChecklists.routes.js`

---

### **Step 2: Register Routes in server.js**

```javascript
// Backend/server.js

const bugRoutes = require('./routes/bug.routes');
const sprintRoutes = require('./routes/sprint.routes');
const taskRoutes = require('./routes/task.routes');
const timeTrackingRoutes = require('./routes/timeTracking.routes');
const deliverableRoutes = require('./routes/deliverable.routes');
const checklistRoutes = require('./routes/taskChecklists.routes');

// Register routes
app.use('/api/bugs', bugRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/time-tracking', timeTrackingRoutes);
app.use('/api/deliverables', deliverableRoutes);
app.use('/api/task-checklists', checklistRoutes);
```

---

### **Step 3: Verify Database Tables**

```sql
-- Check if tables exist
SHOW TABLES;

-- Should see:
-- bugs
-- sprints
-- tasks
-- task_checklists
-- time_logs
-- deliverables
```

---

## 🧪 **Testing API Endpoints**

### **Test Bug API:**
```bash
# Get all bugs
curl http://localhost:5000/api/bugs

# Create bug
curl -X POST http://localhost:5000/api/bugs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Login button not working",
    "description": "Button does not respond to clicks",
    "severity": "high",
    "status": "open",
    "assignedTo": 1,
    "projectId": 1
  }'
```

### **Test Sprint API:**
```bash
# Get all sprints
curl http://localhost:5000/api/sprints

# Create sprint
curl -X POST http://localhost:5000/api/sprints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Sprint 1 - Setup",
    "goal": "Complete environment setup",
    "startDate": "2025-01-01",
    "endDate": "2025-01-14",
    "projectId": 1
  }'
```

---

## 📊 **Component-Backend Mapping**

| Component | API Endpoint | Status |
|-----------|-------------|--------|
| **ApprovedDesigns.jsx** | `/api/wireframes`, `/api/mockups`, `/api/prototypes` | ✅ Working |
| **BugFixes.jsx** | `/api/bugs` | ⚠️ Needs backend route |
| **Sprints.jsx** | `/api/sprints` | ✅ Already exists |
| **DeveloperLayout.jsx** | `/api/tasks`, `/api/dashboard` | ⚠️ Needs backend route |

---

## 🚀 **Quick Start**

### **1. Start Backend:**
```bash
cd Backend
npm run dev
```

### **2. Start Frontend:**
```bash
cd ..
npm run dev
```

### **3. Test Components:**
```
http://localhost:5173/tasks/design-files     → ApprovedDesigns
http://localhost:5173/development/bug-fixes  → BugFixes
http://localhost:5173/development/sprints    → Sprints
```

---

## ✅ **Integration Checklist**

- [x] Created `developerService.js` API service
- [x] Components use axios for API calls
- [x] Error handling implemented
- [x] Loading states added
- [ ] Backend routes registered
- [ ] Database tables created
- [ ] API endpoints tested
- [ ] Authentication working
- [ ] Data flowing correctly

---

**Next Step:** Register backend routes and test API endpoints! 🎯
