import { join } from 'path'

function normalizeCustomUploadRoot(customRoot: string): string {
  const trimmed = customRoot.trim().replace(/\/+$/, '')
  if (!trimmed) return ''

  // Allow either `/some/path` (we append `/uploads`) or `/some/path/uploads` directly.
  return trimmed.endsWith('/uploads') ? trimmed : join(trimmed, 'uploads')
}

/**
 * Root directory that backs public `/uploads/*` assets.
 * - Default: `<project>/public/uploads`
 * - With `UPLOAD_DIR`: either that folder (if it already ends with `/uploads`)
 *   or `<UPLOAD_DIR>/uploads`
 */
export function getUploadsRootDir(): string {
  const customRoot = process.env.UPLOAD_DIR?.trim()
  if (customRoot) {
    return normalizeCustomUploadRoot(customRoot)
  }
  return join(process.cwd(), 'public', 'uploads')
}

export function getDefaultUploadsRootDir(): string {
  return join(process.cwd(), 'public', 'uploads')
}

/**
 * Ordered roots to probe when serving media.
 * Primary root comes first (UPLOAD_DIR or default), then default as legacy fallback.
 */
export function getUploadRootCandidates(): string[] {
  const primary = getUploadsRootDir()
  const fallback = getDefaultUploadsRootDir()
  return primary === fallback ? [primary] : [primary, fallback]
}

export function getProfilesUploadDir(): string {
  return join(getUploadsRootDir(), 'profiles')
}
