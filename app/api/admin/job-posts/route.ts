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

    const posts = await prisma.jobPost.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 200,
      include: {
        organization: { select: { organizationName: true } },
        _count: { select: { applications: true } },
      },
    })

    return NextResponse.json(posts)
  } catch (e) {
    console.error('admin job-posts', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
