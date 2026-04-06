# 🚀 Quick Deployment to Render

## One-Minute Setup

### 1. Create PostgreSQL Database
1. Go to https://dashboard.render.com
2. Click "New +" → "PostgreSQL"
3. Name: `pgc-jobs-platform-db`
4. Click "Create"
5. Copy **Internal Database URL**

### 2. Create Web Service
1. Click "New +" → "Web Service"
2. Connect GitHub repo: `itconsultantbryant/prinstine_job_platform`
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   ```
   DATABASE_URL = [Internal Database URL from step 1]
   NEXTAUTH_SECRET = [Generate: openssl rand -base64 32]
   NEXTAUTH_URL = https://your-app.onrender.com
   ```
5. Click "Create Web Service"

### 3. Set Up Database
After first deployment, open Render Shell and run:
```bash
npx prisma db push
npm run create-admin
```

### 4. Done! 🎉
Visit your app at: `https://your-app.onrender.com`

**Admin Login:**
- Email: `admin@prinstinegroup.com`
- Password: `admin123`

---

See `RENDER_DEPLOYMENT.md` for detailed instructions.
