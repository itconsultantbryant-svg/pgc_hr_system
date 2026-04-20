import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/prisma/client'

export const dynamic = 'force-dynamic'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    const updated = await prisma.contentItem.update({
      where: { id: params.id },
      data: {
        title,
        type,
        content,
        imageUrl: imageUrl || null,
        position,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.contentItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
