# Render Deployment Guide - Step by Step

> **Updated:** See **[RENDER.md](./RENDER.md)** for the consolidated checklist, Blueprint (`render.yaml`), and environment variables. The steps below are kept for reference.

## Prerequisites Checklist

- [ ] GitHub repository: `itconsultantbryant/prinstine_job_platform`
- [ ] Render account created
- [ ] Code pushed to GitHub (✅ Done!)

## Step 1: Create PostgreSQL Database on Render

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Sign in or create account

2. **Create New PostgreSQL Database**
   - Click "New +" button (top right)
   - Select "PostgreSQL"
   
3. **Configure Database**
   - **Name**: `pgc-jobs-platform-db`
   - **Database**: `pgc_jobs_platform`
   - **User**: (auto-generated or custom)
   - **Region**: Choose closest to you (e.g., `Oregon (US West)`)
   - **PostgreSQL Version**: `16` (or latest)
   - **Plan**: `Free` (for testing) or `Starter` ($7/month) for production
   
4. **Create Database**
   - Click "Create Database"
   - Wait for database to be ready (2-3 minutes)

5. **Get Connection Strings**
   - Once created, go to database dashboard
   - In "Connections" section, you'll see:
     - **Internal Database URL**: For services on Render (use this!)
     - **External Database URL**: For local development
   - Copy the **Internal Database URL** - you'll need this for Step 3

## Step 2: Create Web Service on Render

1. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Click "Connect account" if not connected to GitHub
   - Authorize Render to access your GitHub repositories

2. **Connect Repository**
   - Select repository: `itconsultantbryant/prinstine_job_platform`
   - Click "Connect"

3. **Configure Web Service**
   - **Name**: `pgc-jobs-platform` (or your preferred name)
   - **Region**: Same as database (recommended)
   - **Branch**: `main`
   - **Root Directory**: (leave empty - root is fine)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free` (for testing) or `Starter` ($7/month) for production

4. **Add Environment Variables**
   Before clicking "Create Web Service", add these environment variables:
   
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `[Internal Database URL from Step 1]` |
   | `NEXTAUTH_SECRET` | `[Generate with: openssl rand -base64 32]` |
   | `NEXTAUTH_URL` | `https://your-app-name.onrender.com` |
   
   **Important Notes:**
   - Use the **Internal Database URL** from your Render PostgreSQL
   - Generate a new `NEXTAUTH_SECRET` (don't use the local one)
   - `NEXTAUTH_URL` will be your Render app URL (you'll update this after creation)

5. **Create Web Service**
   - Click "Create Web Service"
   - Render will start building and deploying

## Step 3: Set Up Database Schema

After the first deployment succeeds:

### Option A: Using Render Shell

1. Go to your web service dashboard
2. Click "Shell" tab
3. Run these commands:
   ```bash
   npx prisma db push
   npm run create-admin:prod
   ```

### Option B: Using Local Terminal

1. Update your local `.env` with the External Database URL from Render
2. Run:
   ```bash
   npx prisma db push
   npm run create-admin:prod
   ```

### Option C: Using Prisma Migrate (Recommended for Production)

1. In Render Shell or locally:
   ```bash
   npx prisma migrate deploy
   npm run create-admin:prod
   ```

## Step 4: Update NEXTAUTH_URL

After your app is deployed:

1. Go to your web service dashboard
2. Go to "Environment" tab
3. Update `NEXTAUTH_URL` to your actual Render URL:
   - Format: `https://your-app-name.onrender.com`
4. Click "Save Changes"
5. Render will automatically redeploy

## Step 5: Verify Deployment

1. **Visit your app**: `https://your-app-name.onrender.com`
2. **Test the homepage**
3. **Test registration**
4. **Login with admin credentials**
5. **Verify all features work**

## Environment Variables Summary

### Required Variables

```env
DATABASE_URL=postgresql://user:password@hostname:5432/database_name?sslmode=require
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=https://your-app-name.onrender.com
```

### Optional Variables

```env
ADMIN_EMAIL=admin@prinstinegroup.com
ADMIN_PASSWORD=admin123
```

## Render Free Tier Limits

- **Web Service**:
  - Spins down after 15 minutes of inactivity
  - Takes ~30 seconds to wake up
  - 750 hours/month free
  
- **PostgreSQL**:
  - Free for 90 days
  - Then $7/month for Starter plan
  - 1GB storage, 100MB RAM

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify all dependencies are in `package.json`
- Ensure Node.js version is compatible (18+)

### Database Connection Errors
- Verify `DATABASE_URL` uses Internal Database URL
- Check SSL mode is set: `?sslmode=require`
- Ensure database is running (not paused)

### App Crashes on Start
- Check logs in Render dashboard
- Verify environment variables are set
- Ensure Prisma Client is generated (runs in postinstall)

### 404 Errors
- Verify routes exist
- Check Next.js routing is configured correctly
- Ensure build completed successfully

## Production Checklist

- [ ] Database schema deployed
- [ ] Admin user created
- [ ] Environment variables set correctly
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic on Render)
- [ ] Monitoring enabled
- [ ] Backups configured for database
- [ ] All features tested

## Custom Domain (Optional)

1. Go to your web service dashboard
2. Go to "Settings" → "Custom Domains"
3. Add your domain
4. Update DNS records as instructed
5. Update `NEXTAUTH_URL` to your custom domain

## Monitoring & Logs

- **View Logs**: Render dashboard → Your service → Logs
- **Metrics**: Render dashboard → Your service → Metrics
- **Health Checks**: Automatic (checks `/` endpoint)

## Security Recommendations

1. **Use strong secrets** for `NEXTAUTH_SECRET`
2. **Enable database backups** (in database settings)
3. **Set up monitoring** and alerts
4. **Use environment variables** for all secrets
5. **Regularly update dependencies**
6. **Review Render security settings**

## Support & Resources

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Render Status: https://status.render.com

---

**Your app will be live at**: `https://your-app-name.onrender.com`

**Need help?** Check the logs in Render dashboard or refer to DEPLOYMENT.md
