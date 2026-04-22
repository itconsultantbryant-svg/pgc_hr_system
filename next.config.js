/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production installs (e.g. Render) omit devDependencies; ESLint lives in devDeps.
  eslint: { ignoreDuringBuilds: true },
  async redirects() {
    return [
      { source: '/favicon.ico', destination: '/libstaffconnect-logo.png', permanent: true },
    ]
  },
  async rewrites() {
    /** Same rules as middleware + lib/backendProxyBaseUrl — keep in sync for build-time rewrites on Vercel. */
    const rawCandidates = [
      process.env.BACKEND_URL?.trim(),
      process.env.NEXT_PUBLIC_BACKEND_URL?.trim(),
    ].filter(Boolean)

    let backendUrl = ''
    for (const rawBackendUrl of rawCandidates) {
      if (rawBackendUrl.includes('postgresql://') || rawBackendUrl.includes('postgres://')) continue
      try {
        const parsed = new URL(rawBackendUrl)
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') continue
        const host = parsed.hostname?.toLowerCase()
        if (!host || host === 'postgresql' || host === 'postgres') continue
        backendUrl = rawBackendUrl.replace(/\/$/, '')
        break
      } catch {
        continue
      }
    }

    if (!backendUrl) return []

    const onVercel = process.env.VERCEL === '1'
    const frontendOnlyFlag = process.env.FRONTEND_ONLY === 'true'
    const noDb = !process.env.DATABASE_URL?.trim()
    if (!onVercel && !frontendOnlyFlag && !noDb) {
      return []
    }

    return [
      { source: '/api/:path*', destination: `${backendUrl}/api/:path*` },
      { source: '/uploads/:path*', destination: `${backendUrl}/uploads/:path*` },
    ]
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // Ensure Prisma Client is available
  webpack: (config) => {
    config.externals.push('@prisma/client');
    return config;
  },
}

module.exports = nextConfig
