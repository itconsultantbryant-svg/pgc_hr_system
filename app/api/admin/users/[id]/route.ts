import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/prisma/client'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

// GET - Get single user
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
        companyProfile: true,
        organizationProfile: true,
        subscriptions: {
          include: {
            payments: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update user (suspend, activate, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { isActive, isSuspended, resetPassword, newPassword } = body

    if (resetPassword === true || typeof newPassword === 'string') {
      const tempPassword =
        typeof newPassword === 'string' && newPassword.trim().length >= 6
          ? newPassword.trim()
          : randomBytes(6).toString('base64url')
      const hashedPassword = await bcrypt.hash(tempPassword, 10)

      await prisma.user.update({
        where: { id: params.id },
        data: {
          password: hashedPassword,
        },
      })
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          action: 'ADMIN_PASSWORD_RESET',
          entityType: 'User',
          entityId: params.id,
          details: JSON.stringify({
            resetType:
              typeof newPassword === 'string' && newPassword.trim().length >= 6
                ? 'MANUAL_PASSWORD'
                : 'TEMP_PASSWORD',
          }),
        },
      })

      return NextResponse.json({
        message: 'Password reset successfully',
        temporaryPassword: tempPassword,
      })
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(isSuspended !== undefined && { isSuspended }),
      },
    })

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: 'ADMIN_USER_STATUS_UPDATE',
        entityType: 'User',
        entityId: params.id,
        details: JSON.stringify({
          isActive: isActive ?? null,
          isSuspended: isSuspended ?? null,
        }),
      },
    })

    return NextResponse.json(user)
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
