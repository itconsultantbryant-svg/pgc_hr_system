# Setting Up with Render PostgreSQL

> **Updated:** For full deploy (web + DB + env), use **[RENDER.md](./RENDER.md)** and [render.yaml](./render.yaml).

## Step 1: Create PostgreSQL Database on Render

1. **Sign up/Login to Render:**
   - Go to https://render.com
   - Sign up or log in

2. **Create PostgreSQL Database:**
   - Click "New +" button
   - Select "PostgreSQL"
   - Fill in the details:
     - **Name**: `pgc-jobs-platform-db` (or your preferred name)
     - **Database**: `pgc_jobs_platform`
     - **User**: (auto-generated or custom)
     - **Region**: Choose closest to you
     - **PostgreSQL Version**: Latest (recommended)
     - **Plan**: Free tier available (or paid for production)
   - Click "Create Database"

3. **Get Connection String:**
   - Once created, go to your database dashboard
   - Find "Connections" section
   - Copy the "Internal Database URL" (for Render services) or "External Database URL" (for local development)
   - The format will be:
     ```
     postgresql://user:password@hostname:5432/database_name
     ```

## Step 2: Update .env File

Update your `.env` file with the Render database connection string:

```env
# Database Connection (from Render)
DATABASE_URL="postgresql://user:password@hostname:5432/database_name?sslmode=require"

# NextAuth Configuration
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
```

**Important Notes:**
- Render databases require SSL, so add `?sslmode=require` to the connection string
- Use "External Database URL" for local development
- Use "Internal Database URL" if deploying the app on Render too

## Step 3: Set Up Database Schema

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to Render database
npx prisma db push
```

## Step 4: Create Admin User

```bash
npm run create-admin
```

## Step 5: Test Connection

```bash
# Open Prisma Studio to verify connection
npx prisma studio
```

## Deploying the App on Render (Optional)

If you also want to deploy the Next.js app on Render:

1. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `pgc-jobs-platform`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free tier available

2. **Add Environment Variables:**
   - In your Render service settings, add:
     - `DATABASE_URL`: Use the "Internal Database URL" from your Render PostgreSQL
     - `NEXTAUTH_SECRET`: Your secret key
     - `NEXTAUTH_URL`: Your Render app URL (e.g., `https://your-app.onrender.com`)

3. **Deploy:**
   - Render will automatically deploy on push to your main branch

## Render Free Tier Limits

- **PostgreSQL**: 90 days free, then $7/month
- **Web Service**: Free tier available (spins down after inactivity)
- **Bandwidth**: 100GB/month free

## Security Best Practices

1. **Never commit `.env` file** to Git
2. **Use Render's Environment Variables** for production
3. **Enable SSL** for database connections
4. **Use strong passwords** and secrets
5. **Regular backups** (Render provides automatic backups)

## Troubleshooting

### Connection Issues
- Ensure you're using the correct URL (Internal vs External)
- Check that SSL mode is set: `?sslmode=require`
- Verify database is running (not paused)

### SSL Certificate Issues
- Add `?sslmode=require` to connection string
- For local development, you might need to download Render's CA certificate

### Timeout Issues
- Free tier databases may pause after inactivity
- Wake up the database from Render dashboard if needed

## Next Steps

1. Set up your Render PostgreSQL database
2. Update `.env` with the connection string
3. Run `npx prisma db push` to create tables
4. Create admin user with `npm run create-admin`
5. Start development: `npm run dev`

---

**Need Help?**
- Render Docs: https://render.com/docs
- Render Support: https://render.com/docs/support
