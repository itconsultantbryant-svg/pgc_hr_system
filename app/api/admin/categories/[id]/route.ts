import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/prisma/client'

export const dynamic = 'force-dynamic'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updates: { name?: string; isActive?: boolean } = {}

    if (typeof body?.name === 'string') {
      const trimmed = body.name.trim()
      if (!trimmed) {
        return NextResponse.json({ error: 'Category name cannot be empty' }, { status: 400 })
      }

      const duplicate = await prisma.jobCategory.findFirst({
        where: {
          id: { not: params.id },
          name: { equals: trimmed, mode: 'insensitive' },
        },
      })

      if (duplicate) {
        return NextResponse.json({ error: 'Category already exists' }, { status: 409 })
      }

      updates.name = trimmed
    }

    if (typeof body?.isActive === 'boolean') {
      updates.isActive = body.isActive
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 })
    }

    const updated = await prisma.jobCategory.update({
      where: { id: params.id },
      data: updates,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.jobCategory.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
