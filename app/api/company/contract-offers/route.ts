import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'COMPANY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!profile) {
      return NextResponse.json([])
    }

    const offers = await prisma.contractOffer.findMany({
      where: { companyId: profile.id },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(offers)
  } catch (e) {
    console.error('contract-offers GET', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'COMPANY') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!profile) {
      return NextResponse.json({ error: 'Create your company profile first' }, { status: 400 })
    }

    const body = await request.json()
    const { title, description, budget, duration, requirements, deadline } = body

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const offer = await prisma.contractOffer.create({
      data: {
        companyId: profile.id,
        title: title.trim(),
        description: description.trim(),
        budget: budget?.trim() || null,
        duration: duration?.trim() || null,
        requirements: requirements?.trim() || null,
        deadline: deadline ? new Date(deadline) : null,
        isActive: true,
      },
    })

    return NextResponse.json(offer, { status: 201 })
  } catch (e) {
    console.error('contract-offers POST', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
