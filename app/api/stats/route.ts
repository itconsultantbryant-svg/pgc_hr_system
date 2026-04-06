import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/client'

// GET - Get platform statistics
export async function GET() {
  try {
    // Count active job seekers (with active subscriptions)
    const activeJobSeekers = await prisma.jobSeekerProfile.count({
      where: {
        isVisible: true,
        user: {
          isActive: true,
          isSuspended: false,
          subscriptions: {
            some: {
              status: 'ACTIVE',
            },
          },
        },
      },
    })

    // Count active companies (with active subscriptions)
    const activeCompanies = await prisma.companyProfile.count({
      where: {
        isVisible: true,
        user: {
          isActive: true,
          isSuspended: false,
          subscriptions: {
            some: {
              status: 'ACTIVE',
            },
          },
        },
      },
    })

    // Count active organizations (with active subscriptions)
    const activeOrganizations = await prisma.organizationProfile.count({
      where: {
        isVisible: true,
        user: {
          isActive: true,
          isSuspended: false,
          subscriptions: {
            some: {
              status: 'ACTIVE',
            },
          },
        },
      },
    })

    // Count total active job posts
    const activeJobPosts = await prisma.jobPost.count({
      where: {
        isActive: true,
      },
    })

    // Count total applications
    const totalApplications = await prisma.application.count()

    // Calculate success rate (applications that were accepted)
    const acceptedApplications = await prisma.application.count({
      where: {
        status: 'ACCEPTED',
      },
    })

    const successRate = totalApplications > 0 
      ? Math.round((acceptedApplications / totalApplications) * 100)
      : 0

    // Total companies includes both companies and organizations
    const totalCompanies = activeCompanies + activeOrganizations

    return NextResponse.json({
      jobSeekers: activeJobSeekers,
      companies: totalCompanies,
      jobOpenings: activeJobPosts,
      successRate: successRate,
      totalApplications: totalApplications,
      acceptedApplications: acceptedApplications,
    })
  } catch (error: any) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        // Return default values on error
        jobSeekers: 0,
        companies: 0,
        jobOpenings: 0,
        successRate: 0,
      },
      { status: 500 }
    )
  }
}

