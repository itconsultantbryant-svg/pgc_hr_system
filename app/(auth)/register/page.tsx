'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import Layout from '@/components/layout/Layout'
import { PasswordField } from '@/components/auth/PasswordField'
import { User, Briefcase, Building2, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'JOB_SEEKER' as 'JOB_SEEKER' | 'COMPANY' | 'ORGANIZATION',
  })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          userType: formData.userType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      toast.success('Registration successful! Please login.')
      router.push('/auth/login')
    } catch (error: any) {
      toast.error(error.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true)
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch {
      toast.error('Google signup failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  const userTypes = [
    { value: 'JOB_SEEKER', label: 'Job Seeker', icon: User, description: 'Find employment opportunities' },
    { value: 'COMPANY', label: 'Company', icon: Building2, description: 'Seek contracts and partnerships' },
    { value: 'ORGANIZATION', label: 'Employer', icon: Briefcase, description: 'Post jobs and hire talent' },
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
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
                Create Your Account
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Join our platform and start your journey today
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Select Account Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {userTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = formData.userType === type.value
                    return (
                      <motion.button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, userType: type.value as any })}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-6 border-2 rounded-xl text-center transition-all ${
                          isSelected
                            ? 'border-primary-600 bg-primary-50 shadow-md'
                            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`h-8 w-8 mx-auto mb-3 ${isSelected ? 'text-primary-600' : 'text-gray-400'}`} />
                        <div className={`text-sm font-semibold mb-1 ${isSelected ? 'text-primary-700' : 'text-gray-700'}`}>
                          {type.label}
                        </div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4">
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
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  showIconOnLabel
                />

                <PasswordField
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(confirmPassword) => setFormData({ ...formData, confirmPassword })}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  showIconOnLabel
                  iconMode="keyhole"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full justify-center"
              >
                {loading ? (
                  <>
                    <div className="spinner w-5 h-5 border-white mr-2"></div>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
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
                onClick={handleGoogleSignUp}
                disabled={googleLoading}
                className="btn w-full justify-center border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                {googleLoading ? 'Connecting...' : 'Continue with Google'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-700 transition-colors">
                  Sign in here
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}
