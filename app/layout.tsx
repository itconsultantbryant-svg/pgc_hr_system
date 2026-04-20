import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Lib-StaffConnect - Jobs Platform',
  description: 'Connect professionals, companies, and employers on a comprehensive jobs and contracts platform',
  icons: {
    icon: '/libstaffconnect-logo.png',
    apple: '/libstaffconnect-logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased">
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
