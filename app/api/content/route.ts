import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')

    const contents = await prisma.contentItem.findMany({
      where: {
        isActive: true,
        ...(position ? { position } : {}),
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(contents)
  } catch (error: any) {
    console.error('Error fetching public contents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
