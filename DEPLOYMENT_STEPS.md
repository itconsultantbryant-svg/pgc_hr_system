# 🚀 Deployment Steps - Next Actions

## ✅ Completed Steps

1. ✅ Code pushed to GitHub
2. ✅ Database locally configured
3. ✅ Admin user created
4. ✅ All features implemented
5. ✅ UI improvements completed
6. ✅ Build configuration ready

## 📋 Next Steps for Render Deployment

### Step 1: Create Render Account (if not done)
- Go to: https://dashboard.render.com
- Sign up or log in with GitHub (recommended)

### Step 2: Create PostgreSQL Database on Render

1. **Go to Render Dashboard**
   - Click "New +" button (top right)
   - Select "PostgreSQL"

2. **Configure Database**
   - **Name**: `pgc-jobs-platform-db`
   - **Database**: `pgc_jobs_platform`
   - **Region**: Choose closest to you
   - **PostgreSQL Version**: Latest (16)
   - **Plan**: 
     - Free tier (for testing - 90 days)
     - Starter ($7/month for production)

3. **Create Database**
   - Click "Create Database"
   - Wait 2-3 minutes for provisioning

4. **Get Connection Strings**
   - Once ready, go to database dashboard
   - Find "Connections" section
   - Copy the **Internal Database URL** (for Render services)
   - Note the **External Database URL** (for local connection if needed)

### Step 3: Create Web Service on Render

1. **Go to Render Dashboard**
   - Click "New +" → "Web Service"

2. **Connect GitHub**
   - Click "Connect account" if not connected
   - Authorize Render to access GitHub
   - Select repository: `itconsultantbryant/prinstine_job_platform`
   - Click "Connect"

3. **Configure Service**
   - **Name**: `pgc-jobs-platform`
   - **Region**: Same as database (recommended)
   - **Branch**: `main`
   - **Root Directory**: (leave empty)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (testing) or Starter ($7/month)

4. **Add Environment Variables**
   Before clicking "Create Web Service", scroll to "Environment Variables" and add:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `[Internal Database URL from Step 2]` |
   | `NEXTAUTH_SECRET` | `[Generate: openssl rand -base64 32]` |
   | `NEXTAUTH_URL` | `https://your-app-name.onrender.com` |

   **Important:**
   - Use **Internal Database URL** from your Render PostgreSQL
   - Generate a NEW `NEXTAUTH_SECRET` (don't use the local one)
   - `NEXTAUTH_URL` will be your Render app URL (update after first deploy)

5. **Create Web Service**
   - Click "Create Web Service"
   - Render will automatically start building and deploying

### Step 4: First Deployment

1. **Monitor Build**
   - Watch build logs in Render dashboard
   - First build takes 3-5 minutes
   - Wait for "Your service is live" message

2. **Note Your App URL**
   - Format: `https://pgc-jobs-platform.onrender.com` (or your custom name)

### Step 5: Set Up Database Schema

After first successful deployment:

1. **Open Render Shell**
   - Go to your web service dashboard
   - Click "Shell" tab (top right)

2. **Run Database Commands**
   ```bash
   npx prisma db push
   npm run create-admin
   ```

   Or alternatively, use local terminal with External Database URL:
   ```bash
   # Update .env temporarily with External Database URL
   npx prisma db push
   npm run create-admin
   ```

### Step 6: Update NEXTAUTH_URL

1. **Go to Environment Variables**
   - Web service dashboard → Environment tab
   - Edit `NEXTAUTH_URL`
   - Set to your actual Render URL: `https://your-app-name.onrender.com`
   - Save changes
   - Render will auto-redeploy

### Step 7: Verify Deployment

1. **Visit Your App**
   - Go to your Render app URL
   - Test homepage loads

2. **Test Features**
   - ✅ Homepage displays
   - ✅ User registration works
   - ✅ Login works (use admin credentials)
   - ✅ Dashboard accessible
   - ✅ Job listings work
   - ✅ All features functional

3. **Admin Login**
   - Email: `admin@prinstinegroup.com`
   - Password: `admin123`

## 🔧 Quick Reference

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### Render Shell Commands (after deployment)
```bash
npx prisma db push
npm run create-admin
```

### View Logs
- Render Dashboard → Your Service → Logs tab

### Update Environment Variables
- Render Dashboard → Your Service → Environment tab → Edit

## ⚠️ Important Notes

1. **Free Tier Limitations**:
   - Web service spins down after 15 min inactivity
   - Takes ~30 seconds to wake up
   - 750 hours/month free
   - Database free for 90 days, then $7/month

2. **Database URLs**:
   - **Internal URL**: Use for services on Render (web service)
   - **External URL**: Use for local development/connection

3. **Security**:
   - Never commit `.env` file
   - Use strong secrets in production
   - Change admin password after first login

## 📚 Documentation

- **Detailed Guide**: See `RENDER_DEPLOYMENT.md`
- **Quick Reference**: See `README_DEPLOYMENT.md`
- **Checklist**: See `DEPLOYMENT_CHECKLIST.md`

---

**Ready to deploy?** Start with Step 1 above! 🚀
