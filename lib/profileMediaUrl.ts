import { getPublicAssetBaseUrl } from '@/lib/publicAssetBaseUrl'

/**
 * Collapse absolute upload URLs to a stable `/uploads/...` path for DB storage.
 * Keeps non-upload absolute URLs (e.g. external CDNs) as-is.
 */
export function canonicalUploadRef(url: string | null | undefined): string | null {
  if (url == null || typeof url !== 'string') return null
  const t = url.trim()
  if (!t || t.startsWith('blob:')) return null
  const noQuery = t.split('?')[0]
  if (noQuery.startsWith('/uploads/')) return noQuery
  try {
    const u = new URL(t)
    if (u.pathname.startsWith('/uploads/')) return u.pathname
  } catch {
    /* not a full URL */
  }
  if (/^https?:\/\//i.test(t)) return t.trim()
  return t.startsWith('/') ? noQuery : null
}

/** Client + server: turn stored paths into a browser-loadable URL. */
export function resolveProfileMediaUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('blob:')) return trimmed
  if (/^https?:\/\//i.test(trimmed)) return trimmed

  const base = getPublicAssetBaseUrl()
  if (!base) return trimmed.startsWith('/') ? trimmed : `/${trimmed}`

  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${base.replace(/\/$/, '')}${path}`
}

/** Normalize API payloads so listing + public profile pages load images on split deploy. */
export function mapJobSeekerProfileUrls<
  T extends {
    profilePicture?: string | null
    profilePictures?: string[] | null
  },
>(row: T): T {
  return {
    ...row,
    profilePicture:
      row.profilePicture != null && String(row.profilePicture).trim() !== ''
        ? resolveProfileMediaUrl(row.profilePicture)
        : row.profilePicture ?? null,
    profilePictures: Array.isArray(row.profilePictures)
      ? row.profilePictures.filter(Boolean).map((u) => resolveProfileMediaUrl(String(u)))
      : row.profilePictures ?? [],
  }
}
