# Tester Login Issue - Fix Guide

## 🔴 Problem
```
POST http://localhost:5000/api/auth/login 401 (Unauthorized)
Error: Request failed with status code 401
```

**Reason:** Tester user doesn't exist in database OR password is incorrect

---

## ✅ Solution

### Step 1: Run SQL Queries

Open MySQL and run:

```sql
USE it_agency_pms;

-- Check if tester exists
SELECT * FROM users WHERE email = 'tester@gmail.com';
```

**If no results:** Tester doesn't exist!

---

### Step 2: Create Tester User

```sql
INSERT INTO users (name, email, password, role, status, department, designation, joinDate)
VALUES 
('Test User', 'tester@gmail.com', '123123', 'tester', 'active', 'Quality Assurance', 'QA Tester', CURDATE());
```

---

### Step 3: Verify

```sql
SELECT id, name, email, role, password, status 
FROM users 
WHERE email = 'tester@gmail.com';
```

**Expected Output:**
```
id | name      | email              | role   | password | status
30 | Test User | tester@gmail.com   | tester | 123123   | active
```

---

## 🚀 Quick Fix (Copy-Paste)

```sql
USE it_agency_pms;

-- Delete old tester if exists
DELETE FROM users WHERE email = 'tester@gmail.com';

-- Create fresh tester
INSERT INTO users (name, email, password, role, status, department, designation, joinDate)
VALUES ('Test User', 'tester@gmail.com', '123123', 'tester', 'active', 'Quality Assurance', 'QA Tester', CURDATE());

-- Verify
SELECT * FROM users WHERE email = 'tester@gmail.com';
```

---

## 🔐 Login Credentials

After running SQL:

```
Email: tester@gmail.com
Password: 123123
Role: tester
```

---

## 🐛 Troubleshooting

### Issue 1: User exists but can't login
**Solution:** Update password
```sql
UPDATE users SET password = '123123' WHERE email = 'tester@gmail.com';
```

### Issue 2: User is inactive
**Solution:** Activate user
```sql
UPDATE users SET status = 'active' WHERE email = 'tester@gmail.com';
```

### Issue 3: Wrong role
**Solution:** Fix role
```sql
UPDATE users SET role = 'tester' WHERE email = 'tester@gmail.com';
```

---

## 📊 Check All Users

```sql
SELECT id, name, email, role, status FROM users ORDER BY role;
```

---

## ✅ Final Verification

After SQL queries:

1. **Restart Backend:**
```bash
cd Backend
npm run dev
```

2. **Try Login:**
- Open: http://localhost:5173
- Email: tester@gmail.com
- Password: 123123

3. **Should redirect to:** `/testing` (Tester Dashboard)

---

## 📝 Files Created

1. **Backend/database/tester_login_fix.sql** - All SQL queries
2. **TESTING_LOGIN_FIX.md** - This guide

---

## 🎯 Next Steps

1. Run SQL queries from `tester_login_fix.sql`
2. Verify tester user exists
3. Restart backend
4. Try login
5. Should work! ✅

---

**SQL File Location:**
```
Backend/database/tester_login_fix.sql
```

**Just copy-paste queries from there into MySQL!** 🚀
