'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import RoleDashboardLayout from '@/components/layout/RoleDashboardLayout'
import { motion } from 'framer-motion'
import { Plus, Calendar, DollarSign, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface Offer {
  id: string
  title: string
  description: string
  budget: string | null
  duration: string | null
  requirements: string | null
  deadline: string | null
  isActive: boolean
  updatedAt: string
}

export default function CompanyContractsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: '',
    duration: '',
    requirements: '',
    deadline: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    else if (status === 'authenticated' && session?.user.userType !== 'COMPANY') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/company/contract-offers')
      if (res.ok) {
        const data = await res.json()
        setOffers(Array.isArray(data) ? data : [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated' && session?.user.userType === 'COMPANY') load()
  }, [status, session, load])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/company/contract-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to save')
        return
      }
      toast.success('Opportunity saved')
      setModal(false)
      setForm({ title: '', description: '', budget: '', duration: '', requirements: '', deadline: '' })
      load()
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <RoleDashboardLayout title="Contracts & clients">
        <div className="flex min-h-[40vh] items-center justify-center text-gray-500">Loading…</div>
      </RoleDashboardLayout>
    )
  }

  return (
    <RoleDashboardLayout title="Contracts & clients">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track contract opportunities you publish. Client relationships and performance notes live in your{' '}
              <a href="/dashboard/company-profile" className="text-primary-600 hover:underline">
                company profile
              </a>{' '}
              (current / previous clients, services).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            New opportunity
          </button>
        </div>

        <div className="grid gap-4">
          {offers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-600">
              No contract opportunities yet. Add one to showcase work you are pursuing.
            </p>
          ) : (
            offers.map((o, i) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{o.title}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      o.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {o.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">{o.description}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
                  {o.budget ? (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      {o.budget}
                    </span>
                  ) : null}
                  {o.duration ? (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {o.duration}
                    </span>
                  ) : null}
                  {o.deadline ? (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Due {new Date(o.deadline).toLocaleDateString()}
                    </span>
                  ) : null}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.form
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={submit}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">New opportunity</h3>
            <div className="mt-4 space-y-3">
              <input
                required
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
              />
              <textarea
                required
                placeholder="Description"
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
              />
              <input
                placeholder="Budget (optional)"
                value={form.budget}
                onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
              />
              <input
                placeholder="Duration (optional)"
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
              />
              <input
                placeholder="Requirements (optional)"
                value={form.requirements}
                onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
              />
              <input
                type="date"
                placeholder="Deadline"
                value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModal(false)}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </RoleDashboardLayout>
  )
}
