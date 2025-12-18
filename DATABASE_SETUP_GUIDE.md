# Database Setup Guide - Developer Page

## 📋 Quick Setup Instructions

### Step 1: Open MySQL
```bash
mysql -u root -p
```

### Step 2: Select Database
```sql
USE project_management;
```

### Step 3: Run SQL File
```sql
SOURCE C:/Users/lenovo/Desktop/New Project/Backend/database/developer_tables.sql;
```

**OR** Copy-paste queries from the file manually.

---

## 📊 Tables Created

| # | Table Name | Purpose | Records |
|---|------------|---------|---------|
| 1 | `bugs` | Bug tracking | Sample: 3 |
| 2 | `sprints` | Sprint management | Sample: 2 |
| 3 | `tasks` | Task management | Sample: 3 |
| 4 | `task_checklists` | Task checklist items | Sample: 7 |
| 5 | `time_logs` | Time tracking | Sample: 3 |
| 6 | `deliverables` | Deliverable submissions | Sample: 0 |
| 7 | `bug_comments` | Bug comments | Sample: 0 |
| 8 | `task_comments` | Task comments | Sample: 0 |
| 9 | `code_repositories` | Code repos (optional) | Sample: 0 |
| 10 | `sprint_tasks` | Sprint-Task junction | Sample: 0 |

---

## ✅ Verification

### Check Tables Exist:
```sql
SHOW TABLES LIKE '%bugs%';
SHOW TABLES LIKE '%sprint%';
SHOW TABLES LIKE '%task%';
SHOW TABLES LIKE '%time%';
```

### Check Sample Data:
```sql
SELECT COUNT(*) FROM bugs;
SELECT COUNT(*) FROM sprints;
SELECT COUNT(*) FROM tasks;
SELECT COUNT(*) FROM task_checklists;
SELECT COUNT(*) FROM time_logs;
```

### View Sample Records:
```sql
-- View bugs
SELECT id, title, severity, status, assigned_to FROM bugs;

-- View sprints
SELECT id, name, status, start_date, end_date FROM sprints;

-- View tasks
SELECT id, task_name, status, assigned_to, sprint_id FROM tasks;
```

---

## 🔧 Common Issues & Fixes

### Issue 1: Foreign Key Error
**Error:** Cannot add foreign key constraint

**Fix:**
```sql
-- Check if parent tables exist
SHOW TABLES LIKE 'users';
SHOW TABLES LIKE 'projects';

-- If missing, create them first or remove FOREIGN KEY constraints
```

### Issue 2: Table Already Exists
**Error:** Table 'bugs' already exists

**Fix:**
```sql
-- Drop existing table (WARNING: This deletes all data!)
DROP TABLE IF EXISTS bugs;

-- Then run CREATE TABLE again
```

### Issue 3: Column Name Mismatch
**Error:** Unknown column 'assigned_to'

**Fix:**
```sql
-- Check actual column names
DESCRIBE bugs;

-- Update queries to match actual column names
```

---

## 🎯 Next Steps

After running SQL:

1. **Restart Backend:**
```bash
cd Backend
npm run dev
```

2. **Test API Endpoints:**
```bash
# Test bugs API
curl http://localhost:5000/api/bugs

# Test sprints API
curl http://localhost:5000/api/sprints

# Test tasks API
curl http://localhost:5000/api/tasks
```

3. **Test Frontend:**
```
http://localhost:5173/development/bug-fixes
http://localhost:5173/development/sprints
http://localhost:5173/tasks/assigned
```

---

## 📝 Sample Data Included

### Bugs:
- Login button not responding (High, Open)
- Dashboard loading slow (Medium, In Progress)
- API timeout error (Critical, Open)

### Sprints:
- Sprint 1 - Setup & Frontend (Active)
- Sprint 2 - Backend & Integration (Planning)

### Tasks:
- Setup development environment (Completed)
- Create login component (In Progress)
- Implement authentication API (Not Started)

### Time Logs:
- 4.5 hours on environment setup
- 3.0 hours on login component
- 2.5 hours on form validation

---

## 🚀 Ready to Use!

After running the SQL file, all Developer page features will work:
- ✅ Bug tracking
- ✅ Sprint management
- ✅ Task management
- ✅ Time tracking
- ✅ Deliverables
- ✅ Checklists

**File Location:**
`Backend/database/developer_tables.sql`

**Just run it in MySQL and you're done!** 🎉
