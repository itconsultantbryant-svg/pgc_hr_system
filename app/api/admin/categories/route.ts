import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/prisma/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categories = await prisma.jobCategory.findMany({
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching admin categories:', error)
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
    const name = (body?.name || '').trim()

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    const existing = await prisma.jobCategory.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    })

    if (existing) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 409 })
    }

    const created = await prisma.jobCategory.create({
      data: { name, isActive: true },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
