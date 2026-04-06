import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/prisma/client'

// GET - Get job posts (public or for organizations)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const search = searchParams.get('search')
    const location = searchParams.get('location')
    const jobType = searchParams.get('jobType')
    const category = searchParams.get('category')

    const session = await getServerSession(authOptions)

    const where: any = {}

    // If user is organization and requesting their own jobs
    if (organizationId === 'current' && session?.user.userType === 'ORGANIZATION') {
      const org = await prisma.organizationProfile.findUnique({
        where: { userId: session.user.id },
      })
      if (org) {
        where.organizationId = org.id
        // Show all jobs (active and inactive) for organization's own view
      }
    } else if (organizationId && organizationId !== 'current') {
      where.organizationId = organizationId
      where.isActive = true
    } else {
      // Public view - only show active jobs
      where.isActive = true
    }

    // Apply filters
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { requirements: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' }
    }

    if (jobType) {
      where.jobType = jobType
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' }
    }

    // If not logged in or not organization owner, only show active jobs
    const jobPosts = await prisma.jobPost.findMany({
      where,
      include: {
        organization: {
          select: {
            organizationName: true,
            type: true,
            logo: true,
          },
        },
        applications: session?.user
          ? {
              where: {
                userId: session.user.id,
              },
            }
          : false,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(jobPosts)
  } catch (error: any) {
    console.error('Error fetching job posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new job post
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'ORGANIZATION') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      requirements,
      location,
      jobType,
      salaryRange,
      category,
      applicationDeadline,
    } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Get organization profile
    const organization = await prisma.organizationProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization profile not found' },
        { status: 404 }
      )
    }

    const jobPost = await prisma.jobPost.create({
      data: {
        organizationId: organization.id,
        userId: session.user.id,
        title,
        description,
        requirements,
        location,
        jobType: jobType || 'FULL_TIME',
        salaryRange,
        category,
        applicationDeadline: applicationDeadline
          ? new Date(applicationDeadline)
          : null,
      },
      include: {
        organization: true,
      },
    })

    return NextResponse.json(jobPost, { status: 201 })
  } catch (error: any) {
    console.error('Error creating job post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
