import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/client'

// GET - Get public profiles (for home page listings)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const address = searchParams.get('address')
    const search = searchParams.get('search')
    const name = searchParams.get('name')
    const position = searchParams.get('position')
    const jobTitle = searchParams.get('jobTitle')
    const educationLevel = searchParams.get('educationLevel')
    const skill = searchParams.get('skill')
    const competency = searchParams.get('competency')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    let jobSeekers: any[] = []
    let companies: any[] = []

    if (type === 'all' || type === 'job-seekers') {
      const where: any = {
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
      }

      const andFilters: any[] = []

      if (category) andFilters.push({ category: { contains: category, mode: 'insensitive' } })
      if (location) andFilters.push({ location: { contains: location, mode: 'insensitive' } })
      if (address) andFilters.push({ location: { contains: address, mode: 'insensitive' } })
      if (jobTitle) andFilters.push({ currentJobTitle: { contains: jobTitle, mode: 'insensitive' } })
      if (position) {
        andFilters.push({
          OR: [
            { currentJobTitle: { contains: position, mode: 'insensitive' } },
            { experiences: { some: { position: { contains: position, mode: 'insensitive' } } } },
          ],
        })
      }
      if (educationLevel) {
        andFilters.push({
          educations: {
            some: {
              OR: [
                { degree: { contains: educationLevel, mode: 'insensitive' } },
                { field: { contains: educationLevel, mode: 'insensitive' } },
              ],
            },
          },
        })
      }
      if (skill) {
        andFilters.push({
          competencies: {
            some: { name: { contains: skill, mode: 'insensitive' } },
          },
        })
      }
      if (competency) {
        andFilters.push({
          competencies: {
            some: { name: { contains: competency, mode: 'insensitive' } },
          },
        })
      }
      if (name) {
        andFilters.push({
          OR: [
            { firstName: { contains: name, mode: 'insensitive' } },
            { lastName: { contains: name, mode: 'insensitive' } },
          ],
        })
      }
      if (search) {
        andFilters.push({
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { bio: { contains: search, mode: 'insensitive' } },
            { currentJobTitle: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
            { competencies: { some: { name: { contains: search, mode: 'insensitive' } } } },
            {
              educations: {
                some: {
                  OR: [
                    { degree: { contains: search, mode: 'insensitive' } },
                    { field: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            },
            {
              experiences: {
                some: {
                  OR: [
                    { position: { contains: search, mode: 'insensitive' } },
                    { company: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            },
          ],
        })
      }

      if (andFilters.length > 0) {
        where.AND = andFilters
      }

      jobSeekers = await prisma.jobSeekerProfile.findMany({
        where,
        take: limit,
        skip,
        include: {
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
          competencies: { take: 5 },
          experiences: {
            select: {
              id: true,
              position: true,
            },
            take: 3,
          },
          educations: {
            select: {
              id: true,
              degree: true,
              field: true,
            },
            take: 3,
          },
        },
        orderBy: { updatedAt: 'desc' },
      })
    }

    if (type === 'all' || type === 'companies') {
      const where: any = {
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
      }

      if (category || search || name) {
        const searchTerm = search || name || category
        where.OR = [
          { companyName: { contains: searchTerm, mode: 'insensitive' } },
          { industry: { contains: category || searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ]
      }

      if (location || address) {
        where.location = { contains: location || address, mode: 'insensitive' }
      }

      companies = await prisma.companyProfile.findMany({
        where,
        take: limit,
        skip,
        include: {
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
    }

    return NextResponse.json({
      jobSeekers,
      companies,
      page,
      limit,
    })
  } catch (error: any) {
    console.error('Error fetching public profiles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
