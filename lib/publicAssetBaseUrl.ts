/**
 * Base URL where uploaded files under /uploads/* are publicly reachable.
 * On split deploy (Vercel + Render), set NEXT_PUBLIC_BACKEND_URL and BACKEND_URL to the Render web URL.
 * Omit for local single-host dev (relative /uploads/... works).
 */
export function getPublicAssetBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_BACKEND_URL?.trim() ||
    process.env.BACKEND_URL?.trim() ||
    ''
  if (!raw || raw.includes('postgres://') || raw.includes('postgresql://')) {
    return ''
  }
  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return ''
    return raw.replace(/\/$/, '')
  } catch {
    return ''
  }
}
