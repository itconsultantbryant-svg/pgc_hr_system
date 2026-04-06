'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import {
  Check,
  X,
  RefreshCw,
  Sparkles,
  DollarSign,
  Clock,
  Ban,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

interface Payment {
  id: string
  amount: number
  status: string
  paymentMethod: string | null
  transactionId: string | null
  createdAt: string
  user: {
    id: string
    email: string
    userType: string
  }
  subscription: {
    id: string
    type: string
  }
}

const filterTabs: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'REJECTED', label: 'Rejected' },
]

export default function AdminPaymentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const url = filter !== 'all' ? `/api/admin/payments?status=${filter}` : '/api/admin/payments'
      const response = await fetch(url, { cache: 'no-store' })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        setFetchError(err.error || `Failed to load payments (${response.status})`)
        setPayments([])
        return
      }
      const data = await response.json()
      setPayments(Array.isArray(data) ? data : [])
    } catch {
      setFetchError('Network error while loading payments.')
      setPayments([])
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
    fetchPayments()
  }, [status, session?.user.userType, fetchPayments])

  const stats = useMemo(() => {
    const pending = payments.filter((p) => p.status === 'PENDING').length
    const approved = payments.filter((p) => p.status === 'APPROVED').length
    const rejected = payments.filter((p) => p.status === 'REJECTED').length
    const volume = payments.reduce((a, p) => a + (p.status === 'APPROVED' ? p.amount : 0), 0)
    return { pending, approved, rejected, volume }
  }, [payments])

  const handleApprove = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      })

      if (response.ok) {
        toast.success('Payment approved successfully!')
        await fetchPayments()
      } else {
        toast.error('Failed to approve payment')
      }
    } catch {
      toast.error('An error occurred')
    }
  }

  const handleReject = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      })

      if (response.ok) {
        toast.success('Payment rejected')
        await fetchPayments()
      } else {
        toast.error('Failed to reject payment')
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
            <p className="text-gray-600">Loading payments…</p>
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
              Billing
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Payments</h1>
            <p className="text-gray-600 max-w-2xl">
              Review subscription payments. Pending items need approval before access is granted.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchPayments()}
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
            { label: 'Pending', value: stats.pending, icon: Clock },
            { label: 'Approved', value: stats.approved, icon: Check },
            { label: 'Rejected', value: stats.rejected, icon: Ban },
            { label: 'Approved volume', value: `$${stats.volume.toFixed(2)}`, icon: DollarSign },
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
              <div className="mt-2 text-xl font-semibold text-gray-900">{s.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`relative rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                filter === tab.id ? 'text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {filter === tab.id && (
                <motion.span
                  layoutId="paymentFilterPill"
                  className="absolute inset-0 rounded-xl bg-primary-600 shadow-md"
                  transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
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
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Package
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <motion.tr
                    key={payment.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-primary-50/40 transition-colors"
                  >
                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{payment.user.email}</div>
                      <div className="text-xs text-gray-500">{payment.user.userType}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-gray-900">
                      ${payment.amount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      {payment.subscription.type}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          payment.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : payment.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right">
                      {payment.status === 'PENDING' ? (
                        <div className="inline-flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(payment.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(payment.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {payments.length === 0 && (
            <div className="py-16 text-center text-sm text-gray-500">No payments in this view.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
