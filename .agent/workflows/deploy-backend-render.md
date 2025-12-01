---
description: Deploy Backend on Render
---

# Deploy Backend on Render

यह workflow आपको बताएगा कि अपने IT Agency PMS Backend को Render पर कैसे deploy करें।

## Prerequisites (जरूरी चीजें)

1. Render पर account बनाएं: https://render.com
2. GitHub repository में code push करें
3. Database (PostgreSQL) Render पर setup करें

## Step 1: Render पर Database Setup करें

1. Render Dashboard पर जाएं (https://dashboard.render.com)
2. "New +" button click करें
3. "PostgreSQL" select करें
4. Database details भरें:
   - **Name**: `it-agency-pms-db`
   - **Database**: `it_agency_pms`
   - **User**: (auto-generated)
   - **Region**: Singapore (या आपके पास वाला)
   - **Plan**: Free
5. "Create Database" पर click करें
6. Database का Internal Connection String copy करें (यह .env में use होगा)

## Step 2: Backend को GitHub पर Push करें

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## Step 3: Render पर Web Service बनाएं

1. Render Dashboard पर जाएं
2. "New +" → "Web Service" select करें
3. अपनी GitHub repository connect करें
4. Repository select करें
5. Service details भरें:
   - **Name**: `it-agency-pms-backend`
   - **Region**: Singapore (या Database के समान)
   - **Branch**: `main`
   - **Root Directory**: `Backend` (important!)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

## Step 4: Environment Variables Setup करें

"Environment" tab में जाकर ये environment variables add करें:

```env
NODE_ENV=production
PORT=5000

# Database
DB_DIALECT=postgres
DB_HOST=<your-render-db-host>
DB_PORT=5432
DB_NAME=it_agency_pms
DB_USER=<your-render-db-user>
DB_PASSWORD=<your-render-db-password>

# या सीधे DATABASE_URL use करें (recommended):
DATABASE_URL=<your-render-postgres-internal-url>

# JWT
JWT_SECRET=your-production-jwt-secret-change-this-to-random-string
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-production-refresh-secret-change-this
JWT_REFRESH_EXPIRE=30d

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Client URL (आपकी frontend URL)
CLIENT_URL=http://localhost:5173
```

## Step 5: Deploy करें

1. सभी settings save करें
2. "Create Web Service" button click करें
3. Render automatically deploy करना शुरू कर देगा
4. Logs में देखें कि deployment successful है या नहीं

## Step 6: Database Migrations Run करें

Deployment के बाद:

1. Render Dashboard → आपकी web service → "Shell" tab
2. Or command line से:
```bash
npm run migrate
npm run seed
```

## Step 7: Test करें

आपकी backend URL कुछ ऐसी होगी:
```
https://it-agency-pms-backend.onrender.com
```

Browser में test करें:
```
https://it-agency-pms-backend.onrender.com/health
```

## Step 8: Frontend में Backend URL Update करें

अपनी frontend में API URL update करें:

`.env` या config file में:
```env
VITE_API_URL=https://it-agency-pms-backend.onrender.com/api
```

## Important Notes

1. **Free Plan Limitations**:
   - Service 15 minutes inactivity के बाद sleep हो जाती है
   - Cold start में 30 seconds lag सकते हैं
   - Monthly 750 hours free

2. **Database Backups**: Free PostgreSQL में auto-backups नहीं होते

3. **File Uploads**: Render पर uploaded files ephemeral होती हैं (restart पर delete हो जाती हैं)
   - Solution: AWS S3 या Cloudinary use करें production में

4. **Logs**: Render dashboard में real-time logs देख सकते हैं

## Troubleshooting

### Build Failed
- Check करें कि `package.json` में सभी dependencies हैं
- Root Directory सही set है (`Backend`)

### Database Connection Error
- DATABASE_URL या DB_* variables सही हैं verify करें
- Database से Internal URL use करें, External नहीं

### CORS Error
- CLIENT_URL में अपनी frontend URL add करें
- `server.js` में CORS configuration check करें

## Optional: Auto-Deploy Setup

Git push करते ही auto-deploy के लिए:
1. Render Dashboard → Settings
2. "Auto-Deploy" को Enable करें
3. अब हर `git push` पर automatically deploy होगा
