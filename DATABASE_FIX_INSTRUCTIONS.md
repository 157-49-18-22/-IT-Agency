# Database Setup - Final Instructions

## ✅ Current Status

Based on your MySQL output:
- ✅ Database: `it_agency_pms` (exists)
- ✅ Tables created: bugs, sprints, tasks, task_checklists, time_logs, deliverables
- ⚠️ Some columns missing in existing tables
- ⚠️ Some sample data failed due to column mismatches

---

## 🔧 Quick Fix

### Option 1: Run Quick Fix Script (RECOMMENDED)
```bash
mysql -u root -p it_agency_pms < "C:/Users/lenovo/Desktop/New Project/Backend/database/quick_fix.sql"
```

This script will:
1. Check existing columns
2. Add missing columns safely
3. Insert sample data with proper IDs
4. Verify everything

---

### Option 2: Manual Fix

```sql
USE it_agency_pms;

-- Add missing columns to sprints
ALTER TABLE sprints ADD COLUMN IF NOT EXISTS goal TEXT;
ALTER TABLE sprints ADD COLUMN IF NOT EXISTS velocity INT DEFAULT 20;
ALTER TABLE sprints ADD COLUMN IF NOT EXISTS total_points INT DEFAULT 0;
ALTER TABLE sprints ADD COLUMN IF NOT EXISTS completed_points INT DEFAULT 0;

-- Add sample data
INSERT IGNORE INTO sprints (id, name, start_date, end_date, status, project_id) VALUES
(100, 'Sprint 1 - Setup', '2025-01-01', '2025-01-14', 'active', 1);

INSERT IGNORE INTO bugs (id, title, severity, status, assigned_to, project_id) VALUES
(100, 'Test Bug', 'high', 'open', 2, 1);
```

---

## 📊 Current Data (From Your Output)

```
bugs:            4 records ✅
sprints:         1 record  ✅
tasks:           10 records ✅
task_checklists: 0 records
time_logs:       3 records ✅
deliverables:    6 records ✅
```

---

## 🎯 What You Need to Do

### Step 1: Run Quick Fix
```bash
cd "C:\Users\lenovo\Desktop\New Project\Backend\database"
mysql -u root -p it_agency_pms < quick_fix.sql
```

### Step 2: Verify
```sql
USE it_agency_pms;

-- Check sprints
SELECT * FROM sprints;

-- Check bugs
SELECT id, title, status FROM bugs;

-- Check if new columns exist
DESCRIBE sprints;
```

### Step 3: Test Backend
```bash
# Restart backend
cd Backend
npm run dev

# Test APIs
curl http://localhost:5000/api/sprints
curl http://localhost:5000/api/bugs
```

---

## 📁 Files Created

1. **`developer_tables.sql`** - Original complete schema
2. **`developer_tables_fixed.sql`** - Corrected for it_agency_pms
3. **`quick_fix.sql`** - Safe quick fix script ⭐ USE THIS

---

## ⚠️ Known Issues from Your Output

### Issue 1: Database Name
- ❌ Used: `project_management`
- ✅ Correct: `it_agency_pms`
- **Fixed in new files**

### Issue 2: Missing Columns
- ❌ `sprints.goal` doesn't exist
- ❌ `sprints.project_id` doesn't exist (for index)
- ❌ `tasks.task_name` doesn't exist
- **Fixed in quick_fix.sql**

### Issue 3: Status Value Mismatch
- ❌ Bug status 'in progress' has space
- ✅ Should be 'in progress' or 'in_progress'
- **Check your ENUM definition**

---

## 🚀 Recommended Action

**Run this ONE command:**
```bash
mysql -u root -p it_agency_pms < "C:/Users/lenovo/Desktop/New Project/Backend/database/quick_fix.sql"
```

**Enter password when prompted**

**Done!** ✅

---

## 🔍 Verification

After running quick_fix.sql:

```sql
USE it_agency_pms;

-- Should show new columns
DESCRIBE sprints;

-- Should show sample data
SELECT * FROM sprints WHERE id >= 100;
SELECT * FROM bugs WHERE id >= 100;
```

---

## ✅ Success Criteria

You'll know it worked when:
- ✅ No errors in MySQL
- ✅ `sprints` table has `goal`, `velocity`, `total_points` columns
- ✅ Sample sprints with ID 100, 101 exist
- ✅ Sample bugs with ID 100, 101, 102 exist
- ✅ Backend APIs return data

---

**Next:** Run `quick_fix.sql` and test! 🎉
