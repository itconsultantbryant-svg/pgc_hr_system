'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import RoleDashboardLayout from '@/components/layout/RoleDashboardLayout'
import { Building2, Upload, Plus, X, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface ExecutiveEntry {
  id?: string
  name: string
  role: string
  bio: string
  profileImage: string
}

interface CompanyProfile {
  companyName: string
  registrationNumber: string
  phone: string
  email: string
  website: string
  logo: string
  description: string
  industry: string
  location: string
  yearEstablished: string
  employeeCount: string
  services: string
  currentPerformance: string
  previousPerformance: string
  currentClients: string
  previousClients: string
  revenueGenerated: string
  contractCompletionAbility: string
  otherDetails: string
  executives: ExecutiveEntry[]
}

export default function CompanyProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<CompanyProfile>({
    companyName: '',
    registrationNumber: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
    description: '',
    industry: '',
    location: '',
    yearEstablished: '',
    employeeCount: '',
    services: '',
    currentPerformance: '',
    previousPerformance: '',
    currentClients: '',
    previousClients: '',
    revenueGenerated: '',
    contractCompletionAbility: '',
    otherDetails: '',
    executives: [],
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user.userType !== 'COMPANY') {
      router.push('/dashboard')
    } else if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, session, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profiles/company')
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setProfile({
            companyName: data.companyName || '',
            registrationNumber: data.registrationNumber || '',
            phone: data.phone || '',
            email: data.email || '',
            website: data.website || '',
            logo: data.logo || '',
            description: data.description || '',
            industry: data.industry || '',
            location: data.location || '',
            yearEstablished: data.yearEstablished?.toString() || '',
            employeeCount: data.employeeCount || '',
            services: data.services || '',
            currentPerformance: data.currentPerformance || '',
            previousPerformance: data.previousPerformance || '',
            currentClients: data.currentClients || '',
            previousClients: data.previousClients || '',
            revenueGenerated: data.revenueGenerated || '',
            contractCompletionAbility: data.contractCompletionAbility || '',
            otherDetails: data.otherDetails || '',
            executives: (data.executives || []).map((e: any) => ({
              id: e.id,
              name: e.name || '',
              role: e.role || '',
              bio: e.bio || '',
              profileImage: e.profileImage || '',
            })),
          })
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/profiles/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        toast.success('Profile saved successfully!')
        await fetchProfile()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to save profile')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setProfile({ ...profile, logo: data.url })
        toast.success('Logo uploaded successfully!')
      } else {
        toast.error('Failed to upload logo')
      }
    } catch (error) {
      toast.error('An error occurred while uploading')
    }
  }

  if (loading || status === 'loading') {
    return (
      <RoleDashboardLayout title="Company profile">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </RoleDashboardLayout>
    )
  }

  return (
    <RoleDashboardLayout title="Company profile">
      <div className="max-w-4xl">
        <div className="mb-6 lg:hidden">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Company Profile</h1>
        </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 p-6 space-y-6">
            {/* Logo */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                {profile.logo ? (
                  <img
                    src={profile.logo}
                    alt="Company Logo"
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center">
                    <Building2 className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700">
                  <Upload className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Company Logo</h2>
                <p className="text-gray-600 text-sm">Upload your company logo</p>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={profile.companyName}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={profile.registrationNumber}
                  onChange={(e) => setProfile({ ...profile, registrationNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <input
                  type="text"
                  value={profile.industry}
                  onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Established
                </label>
                <input
                  type="number"
                  value={profile.yearEstablished}
                  onChange={(e) => setProfile({ ...profile, yearEstablished: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Count
                </label>
                <input
                  type="text"
                  value={profile.employeeCount}
                  onChange={(e) => setProfile({ ...profile, employeeCount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 10-50, 50-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={4}
                value={profile.description}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Tell us about your company..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
              <textarea
                rows={3}
                value={profile.services}
                onChange={(e) => setProfile({ ...profile, services: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="List your services..."
              />
            </div>

            {/* Performance & Clients (visible on public profile with Direct package) */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance & Clients</h3>
              <p className="text-sm text-gray-500 mb-4">Shown to the public only when your company is on the Direct package.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current performance</label>
                  <textarea
                    rows={3}
                    value={profile.currentPerformance}
                    onChange={(e) => setProfile({ ...profile, currentPerformance: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe your current business performance..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Previous performance</label>
                  <textarea
                    rows={3}
                    value={profile.previousPerformance}
                    onChange={(e) => setProfile({ ...profile, previousPerformance: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe your past performance..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current clients</label>
                  <textarea
                    rows={2}
                    value={profile.currentClients}
                    onChange={(e) => setProfile({ ...profile, currentClients: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="List current clients (one per line or comma-separated)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Previous clients</label>
                  <textarea
                    rows={2}
                    value={profile.previousClients}
                    onChange={(e) => setProfile({ ...profile, previousClients: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="List previous clients..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Revenue generated</label>
                  <input
                    type="text"
                    value={profile.revenueGenerated}
                    onChange={(e) => setProfile({ ...profile, revenueGenerated: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g. $1M+ annually, or range"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contract completion ability</label>
                  <textarea
                    rows={3}
                    value={profile.contractCompletionAbility}
                    onChange={(e) => setProfile({ ...profile, contractCompletionAbility: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe your capacity to deliver and complete contracts..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Other details</label>
                  <textarea
                    rows={3}
                    value={profile.otherDetails}
                    onChange={(e) => setProfile({ ...profile, otherDetails: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Any other relevant information..."
                  />
                </div>
              </div>
            </div>

            {/* Company executives */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary-600" />
                Company executives
              </h3>
              <p className="text-sm text-gray-500 mb-4">Name, role, bio and profile image. Shown publicly only with Direct package.</p>
              {profile.executives.map((exec, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Executive #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, executives: profile.executives.filter((_, i) => i !== index) })}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Full name"
                      value={exec.name}
                      onChange={(e) => {
                        const next = [...profile.executives]
                        next[index] = { ...next[index], name: e.target.value }
                        setProfile({ ...profile, executives: next })
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Role / Title"
                      value={exec.role}
                      onChange={(e) => {
                        const next = [...profile.executives]
                        next[index] = { ...next[index], role: e.target.value }
                        setProfile({ ...profile, executives: next })
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <textarea
                    placeholder="Short bio"
                    value={exec.bio}
                    onChange={(e) => {
                      const next = [...profile.executives]
                      next[index] = { ...next[index], bio: e.target.value }
                      setProfile({ ...profile, executives: next })
                    }}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="flex items-center gap-3">
                    {exec.profileImage ? (
                      <img src={exec.profileImage} alt={exec.name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <label className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 cursor-pointer">
                      <Upload className="h-4 w-4" />
                      Upload photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const formData = new FormData()
                          formData.append('file', file)
                          try {
                            const res = await fetch('/api/upload/profile-picture', { method: 'POST', body: formData })
                            if (res.ok) {
                              const data = await res.json()
                              const next = [...profile.executives]
                              next[index] = { ...next[index], profileImage: data.url }
                              setProfile({ ...profile, executives: next })
                              toast.success('Photo uploaded')
                            }
                          } catch {
                            toast.error('Upload failed')
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setProfile({ ...profile, executives: [...profile.executives, { name: '', role: '', bio: '', profileImage: '' }] })}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                <Plus className="h-4 w-4" /> Add executive
              </button>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
      </div>
    </RoleDashboardLayout>
  )
}
