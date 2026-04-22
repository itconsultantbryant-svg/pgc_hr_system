import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/prisma/client'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

const authProviders: NextAuthOptions['providers'] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' }
    },
    async authorize(credentials) {
      try {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const email = credentials.email.trim().toLowerCase()

        const user = await prisma.user.findFirst({
          where: { email: { equals: email, mode: 'insensitive' } },
        })

        if (!user) {
          throw new Error('Invalid email or password')
        }

        if (!user.isActive) {
          throw new Error('Account is not active. Please contact support.')
        }

        if (user.isSuspended) {
          throw new Error('Account is suspended. Please contact support.')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('Invalid email or password')
        }

        return {
          id: user.id,
          email: user.email,
          userType: user.userType,
        }
      } catch (error: any) {
        if (String(error?.message || '').toLowerCase().includes("can't reach database")) {
          throw new Error('Authentication service is temporarily unavailable. Try again shortly.')
        }
        throw error
      }
    }
  })
]

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  authProviders.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

export const authOptions: NextAuthOptions = {
  trustHost: true,
  providers: authProviders,
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true
      const email = user.email?.trim().toLowerCase()
      if (!email) return false

      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        if (!existing.isActive || existing.isSuspended) return false
        return true
      }

      const randomPassword = randomBytes(32).toString('hex')
      const hashedPassword = await bcrypt.hash(randomPassword, 10)

      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          userType: 'JOB_SEEKER',
          emailVerified: new Date(),
          isActive: true,
          isSuspended: false,
        },
      })
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.userType = (user as any).userType
        token.id = (user as any).id
      }

      if ((!token.userType || !token.id) && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email.toLowerCase() },
          select: { id: true, userType: true },
        })
        if (dbUser) {
          token.id = dbUser.id
          token.userType = dbUser.userType
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.userType = token.userType as string
        session.user.id = token.id as string
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 300 * 24 * 60 * 60, // 300 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
