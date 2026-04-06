import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contents = await prisma.contentItem.findMany({
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(contents)
  } catch (error: any) {
    console.error('Error fetching contents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, type, content, imageUrl, position, isActive } = body

    if (!title || !type || !content || !position) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newContent = await prisma.contentItem.create({
      data: {
        title,
        type,
        content,
        imageUrl: imageUrl || null,
        position,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(newContent)
  } catch (error: any) {
    console.error('Error creating content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
