import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/client'

// GET - Get public profiles (for home page listings)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const search = searchParams.get('search')
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

      if (category) where.category = category
      if (location) where.location = { contains: location, mode: 'insensitive' }

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { bio: { contains: search, mode: 'insensitive' } },
          { currentJobTitle: { contains: search, mode: 'insensitive' } },
        ]
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

      if (category || search) {
        where.OR = [
          { companyName: { contains: search || category, mode: 'insensitive' } },
          { industry: { contains: category || search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }

      if (location) where.location = { contains: location, mode: 'insensitive' }

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
