# Deployment Guide for Render

## Prerequisites

1. GitHub repository created: `itconsultantbryant/prinstine_job_platform`
2. Render account created
3. PostgreSQL database on Render

## Step-by-Step Deployment

### 1. Push to GitHub

The code is ready to push. Use these commands:

```bash
git push -u origin main
```

**Note**: If you get authentication errors, you can use:
- GitHub CLI: `gh auth login`
- Personal Access Token: Use it when prompted for password
- SSH keys: Set up SSH authentication

### 2. Create PostgreSQL Database on Render

1. Go to https://render.com/dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `pgc-jobs-platform-db`
   - **Database**: `pgc_jobs_platform`
   - **Region**: Choose closest to you
   - **Plan**: Free tier or paid
4. Click "Create Database"
5. Note the connection strings (Internal and External)

### 3. Create Web Service on Render

1. Go to Render dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `itconsultantbryant/prinstine_job_platform`
4. Configure:
   - **Name**: `pgc-jobs-platform`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free tier or paid

### 4. Set Environment Variables

In your Render Web Service settings, add these environment variables:

```
DATABASE_URL=<Internal Database URL from your Render PostgreSQL>
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-app-name.onrender.com
```

**Important:**
- Use **Internal Database URL** for `DATABASE_URL` (for services on Render)
- Add `?sslmode=require` if not already included
- Generate a new `NEXTAUTH_SECRET` for production
- Use your actual Render app URL for `NEXTAUTH_URL`

### 5. Deploy and Set Up Database

After first deployment:

1. **Set up database schema:**
   ```bash
   # SSH into Render or use Render Shell
   npx prisma generate
   npx prisma db push
   ```

2. **Create admin user:**
   ```bash
   npm run create-admin
   ```

### 6. Verify Deployment

1. Visit your Render app URL
2. Test login with admin credentials
3. Verify all features work
4. Check database connection

## Environment Variables Reference

```env
# Required
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-app.onrender.com"

# Optional (for admin creation)
ADMIN_EMAIL="admin@prinstinegroup.com"
ADMIN_PASSWORD="admin123"
```

## Render Free Tier Notes

- **Web Service**: Spins down after 15 minutes of inactivity
- **PostgreSQL**: Free for 90 days, then $7/month
- **Auto-deploy**: On every push to main branch
- **SSL**: Included automatically

## Troubleshooting

### Build Failures
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Render auto-detects)

### Database Connection Issues
- Use Internal Database URL for services on Render
- Verify SSL mode is set correctly
- Check database is running (not paused)

### Authentication Issues
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your app URL
- Ensure environment variables are set correctly

## Post-Deployment Checklist

- [ ] Database schema pushed
- [ ] Admin user created
- [ ] All pages accessible
- [ ] Authentication working
- [ ] Forms submitting correctly
- [ ] File uploads working
- [ ] All features tested

## Support

- Render Docs: https://render.com/docs
- Render Support: https://render.com/docs/support
- Project README: See README.md

---

**Your platform will be live at**: `https://your-app-name.onrender.com`
