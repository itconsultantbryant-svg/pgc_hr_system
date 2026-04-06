import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/prisma/client'

// GET - Get applications (for job seeker or organization)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobPostId = searchParams.get('jobPostId')

    const where: any = {}

    if (session.user.userType === 'JOB_SEEKER') {
      where.userId = session.user.id
    } else if (session.user.userType === 'ORGANIZATION') {
      // Get organization's job posts
      const org = await prisma.organizationProfile.findUnique({
        where: { userId: session.user.id },
      })
      if (org) {
        where.jobPost = {
          organizationId: org.id,
        }
      }
    }

    if (jobPostId) {
      where.jobPostId = jobPostId
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        jobPost: {
          include: {
            organization: {
              select: {
                organizationName: true,
                logo: true,
              },
            },
          },
        },
        user: {
          include: {
            jobSeekerProfile: {
              select: {
                firstName: true,
                lastName: true,
                profilePicture: true,
                currentJobTitle: true,
                location: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(applications)
  } catch (error: any) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create application
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'JOB_SEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { jobPostId, coverLetter } = body

    if (!jobPostId) {
      return NextResponse.json(
        { error: 'Job post ID is required' },
        { status: 400 }
      )
    }

    // Check if user has active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Active subscription required to apply for jobs' },
        { status: 403 }
      )
    }

    // Check if already applied
    const existing = await prisma.application.findFirst({
      where: {
        userId: session.user.id,
        jobPostId,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'You have already applied for this job' },
        { status: 400 }
      )
    }

    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        jobPostId,
        coverLetter,
        status: 'PENDING',
      },
      include: {
        jobPost: true,
      },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error: any) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
