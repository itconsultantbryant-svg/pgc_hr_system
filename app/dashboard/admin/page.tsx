'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  Briefcase,
  Building2,
  CreditCard,
  FileText,
  RefreshCw,
  Sparkles,
  Users,
} from 'lucide-react'

type Stats = {
  jobSeekers: number
  companies: number
  jobOpenings: number
  successRate: number
  totalApplications?: number
  acceptedApplications?: number
}

type Payment = {
  id: string
  amount: number
  status: string
  createdAt: string
  user: { email: string }
  subscription: { type: string }
}

type AdminOverview = {
  generatedAt: string
  users: { total: number; jobSeekers: number; companies: number; organizations: number }
  pendingPayments: number
  activeJobs: number
  applications: { total: number; last24h: number }
  recentApplications: Array<{
    id: string
    status: string
    createdAt: string
    jobPost: { title: string }
    user: { email: string }
  }>
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  href,
}: {
  title: string
  value: string
  icon: any
  trend?: string
  href?: string
}) {
  const inner = (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl border border-yellow-100 shadow-sm hover:shadow-md transition-shadow p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm text-gray-500">{title}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">{value}</div>
          {trend ? <div className="mt-2 text-xs text-gray-500">{trend}</div> : null}
        </div>
        <div className="w-11 h-11 rounded-2xl bg-yellow-100 text-yellow-700 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  )

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  )
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([])
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (status === 'authenticated' && session?.user.userType !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [status, session, router])

  const loadDashboard = useCallback(async (silent: boolean) => {
    if (status !== 'authenticated' || session?.user.userType !== 'ADMIN') return
    if (silent) setRefreshing(true)
    else {
      setLoading(true)
      setError(null)
    }
    try {
      const [statsRes, paymentsRes, overviewRes] = await Promise.all([
        fetch('/api/stats', { cache: 'no-store' }),
        fetch('/api/admin/payments?status=PENDING', { cache: 'no-store' }),
        fetch('/api/admin/overview', { cache: 'no-store' }),
      ])

      const statsJson = await statsRes.json()
      if (statsRes.ok && !statsJson.error) {
        setStats(statsJson)
      } else {
        setStats({
          jobSeekers: 0,
          companies: 0,
          jobOpenings: 0,
          successRate: 0,
          totalApplications: 0,
          acceptedApplications: 0,
        })
        if (!silent) setError('Some statistics could not be loaded.')
      }

      if (paymentsRes.ok) {
        const paymentsJson = await paymentsRes.json()
        setPendingPayments(Array.isArray(paymentsJson) ? paymentsJson.slice(0, 5) : [])
      } else {
        setPendingPayments([])
      }

      if (overviewRes.ok) {
        const ov = await overviewRes.json()
        if (ov && !ov.error) setOverview(ov as AdminOverview)
        else setOverview(null)
      } else {
        setOverview(null)
      }
    } catch {
      if (!silent) setError('Failed to load admin insights. Check your database connection and try again.')
    } finally {
      if (silent) setRefreshing(false)
      else setLoading(false)
    }
  }, [status, session?.user.userType])

  useEffect(() => {
    if (status !== 'authenticated' || session?.user.userType !== 'ADMIN') return
    let cancelled = false
    const run = async () => {
      if (cancelled) return
      await loadDashboard(false)
    }
    run()
    const interval = setInterval(() => {
      if (!cancelled) void loadDashboard(true)
    }, 28000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [status, session?.user.userType, loadDashboard])

  const cards = useMemo(() => {
    const s = stats || { jobSeekers: 0, companies: 0, jobOpenings: 0, successRate: 0 }
    return [
      {
        title: 'Active job seekers',
        value: String(s.jobSeekers ?? 0),
        icon: Users,
        href: '/dashboard/admin/users',
      },
      {
        title: 'Active companies',
        value: String(s.companies ?? 0),
        icon: Building2,
        href: '/dashboard/admin/users',
      },
      {
        title: 'Live job postings',
        value: String(overview?.activeJobs ?? s.jobOpenings ?? 0),
        icon: Briefcase,
        href: '/dashboard/admin/jobs',
      },
      {
        title: 'Placement success rate',
        value: `${String(s.successRate ?? 0)}%`,
        icon: Activity,
        trend:
          typeof s.totalApplications === 'number'
            ? `${s.acceptedApplications ?? 0} accepted out of ${s.totalApplications} applications`
            : undefined,
      },
    ]
  }, [stats, overview?.activeJobs])

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="spinner w-12 h-12 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">
            <Sparkles className="h-4 w-4" />
            Admin overview
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Monitor platform health, review pending actions, and manage users, payments, and content.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              {overview?.generatedAt ? (
                <span className="tabular-nums">
                  Updated {new Date(overview.generatedAt).toLocaleTimeString()}
                </span>
              ) : null}
              <button
                type="button"
                disabled={refreshing}
                onClick={() => void loadDashboard(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-yellow-200 bg-white px-3 py-2 font-medium text-gray-800 shadow-sm hover:bg-yellow-50 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {overview ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7"
          >
            {[
              { label: 'Users', value: overview.users.total },
              { label: 'Seekers', value: overview.users.jobSeekers },
              { label: 'Companies', value: overview.users.companies },
              { label: 'Employers', value: overview.users.organizations },
              { label: 'Active jobs', value: overview.activeJobs },
              { label: 'Apps (24h)', value: overview.applications.last24h },
              { label: 'Pending pay', value: overview.pendingPayments },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-2xl border border-yellow-100 bg-white px-3 py-3 text-center shadow-sm sm:px-4"
              >
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{m.label}</div>
                <div className="mt-1 text-xl font-semibold tabular-nums text-gray-900">{m.value}</div>
              </div>
            ))}
          </motion.div>
        ) : null}

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-sm">{error}</div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c, idx) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <StatCard {...c} />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {overview && overview.recentApplications.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-3 bg-white rounded-2xl border border-yellow-100 shadow-sm overflow-hidden"
            >
              <div className="p-5 border-b border-yellow-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-yellow-700" />
                  <div className="font-semibold text-gray-900">Recent applications</div>
                </div>
                <Link
                  href="/dashboard/admin/applications"
                  className="text-sm text-yellow-700 hover:text-yellow-800 inline-flex items-center gap-1"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {overview.recentApplications.map((a) => (
                  <div key={a.id} className="p-4 flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">{a.jobPost.title}</div>
                      <div className="text-sm text-gray-500 truncate">{a.user.email}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-semibold uppercase text-gray-500">{a.status}</span>
                      <span className="text-xs text-gray-500 tabular-nums">
                        {new Date(a.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl border border-yellow-100 shadow-sm overflow-hidden"
          >
            <div className="p-5 border-b border-yellow-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-yellow-700" />
                <div className="font-semibold text-gray-900">Pending payments</div>
              </div>
              <Link href="/dashboard/admin/payments" className="text-sm text-yellow-700 hover:text-yellow-800 inline-flex items-center gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y">
              {pendingPayments.length === 0 ? (
                <div className="p-6 text-sm text-gray-600">No pending payments right now.</div>
              ) : (
                pendingPayments.map((p) => (
                  <div key={p.id} className="p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">{p.user?.email ?? 'Unknown user'}</div>
                      <div className="text-sm text-gray-500">
                        {p.subscription?.type ?? 'Subscription'} · {new Date(p.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-sm font-semibold text-gray-900">${p.amount}</div>
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">PENDING</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-yellow-100 shadow-sm p-5 space-y-4"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-yellow-700" />
              <div className="font-semibold text-gray-900">Quick actions</div>
            </div>
            <div className="space-y-2">
              <Link
                href="/dashboard/admin/users"
                className="flex items-center justify-between p-3 rounded-xl border border-yellow-100 hover:border-yellow-200 hover:bg-yellow-50/60 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900">Review users</div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
              <Link
                href="/dashboard/admin/jobs"
                className="flex items-center justify-between p-3 rounded-xl border border-yellow-100 hover:border-yellow-200 hover:bg-yellow-50/60 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900">All job posts</div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
              <Link
                href="/dashboard/admin/applications"
                className="flex items-center justify-between p-3 rounded-xl border border-yellow-100 hover:border-yellow-200 hover:bg-yellow-50/60 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900">All applications</div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
              <Link
                href="/dashboard/admin/payments"
                className="flex items-center justify-between p-3 rounded-xl border border-yellow-100 hover:border-yellow-200 hover:bg-yellow-50/60 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900">Approve payments</div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
              <Link
                href="/dashboard/admin/content"
                className="flex items-center justify-between p-3 rounded-xl border border-yellow-100 hover:border-yellow-200 hover:bg-yellow-50/60 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900">Update content</div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  )
}

