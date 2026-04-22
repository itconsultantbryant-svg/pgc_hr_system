'use client'

import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Mail,
  Shield,
  Calendar,
  CreditCard,
  Briefcase,
  Building2,
  Landmark,
} from 'lucide-react'
import toast from 'react-hot-toast'

type AdminUserDetail = {
  id: string
  email: string
  userType: string
  isActive: boolean
  isSuspended: boolean
  createdAt: string
  jobSeekerProfile: { id: string; headline?: string | null } | null
  companyProfile: { id: string; companyName?: string | null } | null
  organizationProfile: { id: string; organizationName?: string | null } | null
  subscriptions: Array<{
    id: string
    status: string
    type: string
    payments: Array<{ id: string; amount: number; status: string; createdAt: string }>
  }>
}

export default function AdminUserDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''
  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [resettingPassword, setResettingPassword] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    else if (status === 'authenticated' && session?.user.userType !== 'ADMIN') router.push('/dashboard')
  }, [status, session, router])

  useEffect(() => {
    if (!id || status !== 'authenticated' || session?.user.userType !== 'ADMIN') return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/admin/users/${id}`, { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) {
          if (!cancelled) setError(data.error || 'Could not load user')
          setUser(null)
          return
        }
        if (!cancelled) setUser(data)
      } catch {
        if (!cancelled) setError('Network error')
        setUser(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, status, session?.user.userType])

  if (loading || status === 'loading') {
    return (
      <AdminLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="spinner mx-auto mb-4 h-12 w-12 border-primary-600"></div>
            <p className="text-gray-600">Loading profile…</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !user) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p className="font-medium">{error || 'User not found'}</p>
          <Link
            href="/dashboard/admin/users"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to users
          </Link>
        </div>
      </AdminLayout>
    )
  }

  const profileLabel =
    user.jobSeekerProfile?.headline ||
    user.companyProfile?.companyName ||
    user.organizationProfile?.organizationName ||
    'No profile title'

  const handleAdminPasswordReset = async () => {
    if (!user) return
    const proceed = window.confirm(
      `Reset password for ${user.email}? A temporary password will be generated.`
    )
    if (!proceed) return

    try {
      setResettingPassword(true)
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetPassword: true }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      const temp = data.temporaryPassword as string | undefined
      if (temp) {
        window.prompt(
          'Temporary password generated. Copy and share securely with the user:',
          temp
        )
      }
      toast.success('Password reset completed')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to reset password')
    } finally {
      setResettingPassword(false)
    }
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl space-y-8">
        <Link
          href="/dashboard/admin/users"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 transition hover:text-primary-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Users
        </Link>

        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
              {user.userType}
            </span>
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
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">{user.email}</h1>
          <p className="text-gray-600">{profileLabel}</p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleAdminPasswordReset}
              disabled={resettingPassword}
              className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-yellow-400 disabled:opacity-60"
            >
              {resettingPassword ? 'Resetting password...' : 'Reset user password'}
            </button>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Mail className="h-4 w-4 text-primary-600" />
              Account
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">User ID</dt>
                <dd className="font-mono text-xs text-gray-800">{user.id}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Joined</dt>
                <dd className="text-gray-900">
                  {new Date(user.createdAt).toLocaleString(undefined, {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </dd>
              </div>
            </dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Shield className="h-4 w-4 text-primary-600" />
              Profiles
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Briefcase className="mt-0.5 h-4 w-4 text-gray-400" />
                <span>
                  Job seeker:{' '}
                  {user.jobSeekerProfile ? (
                    <span className="text-gray-900">Yes</span>
                  ) : (
                    <span className="text-gray-500">None</span>
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Building2 className="mt-0.5 h-4 w-4 text-gray-400" />
                <span>
                  Company:{' '}
                  {user.companyProfile ? (
                    <span className="text-gray-900">{user.companyProfile.companyName || '—'}</span>
                  ) : (
                    <span className="text-gray-500">None</span>
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Landmark className="mt-0.5 h-4 w-4 text-gray-400" />
                <span>
                  Organization:{' '}
                  {user.organizationProfile ? (
                    <span className="text-gray-900">{
                      user.organizationProfile.organizationName || '—'
                    }</span>
                  ) : (
                    <span className="text-gray-500">None</span>
                  )}
                </span>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <CreditCard className="h-4 w-4 text-primary-600" />
            Subscriptions & payments
          </div>
          {user.subscriptions.length === 0 ? (
            <p className="text-sm text-gray-500">No subscriptions yet.</p>
          ) : (
            <div className="space-y-4">
              {user.subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-xl border border-gray-100 bg-gray-50/80 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium text-gray-900">{sub.type}</div>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-700 shadow-sm">
                      {sub.status}
                    </span>
                  </div>
                  {sub.payments.length > 0 ? (
                    <ul className="mt-3 space-y-2 border-t border-gray-200 pt-3 text-sm">
                      {sub.payments.map((p) => (
                        <li key={p.id} className="flex flex-wrap justify-between gap-2">
                          <span className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                          <span className="font-medium text-gray-900">${p.amount}</span>
                          <span className="text-xs text-gray-500">{p.status}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-gray-500">No payment records.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  )
}
