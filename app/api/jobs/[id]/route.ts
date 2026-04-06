import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/prisma/client'

// GET - Get single job post
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobPost = await prisma.jobPost.findUnique({
      where: { id: params.id },
      include: {
        organization: {
          select: {
            organizationName: true,
            type: true,
            logo: true,
            description: true,
            location: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    })

    if (!jobPost) {
      return NextResponse.json({ error: 'Job post not found' }, { status: 404 })
    }

    return NextResponse.json(jobPost)
  } catch (error: any) {
    console.error('Error fetching job post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update job post
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

    const jobPost = await prisma.jobPost.findUnique({
      where: { id: params.id },
    })

    if (!jobPost || jobPost.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updated = await prisma.jobPost.update({
      where: { id: params.id },
      data: {
        ...body,
        applicationDeadline: body.applicationDeadline
          ? new Date(body.applicationDeadline)
          : undefined,
      },
      include: {
        organization: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating job post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete job post
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'ORGANIZATION') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jobPost = await prisma.jobPost.findUnique({
      where: { id: params.id },
    })

    if (!jobPost || jobPost.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.jobPost.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Job post deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting job post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
