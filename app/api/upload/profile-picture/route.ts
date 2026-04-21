import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { getPublicAssetBaseUrl } from '@/lib/publicAssetBaseUrl'

export const dynamic = 'force-dynamic'

function getProfilesUploadDir() {
  const customRoot = process.env.UPLOAD_DIR?.trim()
  if (customRoot) {
    return join(customRoot, 'profiles')
  }
  return join(process.cwd(), 'public', 'uploads', 'profiles')
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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = getProfilesUploadDir()
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '') || 'jpg'
    const timestamp = Date.now()
    const filename = `${session.user.id}-${timestamp}.${ext}`
    const filepath = join(uploadsDir, filename)

    await writeFile(filepath, buffer)

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
