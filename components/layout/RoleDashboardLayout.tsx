'use client'

import { useSession, signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  Building2,
  Landmark,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Search as SearchIcon,
  ClipboardList,
  PenLine,
} from 'lucide-react'

type Role = 'JOB_SEEKER' | 'COMPANY' | 'ORGANIZATION'

const roleTitle: Record<Role, string> = {
  JOB_SEEKER: 'Job seeker workspace',
  COMPANY: 'Company & contracts',
  ORGANIZATION: 'Employer workspace',
}

function navForRole(role: Role) {
  const common = [
    { href: '/dashboard/subscription', label: 'Subscription', icon: CreditCard },
    { href: '/dashboard/settings', label: 'Account & settings', icon: Settings },
  ]

  if (role === 'JOB_SEEKER') {
    return [
      { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/profile', label: 'Profile & resume', icon: User },
      { href: '/dashboard/career', label: 'Career & jobs', icon: Briefcase },
      { href: '/dashboard/applications', label: 'Applications', icon: FileText },
      { href: '/jobs', label: 'Browse jobs', icon: SearchIcon },
      ...common,
    ]
  }
  if (role === 'COMPANY') {
    return [
      { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/company-profile', label: 'Company profile', icon: Building2 },
      { href: '/dashboard/company/contracts', label: 'Contracts & clients', icon: ClipboardList },
      ...common,
    ]
  }
  return [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/organization-profile', label: 'Organization', icon: Landmark },
    { href: '/dashboard/job-posts', label: 'Job posts', icon: Briefcase },
    { href: '/dashboard/applications', label: 'Applicants', icon: PenLine },
    ...common,
  ]
}

export default function RoleDashboardLayout({
  children,
  title,
}: {
  children: React.ReactNode
  title?: string
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const role = session?.user.userType as Role | undefined
  const valid = role === 'JOB_SEEKER' || role === 'COMPANY' || role === 'ORGANIZATION'

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated' && session && !valid) {
      router.replace('/dashboard')
    }
  }, [status, session, valid, router])

  const items = useMemo(() => (valid ? navForRole(role!) : []), [valid, role])

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname?.startsWith(href + '/')
  }

  if (status === 'loading' || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (!valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 lg:hidden">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Dashboard</span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:flex">
        <div className="border-b border-gray-100 p-4 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-2 text-primary-700 dark:text-primary-400">
            <Home className="h-5 w-5" />
            <span className="text-sm font-semibold">Back to site</span>
          </Link>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-400">
            {roleTitle[role!]}
          </p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href, (item as { exact?: boolean }).exact)
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0 opacity-90" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-gray-100 p-3 dark:border-gray-800">
          <p className="truncate px-2 text-xs text-gray-500">{session.user.email}</p>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : -280 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed bottom-0 left-0 top-14 z-40 flex w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:hidden"
      >
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href, (item as { exact?: boolean }).exact)
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </motion.aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 hidden border-b border-gray-200 bg-white/90 px-8 py-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 lg:block">
          <div className="flex items-center justify-between gap-4">
            <div>
              {title ? (
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
              ) : null}
              <p className="text-xs text-gray-500 dark:text-gray-400">{session.user.email}</p>
            </div>
            <Link
              href="/"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              View public site
            </Link>
          </div>
        </header>
        <main className="px-4 pb-10 pt-20 lg:px-8 lg:pt-8">{children}</main>
      </div>
    </div>
  )
}
