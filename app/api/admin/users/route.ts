import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/prisma/client'

// GET - Get all users
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userType = searchParams.get('userType')
    const status = searchParams.get('status')

    const where: any = {}
    if (userType) {
      where.userType = userType
    }
    if (status === 'active') {
      where.isActive = true
      where.isSuspended = false
    } else if (status === 'suspended') {
      where.isSuspended = true
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        jobSeekerProfile: true,
        companyProfile: true,
        organizationProfile: true,
        subscriptions: {
          include: {
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
