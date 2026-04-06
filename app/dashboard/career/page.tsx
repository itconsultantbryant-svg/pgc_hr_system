'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import RoleDashboardLayout from '@/components/layout/RoleDashboardLayout'
import { motion } from 'framer-motion'
import { Briefcase, Building2, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'

interface Experience {
  id: string
  company: string
  position: string
  description?: string | null
  startDate: string
  endDate?: string | null
  isCurrent: boolean
}

interface Profile {
  currentJobTitle?: string | null
  location?: string | null
  availability?: string | null
  expectedSalary?: string | null
  experiences: Experience[]
}

export default function CareerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
    else if (status === 'authenticated' && session?.user.userType !== 'JOB_SEEKER') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status !== 'authenticated' || session?.user.userType !== 'JOB_SEEKER') return
    ;(async () => {
      try {
        const res = await fetch('/api/profiles/job-seeker')
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [status, session])

  const { current, past } = useMemo(() => {
    const ex = profile?.experiences || []
    return {
      current: ex.filter((e) => e.isCurrent),
      past: ex.filter((e) => !e.isCurrent),
    }
  }, [profile])

  if (loading || status === 'loading') {
    return (
      <RoleDashboardLayout title="Career and jobs">
        <div className="flex min-h-[40vh] items-center justify-center text-gray-500">Loading</div>
      </RoleDashboardLayout>
    )
  }

  return (
    <RoleDashboardLayout title="Career and jobs">
      <div className="mx-auto max-w-4xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-200 bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white shadow-lg dark:border-gray-700"
        >
          <p className="text-sm font-medium text-primary-100">Current focus</p>
          <h2 className="mt-1 text-2xl font-bold">
            {profile?.currentJobTitle?.trim() || 'Add a current role in your profile'}
          </h2>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-primary-100">
            {profile?.location ? (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </span>
            ) : null}
            {profile?.availability ? (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {profile.availability}
              </span>
            ) : null}
            {profile?.expectedSalary ? <span>Expectation: {profile.expectedSalary}</span> : null}
          </div>
          <Link
            href="/dashboard/profile"
            className="mt-6 inline-block rounded-lg bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/25"
          >
            Edit in profile
          </Link>
        </motion.div>

        <section>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <Briefcase className="h-5 w-5 text-primary-600" />
            Current positions
          </h3>
          {current.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-500 dark:border-gray-600">
              No role marked as current. In{' '}
              <Link href="/dashboard/profile" className="text-primary-600 hover:underline">
                Profile
              </Link>
              , mark an experience as current.
            </p>
          ) : (
            <div className="space-y-3">
              {current.map((e) => (
                <motion.div
                  key={e.id}
                  layout
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{e.position}</p>
                      <p className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Building2 className="h-3.5 w-3.5" />
                        {e.company}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      Current
                    </span>
                  </div>
                  {e.description ? (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{e.description}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(e.startDate).toLocaleDateString()}
                    {e.endDate ? ` – ${new Date(e.endDate).toLocaleDateString()}` : ' – Present'}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Previous roles</h3>
          {past.length === 0 ? (
            <p className="text-sm text-gray-500">No past roles yet. Add experience in your profile.</p>
          ) : (
            <div className="space-y-3">
              {past.map((e) => (
                <div
                  key={e.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
                >
                  <p className="font-medium text-gray-900 dark:text-gray-100">{e.position}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{e.company}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(e.startDate).toLocaleDateString()} –{' '}
                    {e.endDate ? new Date(e.endDate).toLocaleDateString() : '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/applications"
            className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-primary-700"
          >
            View applications
          </Link>
          <Link
            href="/jobs"
            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Browse open jobs
          </Link>
        </div>
      </div>
    </RoleDashboardLayout>
  )
}
