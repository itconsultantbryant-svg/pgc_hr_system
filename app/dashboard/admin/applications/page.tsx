'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import Link from 'next/link'
import { motion } from 'framer-motion'

type AppRow = {
  id: string
  status: string
  createdAt: string
  jobPost: {
    id: string
    title: string
    organization: { organizationName: string }
  }
  user: {
    id: string
    email: string
    jobSeekerProfile: { firstName: string; lastName: string } | null
  }
}

const filters = [
  { id: '', label: 'All' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'REVIEWED', label: 'Reviewed' },
  { id: 'ACCEPTED', label: 'Accepted' },
  { id: 'REJECTED', label: 'Rejected' },
]

export default function AdminApplicationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [filter, setFilter] = useState('')
  const [rows, setRows] = useState<AppRow[]>([])
  const [pageReady, setPageReady] = useState(false)
  const [tableBusy, setTableBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchedOnceRef = useRef(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    else if (status === 'authenticated' && session?.user.userType !== 'ADMIN') router.push('/dashboard')
  }, [status, session, router])

  const load = useCallback(async () => {
    try {
      setError(null)
      if (fetchedOnceRef.current) setTableBusy(true)
      const q = filter ? `?status=${encodeURIComponent(filter)}&take=200` : '?take=200'
      const res = await fetch(`/api/admin/applications-list${q}`, { cache: 'no-store' })
      if (!res.ok) {
        setError('Could not load applications')
        setRows([])
        return
      }
      const data = await res.json()
      setRows(Array.isArray(data) ? data : [])
    } catch {
      setError('Network error')
      setRows([])
    } finally {
      fetchedOnceRef.current = true
      setPageReady(true)
      setTableBusy(false)
    }
  }, [filter])

  useEffect(() => {
    if (status === 'authenticated' && session?.user.userType === 'ADMIN') {
      void load()
    }
  }, [status, session, load])

  const statusStyle = (s: string) => {
    switch (s) {
      case 'ACCEPTED':
        return 'bg-emerald-100 text-emerald-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-amber-100 text-amber-800'
    }
  }

  if (status === 'loading' || (status === 'authenticated' && session?.user.userType === 'ADMIN' && !pageReady)) {
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">All applications</h1>
          <p className="mt-1 text-sm text-gray-600">
            Cross-organizational view. Employers still manage decisions from their dashboard.
          </p>
        </motion.div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id || 'all'}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                filter === f.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {tableBusy ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
              <div className="spinner h-10 w-10 border-primary-600" />
            </div>
          ) : null}
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y divide-gray-200 ${tableBusy ? 'opacity-60' : ''}`}>
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Candidate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Job
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Employer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Applied
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((a, i) => {
                  const name = a.user.jobSeekerProfile
                    ? `${a.user.jobSeekerProfile.firstName} ${a.user.jobSeekerProfile.lastName}`
                    : '—'
                  return (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.015, 0.25) }}
                      className="hover:bg-gray-50/80"
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{name}</div>
                        <div className="text-xs text-gray-500">{a.user.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/jobs/${a.jobPost.id}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-800"
                        >
                          {a.jobPost.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {a.jobPost.organization.organizationName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyle(a.status)}`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(a.createdAt).toLocaleString()}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && !error && (
            <div className="py-16 text-center text-sm text-gray-500">No applications in this view.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
