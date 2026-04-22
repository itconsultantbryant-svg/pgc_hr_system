'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import { Activity, RefreshCw, Search } from 'lucide-react'

type ActivityLog = {
  id: string
  userId: string | null
  action: string
  entityType: string | null
  entityId: string | null
  details: string | null
  createdAt: string
}

export default function AdminActivityLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    else if (status === 'authenticated' && session?.user.userType !== 'ADMIN') router.push('/dashboard')
  }, [status, session, router])

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/activity-logs?limit=200', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch activity logs')
      }
      setLogs(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch activity logs')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && session?.user.userType === 'ADMIN') {
      void fetchLogs()
    }
  }, [status, session?.user.userType])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return logs
    return logs.filter((log) => {
      const merged = [
        log.action,
        log.entityType || '',
        log.entityId || '',
        log.userId || '',
        log.details || '',
      ]
        .join(' ')
        .toLowerCase()
      return merged.includes(q)
    })
  }, [logs, query])

  if (loading || status === 'loading') {
    return (
      <AdminLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="spinner mx-auto mb-4 h-12 w-12 border-primary-600"></div>
            <p className="text-gray-600">Loading activity logs...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Activity logs</h1>
            <p className="text-gray-600">Track admin actions like payment approvals and password resets.</p>
          </div>
          <button
            type="button"
            onClick={() => void fetchLogs()}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search logs..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary-400 focus:bg-white"
            />
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 text-sm">{error}</div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Target</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Admin User ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-primary-50/40 transition-colors">
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
                        <Activity className="h-3.5 w-3.5" />
                        {log.action}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      {[log.entityType, log.entityId].filter(Boolean).join(' · ') || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs font-mono text-gray-600">
                      {log.userId || '—'}
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-600 max-w-lg">
                      <pre className="whitespace-pre-wrap break-words font-mono">{log.details || '—'}</pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-500">No activity logs found.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
