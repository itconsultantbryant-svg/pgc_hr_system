import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/prisma/client'

// GET - Get single application
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        jobPost: {
          include: {
            organization: {
              select: {
                organizationName: true,
                logo: true,
                description: true,
              },
            },
          },
        },
        user: {
          include: {
            jobSeekerProfile: {
              include: {
                experiences: true,
                educations: true,
                competencies: true,
                references: true,
                languages: true,
              },
            },
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check authorization
    if (session.user.userType === 'JOB_SEEKER' && application.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (session.user.userType === 'ORGANIZATION') {
      const org = await prisma.organizationProfile.findUnique({
        where: { userId: session.user.id },
      })
      if (org && application.jobPost.organizationId !== org.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    return NextResponse.json(application)
  } catch (error: any) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update application status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'ORGANIZATION') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, notes } = body

    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        jobPost: {
          include: {
            organization: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (application.jobPost.organization.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: {
        status: status,
        reviewedAt: new Date(),
        notes: notes || null,
      },
      include: {
        jobPost: true,
        user: {
          include: {
            jobSeekerProfile: true,
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
