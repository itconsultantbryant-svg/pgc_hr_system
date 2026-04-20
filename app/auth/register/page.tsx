'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import { PasswordField } from '@/components/auth/PasswordField'
import { Building2, User, Briefcase, Mail } from 'lucide-react'
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

  const userTypes = [
    {
      type: 'JOB_SEEKER' as const,
      icon: User,
      label: 'Job Seeker',
      description: 'Looking for opportunities',
    },
    {
      type: 'COMPANY' as const,
      icon: Building2,
      label: 'Company',
      description: 'Seeking contracts',
    },
    {
      type: 'ORGANIZATION' as const,
      icon: Briefcase,
      label: 'Employer',
      description: 'Hiring talent',
    },
  ]

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
              {/* Account Type Selection */}
              <div>
                <label className="form-label mb-4">Account Type *</label>
                <div className="grid grid-cols-3 gap-4">
                  {userTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = formData.userType === type.type
                    return (
                      <button
                        key={type.type}
                        type="button"
                        onClick={() => setFormData({ ...formData, userType: type.type })}
                        className={`p-4 border-2 rounded-xl text-center transition-all hover:shadow-md ${
                          isSelected
                            ? 'border-primary-600 bg-primary-50 shadow-md'
                            : 'border-gray-300 hover:border-gray-400 bg-white'
                        }`}
                      >
                        <Icon
                          className={`h-6 w-6 mx-auto mb-2 ${
                            isSelected ? 'text-primary-600' : 'text-gray-400'
                          }`}
                        />
                        <div className={`text-sm font-semibold ${isSelected ? 'text-primary-600' : 'text-gray-700'}`}>
                          {type.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-5">
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
                  autoComplete="new-password"
                  placeholder="Minimum 6 characters"
                  inputClassName="form-input w-full pl-10 pr-12"
                />

                <PasswordField
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(confirmPassword) => setFormData({ ...formData, confirmPassword })}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  iconMode="keyhole"
                  inputClassName="form-input w-full pl-10 pr-12"
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
                  <span>Create account</span>
                )}
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}
