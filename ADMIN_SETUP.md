# Admin User Setup Guide

## Creating an Admin User

To create an admin user for the Prinstine Group Jobs Platform, you have two options:

### Option 1: Using the Script (Recommended)

1. **Install tsx** (if not already installed):
   ```bash
   npm install --save-dev tsx
   ```

2. **Set up your database** (if not already done):
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Create the admin user**:
   ```bash
   npm run create-admin
   ```

   Or with custom credentials:
   ```bash
   ADMIN_EMAIL=your-email@example.com ADMIN_PASSWORD=your-password npm run create-admin
   ```

### Option 2: Using Prisma Studio

1. **Open Prisma Studio**:
   ```bash
   npm run db:studio
   ```

2. Navigate to the `User` model
3. Click "Add record"
4. Fill in:
   - `email`: Your admin email
   - `password`: Hashed password (use bcrypt to hash)
   - `userType`: `ADMIN`
   - `isActive`: `true`
   - `isSuspended`: `false`

### Default Admin Credentials

If you use the script without environment variables, the default credentials are:

- **Email**: `admin@prinstinegroup.com`
- **Password**: `admin123`

⚠️ **Important**: Change the default password immediately after first login!

## Logging In as Admin

1. Navigate to: `http://localhost:3000/auth/login`
2. Enter the admin email and password
3. You will be redirected to the admin dashboard

## Admin Features

Once logged in as admin, you can:
- Manage all users (view, edit, suspend, delete)
- Approve/reject payments
- View all subscriptions
- Manage platform content
- Access all admin features via `/dashboard/admin/*`

## Security Notes

- Always use strong passwords for admin accounts
- Change default passwords immediately
- Keep admin credentials secure
- Consider using environment variables for production
