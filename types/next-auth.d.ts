import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      userType: string
    }
  }

  interface User {
    id: string
    email: string
    userType: string
  }

  interface AuthOptions {
    trustHost?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    userType: string
  }
}
