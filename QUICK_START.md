# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment Variables

Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pgc_jobs_platform"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

### Step 3: Set Up Database
```bash
npx prisma generate
npx prisma db push
```

### Step 4: Create Admin User
```bash
npm run create-admin
```

**Admin Credentials:**
- Email: `admin@prinstinegroup.com`
- Password: `admin123`

### Step 5: Start Server
```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 📝 Need More Details?

- See `SETUP_GUIDE.md` for comprehensive setup instructions
- See `ADMIN_SETUP.md` for admin user management
- See `README.md` for full documentation

---

**That's it! Your platform is ready to use! 🎉**
