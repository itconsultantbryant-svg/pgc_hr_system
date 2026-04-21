import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/prisma/client'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  trustHost: true,
  providers: [
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
  ],
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userType = user.userType
        token.id = user.id
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
