'use client'

import { useState } from 'react'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import { Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Unable to process your request')
      }

      toast.success(
        'If your email exists, a reset link has been generated. Check your inbox or ask admin for the reset link.'
      )
      setEmail('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to request password reset')
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
              Forgot Password
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Enter your account email and we will generate a password reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input pl-10"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn w-full justify-center bg-yellow-500 text-gray-900 hover:bg-yellow-400"
              >
                {loading ? 'Generating reset link...' : 'Send reset link'}
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Remembered your password?{' '}
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
