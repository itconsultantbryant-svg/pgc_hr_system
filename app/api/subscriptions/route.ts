import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/prisma/client'

// GET - Get user's subscriptions
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: session.user.id },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(subscriptions)
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new subscription
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, amount } = body

    if (!type || !amount) {
      return NextResponse.json(
        { error: 'Subscription type and amount are required' },
        { status: 400 }
      )
    }

    if (type === 'DIRECT' && amount !== 10) {
      return NextResponse.json(
        { error: 'Direct package must be $10' },
        { status: 400 }
      )
    }

    if (type === 'INDIRECT' && amount < 5) {
      return NextResponse.json(
        { error: 'In-Direct package minimum is $5' },
        { status: 400 }
      )
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        type: type,
        amount: parseFloat(amount),
        status: 'PENDING',
      },
    })

    // Create pending payment
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        subscriptionId: subscription.id,
        amount: parseFloat(amount),
        status: 'PENDING',
      },
    })

    return NextResponse.json(
      { subscription, payment },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
