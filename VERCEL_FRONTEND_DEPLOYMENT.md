# Vercel Frontend Deployment (Backend on Render)

Use this when your API/backend is already running on Render and you only want to deploy the frontend to Vercel.

## 1) Set Vercel Environment Variables

In Vercel Project Settings -> Environment Variables, add:

- `BACKEND_URL` = your Render backend base URL (no trailing slash)
  - Example: `https://your-backend.onrender.com`
  - Never use a database URL (`postgresql://...`) here.
- `NEXTAUTH_URL` = your Vercel frontend URL
  - Example: `https://your-frontend.vercel.app`
- `NEXTAUTH_SECRET` = same secret used by auth backend
  - Keep this identical across environments handling auth tokens/cookies

Optional:

- `NEXTAUTH_TRUST_HOST` = `true`

Do **not** set `DATABASE_URL` on Vercel for frontend-only deployment.

## 2) What the frontend does now

When `BACKEND_URL` is set:

- `/api/*` is proxied to `${BACKEND_URL}/api/*`
- `/uploads/*` is proxied to `${BACKEND_URL}/uploads/*`

This keeps existing frontend fetch calls unchanged (they still call `/api/...`).

## 3) Backend readiness checklist (Render)

Your Render backend must:

- Be publicly reachable via HTTPS
- Have CORS/auth/session behavior compatible with browser requests via Vercel domain
- Serve uploaded files at `/uploads/...` (for profile images)
- Keep database connected and migrations applied

## 4) Deploy

1. Push latest code
2. Import/update project on Vercel
3. Add env vars above
4. Redeploy

## 5) Post-deploy tests

- Open homepage and verify data loads from backend
- Login/logout flow works
- Open profile pages and ensure images under `/uploads/...` load
- Create/update profile and confirm new images remain visible after refresh

## 6) Common 502 fix (DNS_HOSTNAME_NOT_FOUND)

If Vercel shows `502` with `DNS_HOSTNAME_NOT_FOUND`, your `BACKEND_URL` is usually invalid.

Checklist:

- `BACKEND_URL` starts with `https://`
- Value is your Render **web service URL** (not postgres host, not DB URL)
- No extra protocol fragments like `https://postgresql://...`
- No trailing slash needed

After correcting env vars:

1. Trigger a new Vercel redeploy
2. Open `/health`
3. Run API check
