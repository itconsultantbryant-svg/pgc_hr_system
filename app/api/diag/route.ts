import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/client'

export const dynamic = 'force-dynamic'

const normalizeHost = (urlValue?: string) => {
  if (!urlValue) return null
  try {
    return new URL(urlValue).host
  } catch {
    return 'invalid'
  }
}

export async function GET() {
  const env = {
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
    backendUrlHost: normalizeHost(process.env.BACKEND_URL),
    nextAuthUrlHost: normalizeHost(process.env.NEXTAUTH_URL),
  }

  try {
    await prisma.$queryRawUnsafe('SELECT 1')

    const [usersCount, migrationsCount] = await Promise.all([
      prisma.user.count(),
      prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
        'SELECT COUNT(*)::bigint AS count FROM "_prisma_migrations"'
      ),
    ])

    return NextResponse.json({
      ok: true,
      env,
      db: {
        connected: true,
        usersCount,
        migrationsCount: Number(migrationsCount?.[0]?.count || 0),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        env,
        db: {
          connected: false,
          error: error?.message || 'Database check failed',
        },
      },
      { status: 500 }
    )
  }
}
