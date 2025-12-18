# API Connection Test

## Issue: ERR_NAME_NOT_RESOLVED

This error means the API calls are failing. Let's debug:

### Step 1: Check Backend is Running

Open browser and go to:
```
http://localhost:5000
```

**Should show:** "IT Agency PMS Backend is Running! 🚀"

If NOT showing, backend is not running!

---

### Step 2: Test API Endpoints

```bash
# Test wireframes API
curl http://localhost:5000/api/wireframes

# Test bugs API
curl http://localhost:5000/api/bugs

# Test sprints API
curl http://localhost:5000/api/sprints
```

---

### Step 3: Check Frontend Proxy

The vite.config.js has proxy setup:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true
  }
}
```

This should work automatically.

---

### Step 4: Restart Both Servers

```bash
# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend  
cd ..
npm run dev
```

---

### Step 5: Check Browser Console

Open DevTools (F12) and check:
1. Network tab - see what URLs are being called
2. Console tab - see error messages

---

## Quick Fix

If backend is running but API calls fail, the issue is likely:

1. **Backend not on port 5000**
   - Check terminal output
   - Should say "Server running on port 5000"

2. **CORS issue**
   - Backend should have CORS enabled
   - Check server.js has `app.use(cors())`

3. **Routes not registered**
   - Check server.js has all route imports

---

## Test This

1. Open: `http://localhost:5173` (frontend)
2. Open DevTools (F12)
3. Go to Network tab
4. Reload page
5. Check what API calls are made
6. Check if they return 200 OK or errors

---

## Expected Behavior

When you open `/development/bug-fixes`:
- Should call: `http://localhost:5173/api/bugs`
- Vite proxy forwards to: `http://localhost:5000/api/bugs`
- Backend responds with bug data
- Component shows bugs

---

## If Still Not Working

Share:
1. Backend terminal output
2. Frontend terminal output  
3. Browser console errors
4. Network tab screenshot
