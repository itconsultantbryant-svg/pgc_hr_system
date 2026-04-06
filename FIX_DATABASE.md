# 🔧 Fixing Database Connection Errors

## Problem
You're seeing 500 errors because the database connection is not working. The current `DATABASE_URL` in `.env` is a placeholder.

## Solutions

### Option 1: Use Local PostgreSQL (Quick Setup)

If you have PostgreSQL installed locally:

1. **Start PostgreSQL** (if not running):
   ```bash
   # macOS with Homebrew
   brew services start postgresql
   
   # Or if installed differently
   pg_ctl -D /usr/local/var/postgres start
   ```

2. **Create the database**:
   ```bash
   createdb pgc_jobs_platform
   ```

3. **Update `.env` file**:
   ```env
   DATABASE_URL="postgresql://your_username@localhost:5432/pgc_jobs_platform?schema=public"
   ```
   Replace `your_username` with your PostgreSQL username (usually your macOS username).

4. **Push schema**:
   ```bash
   npx prisma db push
   npm run create-admin
   ```

5. **Restart dev server** (Ctrl+C then `npm run dev`)

### Option 2: Use Render PostgreSQL (If Already Created)

If you already created a PostgreSQL database on Render:

1. **Get the External Database URL** from Render dashboard
2. **Update `.env` file**:
   ```env
   DATABASE_URL="postgresql://user:password@hostname:5432/database?sslmode=require"
   ```
   Use the External Database URL from Render.

3. **Push schema**:
   ```bash
   npx prisma db push
   npm run create-admin
   ```

4. **Restart dev server**

### Option 3: Install PostgreSQL Locally (macOS)

If PostgreSQL is not installed:

1. **Install with Homebrew**:
   ```bash
   brew install postgresql@16
   brew services start postgresql@16
   ```

2. **Create database**:
   ```bash
   createdb pgc_jobs_platform
   ```

3. **Update `.env`**:
   ```env
   DATABASE_URL="postgresql://$(whoami)@localhost:5432/pgc_jobs_platform?schema=public"
   ```

4. **Set up schema**:
   ```bash
   npx prisma db push
   npm run create-admin
   ```

## Quick Test

After updating `DATABASE_URL`, test the connection:

```bash
npx prisma db push
```

If successful, you'll see: "Database schema synced successfully"

## Verify Fix

1. Restart your dev server (stop with Ctrl+C, then `npm run dev`)
2. Visit http://localhost:3000
3. Errors should be gone!

---

**Most Common Issue**: The placeholder `DATABASE_URL` needs to be replaced with a real PostgreSQL connection string.
