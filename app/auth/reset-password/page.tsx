'use client'

import { useState } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import { PasswordField } from '@/components/auth/PasswordField'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const value = new URLSearchParams(window.location.search).get('token') || ''
    setToken(value)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      toast.error('Reset token is missing. Request a new reset link.')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Unable to reset password')
      }
      toast.success('Password reset successful. Please sign in.')
      router.push('/auth/login')
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-yellow-50/40 to-gray-100 dark:from-gray-900 dark:via-yellow-900/10 dark:to-gray-800">
        <div className="max-w-md w-full">
          <div className="card border-yellow-100 dark:border-yellow-900/30">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Reset Password
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Enter your new password below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <PasswordField
                id="password"
                name="password"
                label="New password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                inputClassName="form-input w-full pl-10 pr-12"
              />
              <PasswordField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                iconMode="keyhole"
                inputClassName="form-input w-full pl-10 pr-12"
              />

              <button
                type="submit"
                disabled={loading}
                className="btn w-full justify-center bg-yellow-500 text-gray-900 hover:bg-yellow-400"
              >
                {loading ? 'Resetting password...' : 'Reset password'}
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                <Link
                  href="/auth/login"
                  className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  Back to sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}
