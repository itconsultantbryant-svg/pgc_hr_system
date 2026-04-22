import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir, access } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { getPublicAssetBaseUrl } from '@/lib/publicAssetBaseUrl'
import { getProfilesUploadDir } from '@/lib/uploadsStorage'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024 // 25MB

const mimeToExt: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Sign in again and retry your upload.' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Allow high-resolution photos; cropped/optimized variants are recommended but not required.
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: 'File size must be less than 25MB' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = getProfilesUploadDir()
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const extFromMime = mimeToExt[file.type.toLowerCase()]
    const extFromName = (file.name.split('.').pop() || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    const ext = extFromMime || extFromName || 'jpg'
    const timestamp = Date.now()
    const filename = `${session.user.id}-${timestamp}-${randomUUID()}.${ext}`
    const filepath = join(uploadsDir, filename)

    await writeFile(filepath, buffer)
    await access(filepath)

    const relativePath = `/uploads/profiles/${filename}`
    const base = getPublicAssetBaseUrl()
    const url = base ? `${base}${relativePath}` : relativePath

    return NextResponse.json({ url, path: relativePath })
  } catch (error: any) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
