'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ExternalLink, MapPin } from 'lucide-react'

type JobRow = {
  id: string
  title: string
  isActive: boolean
  location: string | null
  jobType: string
  createdAt: string
  updatedAt: string
  organization: { organizationName: string }
  _count: { applications: number }
}

export default function AdminJobsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [rows, setRows] = useState<JobRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    else if (status === 'authenticated' && session?.user.userType !== 'ADMIN') router.push('/dashboard')
  }, [status, session, router])

  const load = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/admin/job-posts', { cache: 'no-store' })
      if (!res.ok) {
        setError('Could not load job posts')
        setRows([])
        return
      }
      const data = await res.json()
      setRows(Array.isArray(data) ? data : [])
    } catch {
      setError('Network error')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated' && session?.user.userType === 'ADMIN') load()
  }, [status, session, load])

  if (loading || status === 'loading') {
    return (
      <AdminLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="spinner h-12 w-12 border-primary-600" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">All job posts</h1>
          <p className="mt-1 text-sm text-gray-600">
            Every listing on the platform, newest first. Open a job on the public site to verify how it appears.
          </p>
        </motion.div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Job
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Organization
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Applications
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Updated
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Link
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((j, i) => (
                  <motion.tr
                    key={j.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="hover:bg-gray-50/80"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{j.title}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span>{j.jobType.replace(/_/g, ' ')}</span>
                        {j.location ? (
                          <span className="inline-flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />
                            {j.location}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{j.organization.organizationName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          j.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {j.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{j._count.applications}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(j.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/jobs/${j.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-800"
                      >
                        View <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && !error && (
            <div className="py-16 text-center text-sm text-gray-500">No job posts yet.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
