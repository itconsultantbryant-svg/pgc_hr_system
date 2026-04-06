'use client'

import { useSession } from 'next-auth/react'
import Layout from '@/components/layout/Layout'
import RoleDashboardLayout from '@/components/layout/RoleDashboardLayout'

export default function DashboardPageShell({
  children,
  title,
}: {
  children: React.ReactNode
  title?: string
}) {
  const { data: session, status } = useSession()
  const role = session?.user.userType

  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
      </Layout>
    )
  }

  if (role === 'JOB_SEEKER' || role === 'COMPANY' || role === 'ORGANIZATION') {
    return <RoleDashboardLayout title={title}>{children}</RoleDashboardLayout>
  }

  return <Layout>{children}</Layout>
}
