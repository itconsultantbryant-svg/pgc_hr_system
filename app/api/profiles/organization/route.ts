import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/prisma/client'

// GET - Get organization profile
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.organizationProfile.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json(profile)
  } catch (error: any) {
    console.error('Error fetching organization profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create or update organization profile
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'ORGANIZATION') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      organizationName,
      type,
      phone,
      email,
      website,
      logo,
      description,
      industry,
      location,
      employeeCount,
    } = body

    if (!organizationName || !type) {
      return NextResponse.json(
        { error: 'Organization name and type are required' },
        { status: 400 }
      )
    }

    const profile = await prisma.organizationProfile.upsert({
      where: { userId: session.user.id },
      update: {
        organizationName,
        type,
        phone,
        email,
        website,
        logo,
        description,
        industry,
        location,
        employeeCount,
      },
      create: {
        userId: session.user.id,
        organizationName,
        type,
        phone,
        email,
        website,
        logo,
        description,
        industry,
        location,
        employeeCount,
      },
    })

    return NextResponse.json(profile, { status: 201 })
  } catch (error: any) {
    console.error('Error creating/updating organization profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
