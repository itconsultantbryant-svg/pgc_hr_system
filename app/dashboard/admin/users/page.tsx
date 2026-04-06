'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import {
  Users,
  UserX,
  Check,
  Eye,
  Trash2,
  Search,
  RefreshCw,
  Shield,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface User {
  id: string
  email: string
  userType: string
  isActive: boolean
  isSuspended: boolean
  createdAt: string
  jobSeekerProfile: unknown
  companyProfile: unknown
  organizationProfile: unknown
}

const filterTabs: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'suspended', label: 'Suspended' },
]

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const url = filter !== 'all' ? `/api/admin/users?status=${filter}` : '/api/admin/users'
      const response = await fetch(url, { cache: 'no-store' })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        setFetchError(err.error || `Failed to load users (${response.status})`)
        setUsers([])
        return
      }
      const data = await response.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch {
      setFetchError('Network error while loading users.')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user.userType !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status !== 'authenticated' || session?.user.userType !== 'ADMIN') return
    fetchUsers()
  }, [status, session?.user.userType, fetchUsers])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.userType.toLowerCase().includes(q)
    )
  }, [users, query])

  const stats = useMemo(() => {
    const total = users.length
    const active = users.filter((u) => u.isActive && !u.isSuspended).length
    const suspended = users.filter((u) => u.isSuspended).length
    const admins = users.filter((u) => u.userType === 'ADMIN').length
    return { total, active, suspended, admins }
  }, [users])

  const handleSuspend = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSuspended: true, isActive: false }),
      })

      if (response.ok) {
        toast.success('User suspended')
        await fetchUsers()
      } else {
        toast.error('Failed to suspend user')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  const handleActivate = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSuspended: false, isActive: true }),
      })

      if (response.ok) {
        toast.success('User activated')
        await fetchUsers()
      } else {
        toast.error('Failed to activate user')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('User deleted')
        await fetchUsers()
      } else {
        toast.error('Failed to delete user')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  if (loading || status === 'loading') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="spinner w-12 h-12 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users…</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm">
              <Sparkles className="h-4 w-4" />
              Directory
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Users</h1>
            <p className="text-gray-600 max-w-2xl">
              Search, filter, and manage accounts. Suspended users cannot sign in; inactive accounts are blocked.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchUsers()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </motion.div>

        {fetchError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {fetchError}
          </div>
        ) : null}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total', value: stats.total, icon: Users },
            { label: 'Active', value: stats.active, icon: CheckCircle2 },
            { label: 'Suspended', value: stats.suspended, icon: UserX },
            { label: 'Admins', value: stats.admins, icon: Shield },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{s.label}</span>
                <s.icon className="h-4 w-4 text-primary-600" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{s.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`relative rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    filter === tab.id
                      ? 'text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {filter === tab.id && (
                    <motion.span
                      layoutId="userFilterPill"
                      className="absolute inset-0 rounded-xl bg-primary-600 shadow-md"
                      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by email or role…"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                  {filtered.map((user) => (
                    <motion.tr
                      key={user.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-primary-50/40 transition-colors"
                    >
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                          {user.userType}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            user.isSuspended
                              ? 'bg-red-100 text-red-800'
                              : user.isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.isSuspended ? 'Suspended' : user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm">
                        <div className="inline-flex items-center justify-end gap-1">
                          <Link
                            href={`/dashboard/admin/users/${user.id}`}
                            className="rounded-lg p-2 text-primary-600 transition hover:bg-primary-50"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {user.isSuspended ? (
                            <button
                              type="button"
                              onClick={() => handleActivate(user.id)}
                              className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                              title="Activate"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSuspend(user.id)}
                              className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50"
                              title="Suspend"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(user.id)}
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-sm text-gray-500">
              No users match your filters.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
