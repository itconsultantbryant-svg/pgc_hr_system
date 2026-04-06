# Prinstine Group of Companies - Jobs Platform

A comprehensive platform connecting professionals, companies, and employers for employment and contract opportunities.

## Features

### For Job Seekers
- Create comprehensive profiles with experiences, education, competencies, references
- Subscribe to Direct ($10/year) or In-Direct ($5+/year) packages
- Direct contact with employers (Direct package) or through Prinstine Group (In-Direct)
- Apply to job openings
- Track applications

### For Companies
- Create company profiles
- Showcase services and capabilities
- Find contract opportunities
- Connect with organizations seeking services

### For Employers/Organizations
- Create organization profiles
- Post job openings
- Browse and contact job seekers
- Find companies for contract work
- Manage applications

### For Administrators
- Comprehensive dashboard
- User management (view, edit, delete, suspend)
- Payment approval system
- Content management
- Advertisement management
- Activity tracking
- Manual user profile creation

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Animations**: Framer Motion
- **Forms**: React Hook Form, Zod
- **UI Components**: Custom components with Lucide React icons
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Environment variables configured

### Installation

1. Clone the repository:
```bash
cd PGC_Jobs_Platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Random secret for NextAuth (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Your application URL (e.g., `http://localhost:3000`)

4. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev
```

(`migrate dev` applies migrations in `prisma/migrations`. For a blank database only, that creates all tables. Use `npx prisma db push` only if you intentionally bypass migrations.)

5. (Optional) Seed the database with an admin user:
```bash
# You can create an admin user manually through the database or API
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
PGC_Jobs_Platform/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   ├── (auth)/               # Authentication pages
│   ├── about/                # About page
│   ├── services/             # Services page
│   ├── contact/              # Contact page
│   ├── dashboard/            # Dashboard pages
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── layout/               # Layout components (Navbar, Footer)
│   ├── pages/                # Page components
│   └── ui/                   # UI components
├── lib/                      # Utility functions
├── prisma/                   # Prisma schema and client
├── public/                   # Static assets
└── types/                    # TypeScript type definitions
```

## Database Schema

The platform uses Prisma with PostgreSQL. Key models include:
- User (unified authentication)
- JobSeekerProfile, CompanyProfile, OrganizationProfile
- Experience, Education, Competency, Reference, Language
- Subscription, Payment
- JobPost, Application
- ContractOffer, Contact
- Advertisement, ActivityLog

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Create/apply migrations in development (`prisma migrate dev`)
- `npm run render:migrate` - Apply migrations in production (`prisma migrate deploy`; used on Render pre-deploy)
- `npm run db:studio` - Open Prisma Studio

### Creating an Admin User

Admin users can be created manually in the database by setting `userType` to `ADMIN` for a user account.

## Subscription Packages

### Direct Package - $10/year
- Full profile showcase
- Direct contact with employers
- Priority in search results
- Access to all job postings
- Full profile details visible

### In-Direct Package - $5+/year (minimum)
- Limited profile showcase
- Contact through Prinstine Group
- Basic profile details visible
- Access to selected job postings
- Privacy protection

## Deployment

1. Set up a PostgreSQL database (e.g., Supabase, Railway, or your own server)
2. Configure environment variables in your hosting platform
3. Run database migrations
4. Build and deploy the Next.js application

Recommended hosting platforms:
- **Render** – See [RENDER.md](./RENDER.md) and [render.yaml](./render.yaml). The Blueprint runs `prisma migrate deploy` before each deploy; create an admin once with `npm run create-admin:prod` in the web service Shell (set `NEXTAUTH_URL` to your `https://…onrender.com` URL).
- **Fly.io** – See [FLY_SETUP.md](./FLY_SETUP.md). Set `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` as Fly secrets **before** deploying, or the release command will fail.
- Vercel (recommended for Next.js)
- Railway
- AWS
- DigitalOcean

## Security Considerations

- Passwords are hashed using bcryptjs
- Authentication handled by NextAuth.js
- Environment variables for sensitive data
- Input validation on API routes
- SQL injection protection via Prisma

## Contributing

This is a private project for Prinstine Group of Companies.

## License

Proprietary - All rights reserved by Prinstine Group of Companies

## Support

For support, contact info@prinstinegroup.com
