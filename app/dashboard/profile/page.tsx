'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import RoleDashboardLayout from '@/components/layout/RoleDashboardLayout'
import { User, Upload, Plus, X, Briefcase, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'

interface ExperienceEntry {
  id?: string
  company: string
  position: string
  description?: string
  startDate: string
  endDate?: string
  isCurrent?: boolean
}

interface EducationEntry {
  id?: string
  institution: string
  degree: string
  field?: string
  startDate: string
  endDate?: string
  isCurrent?: boolean
  description?: string
}

interface ProfileData {
  firstName: string
  lastName: string
  phone: string
  whatsappNumber: string
  bio: string
  location: string
  category: string
  availability: string
  currentJobTitle: string
  expectedSalary: string
  profilePicture: string
  experiences: ExperienceEntry[]
  educations: EducationEntry[]
  competencies: any[]
  references: any[]
  languages: any[]
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    phone: '',
    whatsappNumber: '',
    bio: '',
    location: '',
    category: '',
    availability: '',
    currentJobTitle: '',
    expectedSalary: '',
    profilePicture: '',
    experiences: [],
    educations: [],
    competencies: [],
    references: [],
    languages: [],
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user.userType !== 'JOB_SEEKER') {
      router.push('/dashboard')
    } else if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, session, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profiles/job-seeker')
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setProfile({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phone: data.phone || '',
            whatsappNumber: data.whatsappNumber || '',
            bio: data.bio || '',
            location: data.location || '',
            category: data.category || '',
            availability: data.availability || '',
            currentJobTitle: data.currentJobTitle || '',
            expectedSalary: data.expectedSalary || '',
            profilePicture: data.profilePicture || '',
            experiences: (data.experiences || []).map((e: any) => ({
              id: e.id,
              company: e.company || '',
              position: e.position || '',
              description: e.description || '',
              startDate: e.startDate ? new Date(e.startDate).toISOString().slice(0, 10) : '',
              endDate: e.endDate ? new Date(e.endDate).toISOString().slice(0, 10) : '',
              isCurrent: e.isCurrent || false,
            })),
            educations: (data.educations || []).map((e: any) => ({
              id: e.id,
              institution: e.institution || '',
              degree: e.degree || '',
              field: e.field || '',
              startDate: e.startDate ? new Date(e.startDate).toISOString().slice(0, 10) : '',
              endDate: e.endDate ? new Date(e.endDate).toISOString().slice(0, 10) : '',
              isCurrent: e.isCurrent || false,
              description: e.description || '',
            })),
            competencies: data.competencies || [],
            references: data.references || [],
            languages: data.languages || [],
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
      const response = await fetch('/api/profiles/job-seeker', {
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setProfile({ ...profile, profilePicture: data.url })
        toast.success('Profile picture uploaded successfully!')
      } else {
        toast.error('Failed to upload profile picture')
      }
    } catch (error) {
      toast.error('An error occurred while uploading')
    }
  }

  if (loading || status === 'loading') {
    return (
      <RoleDashboardLayout title="Profile and resume">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </RoleDashboardLayout>
    )
  }

  return (
    <RoleDashboardLayout title="Profile and resume">
      <div className="max-w-4xl">
        <div className="mb-6 lg:hidden">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
        </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 p-6 space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700">
                  <Upload className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Profile Picture</h2>
                <p className="text-gray-600 text-sm">Upload a professional photo</p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g. +1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp number</label>
                <input
                  type="tel"
                  value={profile.whatsappNumber}
                  onChange={(e) => setProfile({ ...profile, whatsappNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g. 1234567890 (with country code)"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Salary</label>
                <input
                  type="text"
                  value={profile.expectedSalary}
                  onChange={(e) => setProfile({ ...profile, expectedSalary: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g. $50,000 - $60,000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                rows={4}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={profile.category}
                  onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Job Title
                </label>
                <input
                  type="text"
                  value={profile.currentJobTitle}
                  onChange={(e) => setProfile({ ...profile, currentJobTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Job Experience - optional, only if they have worked somewhere */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary-600" />
                Job Experience
              </h3>
              <p className="text-sm text-gray-500 mb-3">Add your work history if you have previously worked somewhere.</p>
              {profile.experiences.map((exp, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Experience #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, experiences: profile.experiences.filter((_, i) => i !== index) })}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Company name"
                      value={exp.company}
                      onChange={(e) => {
                        const next = [...profile.experiences]
                        next[index] = { ...next[index], company: e.target.value }
                        setProfile({ ...profile, experiences: next })
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Job title / Position"
                      value={exp.position}
                      onChange={(e) => {
                        const next = [...profile.experiences]
                        next[index] = { ...next[index], position: e.target.value }
                        setProfile({ ...profile, experiences: next })
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start date</label>
                      <input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => {
                          const next = [...profile.experiences]
                          next[index] = { ...next[index], startDate: e.target.value }
                          setProfile({ ...profile, experiences: next })
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End date (leave empty if current)</label>
                      <input
                        type="date"
                        value={exp.endDate || ''}
                        onChange={(e) => {
                          const next = [...profile.experiences]
                          next[index] = { ...next[index], endDate: e.target.value || undefined }
                          setProfile({ ...profile, experiences: next })
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <textarea
                    placeholder="Description (optional)"
                    value={exp.description || ''}
                    onChange={(e) => {
                      const next = [...profile.experiences]
                      next[index] = { ...next[index], description: e.target.value }
                      setProfile({ ...profile, experiences: next })
                    }}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setProfile({ ...profile, experiences: [...profile.experiences, { company: '', position: '', startDate: '', endDate: '' }] })}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                <Plus className="h-4 w-4" /> Add experience
              </button>
            </div>

            {/* Education */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary-600" />
                Education
              </h3>
              <p className="text-sm text-gray-500 mb-3">Add your educational level and qualifications.</p>
              {profile.educations.map((edu, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Education #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, educations: profile.educations.filter((_, i) => i !== index) })}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Institution / School"
                      value={edu.institution}
                      onChange={(e) => {
                        const next = [...profile.educations]
                        next[index] = { ...next[index], institution: e.target.value }
                        setProfile({ ...profile, educations: next })
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Degree / Qualification"
                      value={edu.degree}
                      onChange={(e) => {
                        const next = [...profile.educations]
                        next[index] = { ...next[index], degree: e.target.value }
                        setProfile({ ...profile, educations: next })
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Field of study (optional)"
                    value={edu.field || ''}
                    onChange={(e) => {
                      const next = [...profile.educations]
                      next[index] = { ...next[index], field: e.target.value }
                      setProfile({ ...profile, educations: next })
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start date</label>
                      <input
                        type="date"
                        value={edu.startDate}
                        onChange={(e) => {
                          const next = [...profile.educations]
                          next[index] = { ...next[index], startDate: e.target.value }
                          setProfile({ ...profile, educations: next })
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End date</label>
                      <input
                        type="date"
                        value={edu.endDate || ''}
                        onChange={(e) => {
                          const next = [...profile.educations]
                          next[index] = { ...next[index], endDate: e.target.value || undefined }
                          setProfile({ ...profile, educations: next })
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <textarea
                    placeholder="Description (optional)"
                    value={edu.description || ''}
                    onChange={(e) => {
                      const next = [...profile.educations]
                      next[index] = { ...next[index], description: e.target.value }
                      setProfile({ ...profile, educations: next })
                    }}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setProfile({ ...profile, educations: [...profile.educations, { institution: '', degree: '', field: '', startDate: '', endDate: '' }] })}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                <Plus className="h-4 w-4" /> Add education
              </button>
            </div>

            {/* Skills/Competencies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {profile.competencies.map((comp, index) => (
                  <span
                    key={index}
                    className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{comp.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setProfile({
                          ...profile,
                          competencies: profile.competencies.filter((_, i) => i !== index),
                        })
                      }}
                      className="hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add a skill and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const input = e.target as HTMLInputElement
                    if (input.value.trim()) {
                      setProfile({
                        ...profile,
                        competencies: [
                          ...profile.competencies,
                          { name: input.value.trim(), level: 'Intermediate' },
                        ],
                      })
                      input.value = ''
                    }
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
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
