/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production installs (e.g. Render) omit devDependencies; ESLint lives in devDeps.
  eslint: { ignoreDuringBuilds: true },
  async redirects() {
    return [
      { source: '/favicon.ico', destination: '/libstaffconnect-logo.png', permanent: true },
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
