# Deploy on Render

This app is a **Next.js 14** service with **PostgreSQL** (Prisma). Use the **Internal Database URL** for the web service on Render.

## Quick path: Blueprint (`render.yaml`)

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**.
3. Connect the repository and select the branch (e.g. `main`).
4. Review resources (Postgres + web service) and **Deploy Blueprint**.
5. When prompted for **`NEXTAUTH_URL`** (sync: false), set it to `https://<your-web-service-name>.onrender.com` (**no trailing slash**). You can also add it later under **Environment**.
6. **Database schema:** each deploy runs **`preDeployCommand: npx prisma migrate deploy`**. If that step fails, open **Shell** and run `npm run render:migrate`, fix any errors, then trigger **Manual Deploy**.
7. **Admin user (once):** in the web service **Shell**:

   ```bash
   npm run create-admin:prod
   ```

   Optional: set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in **Environment** before running the script.

8. Visit your app URL and sign in.

The blueprint wires **`DATABASE_URL`** from the Render Postgres instance. **`NEXTAUTH_SECRET`** is auto-generated (`generateValue` in `render.yaml`); rotate it in the dashboard if needed. **`NEXTAUTH_TRUST_HOST`** is set to `true` for Render’s proxy.

## Manual path (no Blueprint)

1. **New** → **PostgreSQL** — create a database; copy **Internal Database URL**.
2. **New** → **Web Service** — connect the repo.
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm start`
   - **Plan:** Free or paid (free tier spins down after idle).
3. **Environment variables** (web service):

   | Variable | Value |
   |----------|--------|
   | `DATABASE_URL` | Internal Database URL (add `?sslmode=require` if not already present) |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | `https://<your-service>.onrender.com` |
   | `NEXTAUTH_TRUST_HOST` | `true` |
   | `NODE_ENV` | `production` |

4. Deploy. If you did not set a pre-deploy command, run **`npx prisma migrate deploy`** from **Shell** after the first successful build. Then run **`npm run create-admin:prod`** once.

## Local env template

Copy `.env.example` to `.env` and fill values. Do not commit `.env`.

## Prisma migrations

- **Production / Render:** `prisma/migrations` is versioned; **`preDeployCommand`** runs **`npx prisma migrate deploy`** on every deploy.
- **Local development:** after pulling, run **`npx prisma migrate dev`** to apply pending migrations (creates/updates your local DB).
- **Database already created with `db push` (no `_prisma_migrations` history):** if tables already match this schema, baseline once so deploys do not re-apply the init migration:

  ```bash
  npx prisma migrate resolve --applied 20260405120000_init
  ```

  Run that against the same database URL you use in production (e.g. from Render **Shell** or locally with external URL), then use **`migrate deploy`** going forward.

## Troubleshooting

- **Build fails:** Check logs; ensure Node **18+** (see `package.json` `engines` and optional `NODE_VERSION` on Render).
- **DB connection errors:** Use the **internal** URL for the web service; ensure `sslmode=require` where required.
- **Auth redirects / session issues:** `NEXTAUTH_URL` must match the public URL exactly (HTTPS, no trailing slash). `trustHost` is enabled in `lib/auth.ts` for Render’s proxy.
- **Cold starts on Free:** First request after idle may take ~30s.

## See also

- [Render Blueprints](https://render.com/docs/infrastructure-as-code)
- [Render Postgres](https://render.com/docs/databases)

Older step-by-step notes: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md), [RENDER_SETUP.md](./RENDER_SETUP.md).
