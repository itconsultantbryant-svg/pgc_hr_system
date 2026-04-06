# Fly.io deployment – release command fix

## Why the release failed

The app was configured to run **`npx prisma migrate deploy`** as the release command. This project does **not** use Prisma migrations (it uses **`prisma db push`**), so:

- There is no `prisma/migrations` folder.
- `prisma migrate deploy` has nothing to run and exits with an error.

So the release step failed and the deployment was aborted.

## Fix

Use **`prisma db push`** instead of **`prisma migrate deploy`** for the release command.

### Option 1: Use the `fly.toml` in this repo

This repo now includes a `fly.toml` with:

```toml
[deploy]
  release_command = "npx prisma db push --accept-data-loss"
```

If you deploy from this repo (e.g. `fly deploy` in this directory), Fly will use this and the release step should succeed.

### Option 2: Change the release command in Fly

If your Fly app was created elsewhere and doesn’t use this repo’s `fly.toml`:

1. **In Fly dashboard**  
   Open your app → **Settings** → **Release command**  
   Set it to:
   ```bash
   npx prisma db push --accept-data-loss
   ```
   (or leave it empty if you prefer to run `prisma db push` manually).

2. **Or via CLI**  
   If your config is in a different `fly.toml`, edit it and set:
   ```toml
   [deploy]
     release_command = "npx prisma db push --accept-data-loss"
   ```
   then run `fly deploy` again.

### Required: `DATABASE_URL`

The release command runs in the same environment as your app. Ensure **`DATABASE_URL`** is set for the Fly app (e.g. **Secrets** in the dashboard or `fly secrets set DATABASE_URL=...`).  
If `DATABASE_URL` is missing, `prisma db push` will fail and the release will still fail.

### Optional: use migrations later

If you later switch to migrations:

1. Run locally: `npx prisma migrate dev --name init`
2. Commit the `prisma/migrations` folder
3. In Fly, change the release command to: `npx prisma migrate deploy`

Until then, keep using **`npx prisma db push --accept-data-loss`** for the Fly release command.
