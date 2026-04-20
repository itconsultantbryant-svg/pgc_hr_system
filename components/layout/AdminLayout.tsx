'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Users, 
  CreditCard, 
  FileText, 
  LayoutDashboard,
  Search,
  Bell,
  ChevronRight,
  Settings, 
  LogOut, 
  Menu, 
  X,
  Shield,
  Home,
  Briefcase,
  ClipboardList,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user.userType !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/admin', exact: true },
    { icon: Users, label: 'Users', href: '/dashboard/admin/users' },
    { icon: CreditCard, label: 'Payments', href: '/dashboard/admin/payments' },
    { icon: Briefcase, label: 'All job posts', href: '/dashboard/admin/jobs' },
    { icon: ClipboardList, label: 'All applications', href: '/dashboard/admin/applications' },
    { icon: FileText, label: 'Content', href: '/dashboard/admin/content' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ]

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner w-8 h-8 border-primary-600"></div>
      </div>
    )
  }

  const crumbs = (() => {
    const parts = (pathname || '').split('?')[0].split('#')[0].split('/').filter(Boolean)
    const dashIndex = parts.indexOf('dashboard')
    const adminIndex = parts.indexOf('admin')
    const afterAdmin = adminIndex >= 0 ? parts.slice(adminIndex + 1) : []
    const labelize = (s: string) =>
      s
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
    const base = [{ label: 'Admin', href: '/dashboard/admin' }]
    const rest = afterAdmin
      .filter((p) => p !== 'dashboard')
      .map((p, idx) => ({
        label: labelize(p),
        href: '/dashboard/admin/' + afterAdmin.slice(0, idx + 1).join('/'),
      }))
    return dashIndex >= 0 ? [...base, ...rest] : base
  })()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard/admin" className="flex items-center space-x-2">
          <img src="/libstaffconnect-logo.png" alt="Libstaffconnect Logo" className="h-8 w-auto" />
          <span className="font-bold text-gray-900">Admin</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || mobileMenuOpen) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 left-0 z-40 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 ${
              sidebarOpen ? 'w-64' : 'w-20'
            } ${mobileMenuOpen ? 'block lg:block' : 'hidden lg:block'}`}
          >
            <div className="flex flex-col h-full">
              {/* Logo/Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <Link href="/dashboard/admin" className="flex items-center space-x-3">
                  <img src="/libstaffconnect-logo.png" alt="Libstaffconnect Logo" className="h-10 w-auto" />
                  {sidebarOpen && (
                    <div>
                      <h1 className="text-lg font-bold">Admin Panel</h1>
                      <p className="text-xs text-gray-400">Lib-StaffConnect</p>
                    </div>
                  )}
                </Link>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hidden lg:block p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>

              {/* User Info */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                    <Shield className="h-5 w-5" />
                  </div>
                  {sidebarOpen && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{session?.user?.email}</p>
                      <p className="text-xs text-gray-400">Administrator</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href, item.exact)
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        relative flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group
                        ${active 
                          ? 'bg-primary-600 text-white shadow-lg' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }
                      `}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm font-medium"
                        >
                          {item.label}
                        </motion.span>
                      )}
                      {active && sidebarOpen && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white"
                        />
                      )}
                    </Link>
                  )
                })}
              </nav>

              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-700 space-y-2">
                <Link
                  href="/"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5" />
                  {sidebarOpen && <span className="text-sm">Back to Site</span>}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  {sidebarOpen && <span className="text-sm">Sign Out</span>}
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} ${mobileMenuOpen ? 'ml-64' : ''} pt-16 lg:pt-0`}>
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center text-sm text-gray-500 gap-2 flex-wrap">
                {crumbs.map((c, idx) => (
                  <div key={`${idx}-${c.label}`} className="flex items-center gap-2">
                    <Link
                      href={c.href}
                      className={`hover:text-gray-900 transition-colors ${idx === crumbs.length - 1 ? 'text-gray-900 font-medium' : ''}`}
                    >
                      {c.label}
                    </Link>
                    {idx < crumbs.length - 1 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                  </div>
                ))}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Signed in as <span className="font-medium text-gray-700">{session.user.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm text-gray-600"
              >
                <Search className="h-4 w-4" />
                <span className="hidden md:inline">Search</span>
                <span className="hidden md:inline text-xs text-gray-400">Ctrl K</span>
              </button>
              <button
                type="button"
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 text-gray-600" />
              </button>
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm text-gray-600"
              >
                <Home className="h-4 w-4" />
                Site
              </Link>
            </div>
          </div>
        </div>

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Search modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  autoFocus
                  placeholder="Search users, payments, content…"
                  className="w-full outline-none text-gray-900 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 text-sm text-gray-600">
                <div className="font-medium text-gray-900 mb-2">Quick links</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {menuItems.slice(0, 4).map((m) => (
                    <Link
                      key={m.href}
                      href={m.href}
                      className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
                      onClick={() => setSearchOpen(false)}
                    >
                      {m.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
