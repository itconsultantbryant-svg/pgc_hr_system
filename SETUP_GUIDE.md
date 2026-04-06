# Complete Setup Guide - Prinstine Group Jobs Platform

## Quick Start Checklist

Follow these steps in order to get the platform running:

### 1. Prerequisites
- [ ] Node.js 18+ installed
- [ ] PostgreSQL database available (local or cloud)
- [ ] npm or yarn package manager

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/pgc_jobs_platform?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="your-random-secret-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 5. Create Admin User

```bash
# Create default admin user
npm run create-admin
```

Default credentials:
- **Email**: `admin@prinstinegroup.com`
- **Password**: `admin123`

**Custom credentials:**
```bash
ADMIN_EMAIL=your-email@example.com ADMIN_PASSWORD=your-password npm run create-admin
```

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## Database Setup Options

### Option 1: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database:
   ```sql
   CREATE DATABASE pgc_jobs_platform;
   ```
3. Update `DATABASE_URL` in `.env`

### Option 2: Cloud Database (Recommended for Production)

**Supabase (Free Tier Available):**
1. Sign up at https://supabase.com
2. Create a new project
3. Get connection string from Settings > Database
4. Update `DATABASE_URL` in `.env`

**Other Options:**
- Railway
- Neon
- AWS RDS
- DigitalOcean
- Heroku Postgres

## First Steps After Setup

1. **Login as Admin**
   - Go to: http://localhost:3000/auth/login
   - Use admin credentials
   - Access admin dashboard at: http://localhost:3000/dashboard

2. **Test User Registration**
   - Test registration for Job Seekers
   - Test registration for Companies
   - Test registration for Organizations

3. **Create Test Data**
   - Create some profiles
   - Set up subscriptions
   - Create job posts
   - Test applications

## Common Issues & Solutions

### Issue: Database Connection Error
**Solution:**
- Check `DATABASE_URL` format
- Ensure PostgreSQL is running
- Verify database exists
- Check credentials

### Issue: Prisma Client Not Generated
**Solution:**
```bash
npx prisma generate
```

### Issue: NextAuth Errors
**Solution:**
- Ensure `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your application URL
- Verify environment variables are loaded

### Issue: Module Not Found Errors
**Solution:**
```bash
npm install
```

## Production Deployment

### Recommended: Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Set up PostgreSQL database
5. Deploy

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run create-admin` - Create admin user

## Security Checklist

- [ ] Change default admin password
- [ ] Use strong `NEXTAUTH_SECRET`
- [ ] Secure database credentials
- [ ] Enable HTTPS in production
- [ ] Set up proper CORS settings
- [ ] Configure file upload limits
- [ ] Set up database backups
- [ ] Enable rate limiting (recommended)
- [ ] Set up monitoring and logging

## Support

For issues or questions:
- Check the README.md
- Review ADMIN_SETUP.md
- Check project documentation
- Contact: info@prinstinegroup.com

## Next Steps

1. Customize branding and content
2. Set up email notifications
3. Configure payment gateway (if needed)
4. Set up analytics
5. Configure backup strategy
6. Set up monitoring
7. Plan for scaling

---

**Happy Coding! 🚀**
