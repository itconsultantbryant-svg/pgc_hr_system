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
    const rawBackendUrl = process.env.BACKEND_URL?.trim()
    if (!rawBackendUrl) return []
    if (rawBackendUrl.includes('postgresql://') || rawBackendUrl.includes('postgres://')) {
      console.warn('[next.config] BACKEND_URL cannot be a database URL. Ignoring invalid value.')
      return []
    }

    let backendUrl = ''
    try {
      const parsed = new URL(rawBackendUrl)
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        if (!parsed.hostname || parsed.hostname === 'postgresql' || parsed.hostname === 'postgres') {
          console.warn('[next.config] BACKEND_URL hostname is invalid. Ignoring invalid value.')
          return []
        }
        backendUrl = rawBackendUrl.replace(/\/$/, '')
      } else {
        console.warn('[next.config] BACKEND_URL must use http/https. Ignoring invalid value.')
        return []
      }
    } catch {
      console.warn('[next.config] BACKEND_URL is not a valid URL. Ignoring invalid value.')
      return []
    }

    return [
      // Forward API requests to Render backend when deploying frontend-only on Vercel.
      { source: '/api/:path*', destination: `${backendUrl}/api/:path*` },
      // Serve uploaded profile images from backend persistent storage.
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
