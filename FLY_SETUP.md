# Fly.io setup – login and admin

**App:** `pgc-hr-system` · **URL:** https://pgc-hr-system.fly.dev

**Fly dashboard (sign in at [fly.io](https://fly.io)):**
- [App overview](https://fly.io/apps/pgc-hr-system)
- [Secrets & config](https://fly.io/apps/pgc-hr-system/configuration)
- [Releases](https://fly.io/apps/pgc-hr-system/releases)

---

## ⚠️ Before you deploy: set secrets first

The **release command** runs during every deploy (`npx prisma db push && node scripts/create-admin.cjs`). It needs **DATABASE_URL** to run. If DATABASE_URL is not set, the release fails and the deployment is aborted.

**Set these secrets before running `fly deploy` (or `flyctl deploy`):**

```bash
# 1. DATABASE_URL (required for release command and app)
#    If using Fly Postgres: fly postgres connect -a YOUR_POSTGRES_APP then get the connection string from the Fly dashboard.
#    Format: postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
fly secrets set DATABASE_URL="postgresql://user:password@hostname:5432/dbname?sslmode=require" -a pgc-hr-system

# 2. NEXTAUTH_URL (your app URL, no trailing slash)
fly secrets set NEXTAUTH_URL="https://pgc-hr-system.fly.dev" -a pgc-hr-system

# 3. NEXTAUTH_SECRET (generate: openssl rand -base64 32)
fly secrets set NEXTAUTH_SECRET="paste-your-32-char-secret" -a pgc-hr-system

# 4. Optional – for login redirects behind proxy
fly secrets set NEXTAUTH_TRUST_HOST="true" -a pgc-hr-system
```

Then deploy:

```bash
fly deploy -a pgc-hr-system --config fly.toml
# or with your image: flyctl deploy -a pgc-hr-system --image ... --config fly.toml
```

---

## 1. Required secrets (reference)

Login and auth **will not work** until these are set on your Fly app:

- **DATABASE_URL** – Postgres connection string. **Required for release_command** (prisma db push) and for the app. Without it, deploy fails.
- **NEXTAUTH_URL** – Must be **exactly** your app URL (e.g. `https://pgc-hr-system.fly.dev`). No trailing slash. Use HTTPS.
- **NEXTAUTH_SECRET** – Must be set; otherwise NextAuth will not work.
- **NEXTAUTH_TRUST_HOST** – Optional; set to `"true"` when behind a proxy to fix redirect issues.

Check existing secrets:

```bash
fly secrets list -a pgc-hr-system
```

After changing secrets, deploy or restart:

```bash
fly deploy -a pgc-hr-system
# or
fly apps restart pgc-hr-system
```

### If Fly says a secret is "invalid"

1. **No space around `=`**  
   Use `NAME=value` not `NAME = value`:
   ```bash
   fly secrets set DATABASE_URL="postgresql://..." -a pgc-hr-system
   ```

2. **Special characters in the value**  
   - On **Mac/Linux**, use **single quotes** so the shell doesn’t interpret `$`, `"`, or backticks:
     ```bash
     fly secrets set DATABASE_URL='postgresql://user:p@ss%23word@host:5432/db?sslmode=require' -a pgc-hr-system
     ```
   - If your **Postgres password** contains `@`, `#`, `$`, `%`, `&`, `=`, etc., **URL-encode** only the password (e.g. `@` → `%40`, `#` → `%23`, `$` → `%24`).

3. **Avoid the shell entirely (recommended for DATABASE_URL)**  
   Put the value in a file, then import so the shell never parses special characters:
   ```bash
   # Create a one-line file (replace with your real URL)
   echo 'DATABASE_URL=postgresql://user:password@hostname:5432/dbname?sslmode=require' > /tmp/fly-secrets.txt
   fly secrets import -a pgc-hr-system < /tmp/fly-secrets.txt
   rm /tmp/fly-secrets.txt
   ```
   For multiple secrets, put one `NAME=value` per line in the file and run the same `fly secrets import` command.

4. **In the Fly dashboard**  
   Paste the value into the secret value field; avoid leading/trailing spaces. If it still says invalid, try setting the secret from the CLI using the file method above.

---

## 2. Release command failing?

If deploy fails with:

- **`release_command failed`** / **`exited with non-zero status of 1`**
- Logs show: **`Environment variable not found: DATABASE_URL`** (Prisma P1012)

Then the release machine did not have **DATABASE_URL** set. Fix:

1. Set the secret (use your real Postgres URL):
   ```bash
   fly secrets set DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require" -a pgc-hr-system
   ```
2. Redeploy:
   ```bash
   fly deploy -a pgc-hr-system --config fly.toml
   ```

No code change is required; the release command runs in an environment that receives the app’s secrets only after they are set.

---

## 3. Default admin login

After the first successful deploy, the release command runs `node scripts/create-admin.cjs`, which creates an admin user if one does not exist. Default credentials:

| Field    | Value                      |
|----------|----------------------------|
| **Email**    | `admin@prinstinegroup.com` |
| **Password** | `admin123`                 |

Use these to sign in at: **https://pgc-hr-system.fly.dev/auth/login**

**Change the password** after first login (e.g. via a “Change password” or profile flow if you have one, or by creating a new admin and retiring this one).

### Custom admin email/password

To create the first admin with different credentials, set secrets before (or for) the deploy that runs the release command:

```bash
fly secrets set ADMIN_EMAIL="your-admin@example.com" -a pgc-hr-system
fly secrets set ADMIN_PASSWORD="YourSecurePassword123" -a pgc-hr-system
```

Then deploy. The release command runs `npm run create-admin`, which uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` when set; otherwise it uses the defaults above.

---

## 4. If users still can’t log in

1. **Check secrets**
   - `fly secrets list -a pgc-hr-system` and confirm `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and `DATABASE_URL` are set.
   - NEXTAUTH_URL must be exactly `https://pgc-hr-system.fly.dev` (or your real Fly URL).

2. **Redeploy after changing secrets**
   - Changing secrets does not restart the app in a way that always picks them up; run `fly deploy` or restart the app.

3. **Create admin manually (if needed)**
   - SSH into the app and run create-admin:
   ```bash
   fly ssh console -a pgc-hr-system
   npm run create-admin
   exit
   ```
   - Or set `ADMIN_EMAIL` / `ADMIN_PASSWORD` and run a new deploy so the release command runs again.

4. **Check logs**
   - `fly logs -a pgc-hr-system` for errors during login or during the release command.

---

## 5. User registration and login flow

- **Register**: Users sign up at `/auth/register` (or `/register`). The app calls `/api/auth/register` and creates a user in the DB.
- **Login**: Users sign in at `/auth/login`. NextAuth validates credentials against the DB and sets a session cookie.
- **Session**: The app uses JWT sessions; the cookie is set by NextAuth when `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are correct and `trustHost` is enabled in the auth config (already set in this project).

If registration or login still fails, use the checklist above and the logs to confirm env and DB.
