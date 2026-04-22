import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/client'
import { createHash, randomBytes } from 'crypto'
import { sendEmail } from '@/lib/email'

const RESET_TOKEN_TTL_MINUTES = Number(process.env.PASSWORD_RESET_TTL_MINUTES || 30)

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, isActive: true, isSuspended: true, email: true },
    })

    // Avoid account enumeration by returning same response.
    if (!user || !user.isActive || user.isSuspended) {
      return NextResponse.json({
        message:
          'If an account exists for that email, password reset instructions were generated.',
      })
    }

    // Invalidate previous active tokens for this user.
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { usedAt: new Date() },
    })

    const rawToken = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000)

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    })

    const appBase =
      process.env.NEXTAUTH_URL?.replace(/\/$/, '') ||
      process.env.NEXT_PUBLIC_FRONTEND_URL?.replace(/\/$/, '') ||
      ''
    const resetUrl = appBase
      ? `${appBase}/auth/reset-password?token=${rawToken}`
      : `/auth/reset-password?token=${rawToken}`

    const appName = process.env.APP_NAME?.trim() || 'Lib-StaffConnect'
    const textBody =
      `You requested a password reset for ${appName}.\n\n` +
      `Use this link to reset your password:\n${resetUrl}\n\n` +
      `This link expires in ${RESET_TOKEN_TTL_MINUTES} minutes.\n` +
      `If you did not request this, you can ignore this email.`

    const htmlBody = `
      <p>You requested a password reset for <strong>${appName}</strong>.</p>
      <p>
        <a href="${resetUrl}" target="_blank" rel="noopener noreferrer">Click here to reset your password</a>
      </p>
      <p>This link expires in ${RESET_TOKEN_TTL_MINUTES} minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `

    let emailSent = false
    try {
      emailSent = await sendEmail({
        to: user.email,
        subject: `${appName} password reset`,
        text: textBody,
        html: htmlBody,
      })
    } catch (mailError) {
      console.error('Password reset email send failed:', mailError)
      emailSent = false
    }

    // Safe fallback when SMTP is not configured yet.
    if (!emailSent) {
      console.log(`[auth] Password reset requested for ${user.email}. Reset URL: ${resetUrl}`)
    }

    return NextResponse.json({
      message:
        'If an account exists for that email, password reset instructions were generated.',
      ...(process.env.NODE_ENV !== 'production' ? { resetUrl } : {}),
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
