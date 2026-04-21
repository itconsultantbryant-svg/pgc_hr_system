import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/client'
import { mapJobSeekerProfileUrls } from '@/lib/profileMediaUrl'

export const dynamic = 'force-dynamic'

// GET - Global search for homepage and talent page
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = (searchParams.get('query') || '').trim()
    const type = searchParams.get('type') || 'all'
    const category = (searchParams.get('category') || '').trim()
    const limit = Math.min(parseInt(searchParams.get('limit') || '12', 10), 50)

    const queryFilter = query
      ? {
          contains: query,
          mode: 'insensitive' as const,
        }
      : undefined

    const talentWhere: any = {
      isVisible: true,
      user: {
        isActive: true,
        isSuspended: false,
      },
    }

    if (category) {
      talentWhere.category = { contains: category, mode: 'insensitive' }
    }

    if (queryFilter) {
      talentWhere.OR = [
        { firstName: queryFilter },
        { lastName: queryFilter },
        { bio: queryFilter },
        { location: queryFilter },
        { category: queryFilter },
        { currentJobTitle: queryFilter },
        { competencies: { some: { name: queryFilter } } },
        { experiences: { some: { OR: [{ position: queryFilter }, { company: queryFilter }] } } },
        { educations: { some: { OR: [{ degree: queryFilter }, { field: queryFilter }] } } },
      ]
    }

    const companyWhere: any = {
      isVisible: true,
      user: {
        isActive: true,
        isSuspended: false,
      },
    }
    if (category) {
      companyWhere.industry = { contains: category, mode: 'insensitive' }
    }
    if (queryFilter) {
      companyWhere.OR = [
        { companyName: queryFilter },
        { industry: queryFilter },
        { description: queryFilter },
        { location: queryFilter },
        { services: queryFilter },
      ]
    }

    const organizationWhere: any = {
      isVisible: true,
      user: {
        isActive: true,
        isSuspended: false,
      },
    }
    if (category) {
      organizationWhere.industry = { contains: category, mode: 'insensitive' }
    }
    if (queryFilter) {
      organizationWhere.OR = [
        { organizationName: queryFilter },
        { type: queryFilter },
        { industry: queryFilter },
        { description: queryFilter },
        { location: queryFilter },
      ]
    }

    const jobsWhere: any = { isActive: true }
    if (category) {
      jobsWhere.category = { contains: category, mode: 'insensitive' }
    }
    if (queryFilter) {
      jobsWhere.OR = [
        { title: queryFilter },
        { description: queryFilter },
        { requirements: queryFilter },
        { category: queryFilter },
        { location: queryFilter },
      ]
    }

    const shouldFetchTalents = type === 'all' || type === 'talents'
    const shouldFetchCompanies = type === 'all' || type === 'contractors'
    const shouldFetchOrganizations = type === 'all' || type === 'hiring-entities'
    const shouldFetchJobs = type === 'all' || type === 'jobs'

    const [jobSeekers, companies, organizations, jobs] = await Promise.all([
      shouldFetchTalents
        ? prisma.jobSeekerProfile.findMany({
            where: talentWhere,
            take: limit,
            include: {
              competencies: { take: 5 },
              user: {
                select: {
                  id: true,
                  email: true,
                  subscriptions: {
                    where: { status: 'ACTIVE' },
                    take: 1,
                  },
                },
              },
            },
            orderBy: { updatedAt: 'desc' },
          })
        : Promise.resolve([]),
      shouldFetchCompanies
        ? prisma.companyProfile.findMany({
            where: companyWhere,
            take: limit,
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
            orderBy: { updatedAt: 'desc' },
          })
        : Promise.resolve([]),
      shouldFetchOrganizations
        ? prisma.organizationProfile.findMany({
            where: organizationWhere,
            take: limit,
            orderBy: { updatedAt: 'desc' },
          })
        : Promise.resolve([]),
      shouldFetchJobs
        ? prisma.jobPost.findMany({
            where: jobsWhere,
            take: limit,
            include: {
              organization: {
                select: {
                  organizationName: true,
                  logo: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        : Promise.resolve([]),
    ])

    return NextResponse.json({
      jobSeekers: jobSeekers.map((row) => mapJobSeekerProfileUrls(row)),
      companies,
      organizations,
      jobs,
    })
  } catch (error: any) {
    console.error('Error in global search:', error)
    // Return empty collections so homepage and talent page stay functional.
    return NextResponse.json({
      jobSeekers: [],
      companies: [],
      organizations: [],
      jobs: [],
    })
  }
}
