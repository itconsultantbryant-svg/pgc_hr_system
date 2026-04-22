import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/prisma/client'

export const dynamic = 'force-dynamic'

async function setProfileVisibilityByApproval(userId: string) {
  const hasApprovedActiveSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      payments: {
        some: {
          status: 'APPROVED',
        },
      },
    },
    select: { id: true },
  })

  const nextVisibility = !!hasApprovedActiveSubscription
  await prisma.jobSeekerProfile.updateMany({
    where: { userId },
    data: { isVisible: nextVisibility },
  })
  await prisma.companyProfile.updateMany({
    where: { userId },
    data: { isVisible: nextVisibility },
  })
  await prisma.organizationProfile.updateMany({
    where: { userId },
    data: { isVisible: nextVisibility },
  })
}

// PATCH - Approve or reject payment
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
    const { status, notes } = body

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.update({
      where: { id: params.id },
      data: {
        status: status,
        approvedBy: session.user.id,
        approvedAt: new Date(),
        notes: notes || null,
      },
      include: {
        subscription: true,
      },
    })

    if (status === 'APPROVED') {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setFullYear(endDate.getFullYear() + 1)

      await prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          status: 'ACTIVE',
          startDate,
          endDate,
        },
      })
    } else {
      await prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: {
          status: 'SUSPENDED',
        },
      })
    }

    await setProfileVisibilityByApproval(payment.userId)
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: `PAYMENT_${status}`,
        entityType: 'Payment',
        entityId: payment.id,
        details: JSON.stringify({
          subscriptionId: payment.subscriptionId,
          targetUserId: payment.userId,
          amount: payment.amount,
          notes: notes || null,
        }),
      },
    })

    return NextResponse.json(payment)
  } catch (error: any) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
