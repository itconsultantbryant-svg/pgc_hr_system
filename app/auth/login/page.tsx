'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import { PasswordField } from '@/components/auth/PasswordField'
import { Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Login successful!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true)
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch {
      toast.error('Google sign in failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-yellow-50/40 to-gray-100 dark:from-gray-900 dark:via-yellow-900/10 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="card border-yellow-100 dark:border-yellow-900/30">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex justify-center mb-6"
              >
                <img
                  src="/libstaffconnect-logo.png"
                  alt="Libstaffconnect Logo"
                  className="h-16 w-auto object-contain"
                />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Or{' '}
                <Link href="/auth/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                  create a new account
                </Link>
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input pl-10"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <PasswordField
                id="password"
                name="password"
                label="Password"
                value={formData.password}
                onChange={(password) => setFormData({ ...formData, password })}
                autoComplete="current-password"
                placeholder="Enter your password"
                inputClassName="form-input w-full pl-10 pr-12"
              />

              <button
                type="submit"
                disabled={loading}
                className="btn w-full justify-center bg-yellow-500 text-gray-900 hover:bg-yellow-400"
              >
                {loading ? (
                  <>
                    <div className="spinner w-5 h-5 border-white mr-2"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">or continue with</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="btn w-full justify-center border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                {googleLoading ? 'Connecting...' : 'Sign in with Google'}
              </button>
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 -mt-2">
                Note: All services on this platform are subject to annual subscription charges.
              </p>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400 -mt-2">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  Forgot your password?
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}
