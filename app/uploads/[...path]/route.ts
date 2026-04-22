import { NextResponse } from 'next/server'
import { access, readFile } from 'fs/promises'
import { constants } from 'fs'
import { extname, join, resolve } from 'path'
import { getUploadsRootDir } from '@/lib/uploadsStorage'

export const dynamic = 'force-dynamic'

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
}

function safeUploadPath(segments: string[]): string | null {
  if (!Array.isArray(segments) || segments.length === 0) return null
  if (segments.some((seg) => !seg || seg.includes('\0'))) return null

  const root = resolve(getUploadsRootDir())
  const absolute = resolve(join(root, ...segments))
  if (!absolute.startsWith(root)) return null
  return absolute
}

export async function GET(
  _request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const absolutePath = safeUploadPath(params.path)
    if (!absolutePath) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    await access(absolutePath, constants.R_OK)
    const fileBuffer = await readFile(absolutePath)
    const ext = extname(absolutePath).toLowerCase()
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
