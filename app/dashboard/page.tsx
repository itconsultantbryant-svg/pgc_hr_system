'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Layout from '@/components/layout/Layout'
import RoleDashboardLayout from '@/components/layout/RoleDashboardLayout'
import Link from 'next/link'
import {
  User,
  Building2,
  Briefcase,
  FileText,
  CreditCard,
  Settings,
  Shield,
  ClipboardList,
  TrendingUp,
  Send,
  Landmark,
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [seeker, setSeeker] = useState<{
    applications: number
    pending: number
    profilePct: number
  } | null>(null)
  const [company, setCompany] = useState<{ contracts: number; companyName: string } | null>(null)
  const [org, setOrg] = useState<{
    openJobs: number
    pendingApps: number
    orgName: string
  } | null>(null)

  const loadSeeker = useCallback(async () => {
    try {
      const [appRes, profRes] = await Promise.all([
        fetch('/api/applications', { cache: 'no-store' }),
        fetch('/api/profiles/job-seeker', { cache: 'no-store' }),
      ])
      let applications = 0
      let pending = 0
      if (appRes.ok) {
        const apps = await appRes.json()
        applications = Array.isArray(apps) ? apps.length : 0
        pending = Array.isArray(apps) ? apps.filter((a: { status: string }) => a.status === 'PENDING').length : 0
      }
      let profilePct = 0
      if (profRes.ok) {
        const p = await profRes.json()
        if (p) {
          const fields = [
            p.firstName,
            p.lastName,
            p.bio,
            p.location,
            p.currentJobTitle,
            p.profilePicture,
          ].filter(Boolean).length
          const hasExp = (p.experiences?.length || 0) > 0
          profilePct = Math.min(100, Math.round(((fields + (hasExp ? 2 : 0)) / 8) * 100))
        }
      }
      setSeeker({ applications, pending, profilePct })
    } catch {
      setSeeker({ applications: 0, pending: 0, profilePct: 0 })
    }
  }, [])

  const loadCompany = useCallback(async () => {
    try {
      const [profRes, coRes] = await Promise.all([
        fetch('/api/profiles/company', { cache: 'no-store' }),
        fetch('/api/company/contract-offers', { cache: 'no-store' }),
      ])
      const prof = profRes.ok ? await profRes.json() : null
      const offers = coRes.ok ? await coRes.json() : []
      setCompany({
        contracts: Array.isArray(offers) ? offers.length : 0,
        companyName: prof?.companyName || 'Your company',
      })
    } catch {
      setCompany({ contracts: 0, companyName: 'Your company' })
    }
  }, [])

  const loadOrg = useCallback(async () => {
    try {
      const [jobsRes, appRes, profRes] = await Promise.all([
        fetch('/api/jobs?organizationId=current', { cache: 'no-store' }),
        fetch('/api/applications', { cache: 'no-store' }),
        fetch('/api/profiles/organization', { cache: 'no-store' }),
      ])
      const jobs = jobsRes.ok ? await jobsRes.json() : []
      const apps = appRes.ok ? await appRes.json() : []
      const prof = profRes.ok ? await profRes.json() : null
      const openJobs = Array.isArray(jobs) ? jobs.filter((j: { isActive: boolean }) => j.isActive).length : 0
      const pendingApps = Array.isArray(apps)
        ? apps.filter((a: { status: string }) => a.status === 'PENDING').length
        : 0
      const fromJob = Array.isArray(jobs) && jobs[0]?.organization?.organizationName
      setOrg({
        openJobs,
        pendingApps,
        orgName: prof?.organizationName || fromJob || 'Your organization',
      })
    } catch {
      setOrg({ openJobs: 0, pendingApps: 0, orgName: 'Your organization' })
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.userType === 'ADMIN') {
      router.replace('/dashboard/admin')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status !== 'authenticated' || !session) return
    if (session.user.userType === 'JOB_SEEKER') loadSeeker()
    if (session.user.userType === 'COMPANY') loadCompany()
    if (session.user.userType === 'ORGANIZATION') loadOrg()
  }, [status, session, loadSeeker, loadCompany, loadOrg])

  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg text-gray-700 dark:text-gray-300">Loading...</div>
        </div>
      </Layout>
    )
  }

  if (!session) return null

  const userType = session.user.userType

  if (userType === 'ADMIN') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Administrator access</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:col-span-2 lg:col-span-3"
            >
              <Link
                href="/dashboard/admin"
                className="group block rounded-xl border border-primary-300 bg-gradient-to-r from-primary-600 to-primary-800 p-8 text-white shadow-soft hover-lift"
              >
                <div className="mb-4 flex items-center space-x-4">
                  <div className="rounded-lg bg-white/20 p-4 transition-colors group-hover:bg-white/30">
                    <Shield className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="mb-1 text-2xl font-bold">Admin dashboard</h2>
                    <p className="text-primary-100">Live metrics, users, payments, jobs, and applications</p>
                  </div>
                </div>
                <p className="mt-2 text-primary-100">Open the full admin workspace</p>
              </Link>
            </motion.div>
          </div>
        </div>
      </Layout>
    )
  }

  if (userType === 'JOB_SEEKER') {
    return (
      <RoleDashboardLayout title="Overview">
        <div className="mx-auto max-w-5xl space-y-8">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your profile, track applications, and keep your work history up to date.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm dark:border-yellow-900/30 dark:bg-gray-900"
            >
              <FileText className="h-5 w-5 text-primary-600" />
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{seeker?.applications ?? '—'}</p>
              <p className="text-xs text-gray-500">Total applications</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm dark:border-yellow-900/30 dark:bg-gray-900"
            >
              <Send className="h-5 w-5 text-amber-600" />
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{seeker?.pending ?? '—'}</p>
              <p className="text-xs text-gray-500">Awaiting employer review</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm dark:border-yellow-900/30 dark:bg-gray-900"
            >
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                {seeker != null ? `${seeker.profilePct}%` : '—'}
              </p>
              <p className="text-xs text-gray-500">Profile strength</p>
            </motion.div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-4 rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm transition hover:border-yellow-300 hover:shadow-md dark:border-yellow-900/30 dark:bg-gray-900"
            >
              <div className="rounded-xl bg-primary-50 p-3 dark:bg-primary-900/30">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Profile and resume</h3>
                <p className="text-sm text-gray-500">Contact, bio, skills, experience, education</p>
              </div>
            </Link>
            <Link
              href="/dashboard/career"
              className="flex items-center gap-4 rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm transition hover:border-yellow-300 hover:shadow-md dark:border-yellow-900/30 dark:bg-gray-900"
            >
              <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-900/30">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Career and jobs</h3>
                <p className="text-sm text-gray-500">Current role, past jobs, browse openings</p>
              </div>
            </Link>
            <Link
              href="/dashboard/applications"
              className="flex items-center gap-4 rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm transition hover:border-yellow-300 hover:shadow-md dark:border-yellow-900/30 dark:bg-gray-900"
            >
              <div className="rounded-xl bg-green-50 p-3 dark:bg-green-900/30">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Applications</h3>
                <p className="text-sm text-gray-500">Status of every job you applied to</p>
              </div>
            </Link>
            <Link
              href="/dashboard/subscription"
              className="flex items-center gap-4 rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm transition hover:border-yellow-300 hover:shadow-md dark:border-yellow-900/30 dark:bg-gray-900"
            >
              <div className="rounded-xl bg-yellow-50 p-3 dark:bg-yellow-900/30">
                <CreditCard className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Subscription</h3>
                <p className="text-sm text-gray-500">Package and payments</p>
              </div>
            </Link>
          </div>
        </div>
      </RoleDashboardLayout>
    )
  }

  if (userType === 'COMPANY') {
    return (
      <RoleDashboardLayout title="Overview">
        <div className="mx-auto max-w-5xl space-y-8">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-800 dark:text-gray-200">{company?.companyName}</span> — showcase
            services, manage contract opportunities, and keep client notes in your profile.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm dark:border-yellow-900/30 dark:bg-gray-900"
            >
              <ClipboardList className="h-5 w-5 text-primary-600" />
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{company?.contracts ?? '—'}</p>
              <p className="text-xs text-gray-500">Contract opportunities listed</p>
            </motion.div>
            <Link
              href="/dashboard/company-profile"
              className="flex items-center justify-center rounded-2xl border border-dashed border-primary-300 bg-primary-50/50 p-5 text-sm font-medium text-primary-800 hover:bg-primary-50 dark:border-primary-800 dark:bg-primary-950/30 dark:text-primary-200"
            >
              Edit company profile and client details
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/dashboard/company-profile"
              className="flex items-center gap-4 rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm dark:border-yellow-900/30 dark:bg-gray-900"
            >
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Company profile</h3>
                <p className="text-sm text-gray-500">Services, clients, executives</p>
              </div>
            </Link>
            <Link
              href="/dashboard/company/contracts"
              className="flex items-center gap-4 rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm dark:border-yellow-900/30 dark:bg-gray-900"
            >
              <Briefcase className="h-8 w-8 text-orange-600" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Contracts and pipeline</h3>
                <p className="text-sm text-gray-500">Opportunities you are pursuing</p>
              </div>
            </Link>
          </div>
        </div>
      </RoleDashboardLayout>
    )
  }

  if (userType === 'ORGANIZATION') {
    return (
      <RoleDashboardLayout title="Overview">
        <div className="mx-auto max-w-5xl space-y-8">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-800 dark:text-gray-200">{org?.orgName}</span> — post roles,
            review applicants, and keep your organization profile current.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm dark:border-yellow-900/30 dark:bg-gray-900"
            >
              <Briefcase className="h-5 w-5 text-primary-600" />
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{org?.openJobs ?? '—'}</p>
              <p className="text-xs text-gray-500">Active job posts</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm dark:border-yellow-900/30 dark:bg-gray-900"
            >
              <FileText className="h-5 w-5 text-amber-600" />
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{org?.pendingApps ?? '—'}</p>
              <p className="text-xs text-gray-500">Applications to review</p>
            </motion.div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/dashboard/job-posts"
              className="flex items-center gap-4 rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm dark:border-yellow-900/30 dark:bg-gray-900"
            >
              <Briefcase className="h-8 w-8 text-orange-600" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Job posts</h3>
                <p className="text-sm text-gray-500">Create and manage listings</p>
              </div>
            </Link>
            <Link
              href="/dashboard/applications"
              className="flex items-center gap-4 rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm dark:border-yellow-900/30 dark:bg-gray-900"
            >
              <FileText className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Applicants</h3>
                <p className="text-sm text-gray-500">Review every submission</p>
              </div>
            </Link>
            <Link
              href="/dashboard/organization-profile"
              className="flex items-center gap-4 rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm dark:border-yellow-900/30 dark:bg-gray-900"
            >
              <Landmark className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Organization profile</h3>
                <p className="text-sm text-gray-500">Branding and contact</p>
              </div>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-4 rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm dark:border-yellow-900/30 dark:bg-gray-900"
            >
              <Settings className="h-8 w-8 text-gray-600" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Account settings</h3>
                <p className="text-sm text-gray-500">Security and preferences</p>
              </div>
            </Link>
          </div>
        </div>
      </RoleDashboardLayout>
    )
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link href="/dashboard/settings" className="text-primary-600">
          Settings
        </Link>
      </div>
    </Layout>
  )
}
