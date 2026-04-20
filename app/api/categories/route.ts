import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const categories = await prisma.jobCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
