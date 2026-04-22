/**
 * Split deploy (Vercel UI + Render API): same-origin `/api/*` must be forwarded to the Render web URL.
 * Prefer `BACKEND_URL`; fall back to `NEXT_PUBLIC_BACKEND_URL` so proxying still works if only the public URL is set.
 */

export function getBackendProxyBaseUrl(): string | null {
  const candidates = [
    process.env.BACKEND_URL?.trim(),
    process.env.NEXT_PUBLIC_BACKEND_URL?.trim(),
  ].filter(Boolean) as string[]

  for (const raw of candidates) {
    if (raw.includes('postgres://') || raw.includes('postgresql://')) continue
    try {
      const parsed = new URL(raw)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') continue
      const host = parsed.hostname.toLowerCase()
      if (!host || host === 'postgresql' || host === 'postgres') continue
      return raw.replace(/\/$/, '')
    } catch {
      continue
    }
  }
  return null
}

/**
 * When true, this Node/Edge instance should not run Prisma API routes locally and must forward to `getBackendProxyBaseUrl()`.
 * - Vercel production/preview (`VERCEL=1`) with a backend URL → proxy.
 * - Explicit `FRONTEND_ONLY=true` → proxy.
 * - No `DATABASE_URL` (typical Vercel frontend-only) → proxy when backend URL is set.
 *
 * On Render, `DATABASE_URL` is set and `VERCEL` is unset → do not proxy (avoids rewriting /api to the same service).
 */
export function shouldProxyApiRequests(): boolean {
  const base = getBackendProxyBaseUrl()
  if (!base) return false

  const onVercel = process.env.VERCEL === '1'
  const frontendOnlyFlag = process.env.FRONTEND_ONLY === 'true'
  const noDb = !process.env.DATABASE_URL?.trim()

  return onVercel || frontendOnlyFlag || noDb
}
