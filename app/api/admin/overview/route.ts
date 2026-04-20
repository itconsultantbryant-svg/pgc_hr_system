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

    const now = new Date()
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const [
      usersTotal,
      jobSeekers,
      companies,
      organizations,
      pendingPayments,
      activeJobs,
      applicationsTotal,
      applications24h,
      recentApplications,
      recentPayments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { userType: 'JOB_SEEKER' } }),
      prisma.user.count({ where: { userType: 'COMPANY' } }),
      prisma.user.count({ where: { userType: 'ORGANIZATION' } }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.jobPost.count({ where: { isActive: true } }),
      prisma.application.count(),
      prisma.application.count({ where: { createdAt: { gte: dayAgo } } }),
      prisma.application.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          jobPost: { select: { title: true } },
          user: { select: { email: true } },
        },
      }),
      prisma.payment.findMany({
        where: { status: 'PENDING' },
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true } },
        },
      }),
    ])

    return NextResponse.json({
      generatedAt: now.toISOString(),
      users: { total: usersTotal, jobSeekers, companies, organizations },
      pendingPayments,
      activeJobs,
      applications: { total: applicationsTotal, last24h: applications24h },
      recentApplications,
      recentPendingPayments: recentPayments,
    })
  } catch (e) {
    console.error('admin overview', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
