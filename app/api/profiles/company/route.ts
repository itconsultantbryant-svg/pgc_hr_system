import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/prisma/client'

// GET - Get company profile
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
      include: { executives: { orderBy: { order: 'asc' } } },
    })

    return NextResponse.json(profile)
  } catch (error: any) {
    console.error('Error fetching company profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create or update company profile
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'COMPANY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      companyName,
      registrationNumber,
      phone,
      email,
      website,
      logo,
      description,
      industry,
      location,
      yearEstablished,
      employeeCount,
      services,
      currentPerformance,
      previousPerformance,
      currentClients,
      previousClients,
      revenueGenerated,
      contractCompletionAbility,
      otherDetails,
      executives,
    } = body

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    const profile = await prisma.companyProfile.upsert({
      where: { userId: session.user.id },
      update: {
        companyName,
        registrationNumber,
        phone,
        email,
        website,
        logo,
        description,
        industry,
        location,
        yearEstablished: yearEstablished ? parseInt(yearEstablished) : null,
        employeeCount,
        services,
        currentPerformance,
        previousPerformance,
        currentClients,
        previousClients,
        revenueGenerated,
        contractCompletionAbility,
        otherDetails,
      },
      create: {
        userId: session.user.id,
        companyName,
        registrationNumber,
        phone,
        email,
        website,
        logo,
        description,
        industry,
        location,
        yearEstablished: yearEstablished ? parseInt(yearEstablished) : null,
        employeeCount,
        services,
        currentPerformance,
        previousPerformance,
        currentClients,
        previousClients,
        revenueGenerated,
        contractCompletionAbility,
        otherDetails,
      },
    })

    if (executives && Array.isArray(executives)) {
      await prisma.companyExecutive.deleteMany({ where: { companyId: profile.id } })
      const validExecutives = executives.filter((e: any) => e.name && e.role)
      if (validExecutives.length > 0) {
        await prisma.companyExecutive.createMany({
          data: validExecutives.map((e: any, index: number) => ({
            companyId: profile.id,
            name: e.name,
            role: e.role,
            bio: e.bio || null,
            profileImage: e.profileImage || null,
            order: index,
          })),
        })
      }
    }

    const updatedProfile = await prisma.companyProfile.findUnique({
      where: { id: profile.id },
      include: { executives: { orderBy: { order: 'asc' } } },
    })

    return NextResponse.json(updatedProfile, { status: 201 })
  } catch (error: any) {
    console.error('Error creating/updating company profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
