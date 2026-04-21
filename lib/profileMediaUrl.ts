import { getPublicAssetBaseUrl } from '@/lib/publicAssetBaseUrl'

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
