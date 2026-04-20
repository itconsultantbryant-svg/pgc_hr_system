import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const take = Math.min(Number(searchParams.get('take')) || 100, 300)

    const where = status ? { status: status as 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED' } : {}

    const rows = await prisma.application.findMany({
      where,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        jobPost: {
          select: {
            id: true,
            title: true,
            organization: { select: { organizationName: true } },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            jobSeekerProfile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    })

    return NextResponse.json(rows)
  } catch (e) {
    console.error('admin applications-list', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
