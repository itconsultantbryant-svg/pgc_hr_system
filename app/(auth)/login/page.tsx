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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="card">
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
                Sign in to your account to continue
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  placeholder="your.email@example.com"
                />
              </div>

              <PasswordField
                id="password"
                name="password"
                label="Password"
                value={formData.password}
                onChange={(password) => setFormData({ ...formData, password })}
                autoComplete="current-password"
                placeholder="Enter your password"
                showIconOnLabel
              />

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full justify-center"
              >
                {loading ? (
                  <>
                    <div className="spinner w-5 h-5 border-white mr-2"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
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
              <p className="text-center text-sm text-gray-600 -mt-2">
                <Link href="/auth/forgot-password" className="font-medium text-primary-600 hover:text-primary-700 transition-colors">
                  Forgot your password?
                </Link>
              </p>

              <p className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="font-medium text-primary-600 hover:text-primary-700 transition-colors">
                  Create one here
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}
