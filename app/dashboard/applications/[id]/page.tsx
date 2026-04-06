'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import RoleDashboardLayout from '@/components/layout/RoleDashboardLayout'
import { Check, X, Clock, User, Mail, Phone, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Application {
  id: string
  coverLetter: string | null
  status: string
  notes: string | null
  createdAt: string
  reviewedAt: string | null
  jobPost: {
    id: string
    title: string
    description: string
    organization: {
      organizationName: string
      logo: string | null
    }
  }
  user: {
    email: string
    jobSeekerProfile: {
      firstName: string
      lastName: string
      profilePicture: string | null
      phone: string | null
      location: string | null
      bio: string | null
      currentJobTitle: string | null
      experiences: any[]
      educations: any[]
      competencies: any[]
    }
  }
}

export default function ApplicationDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user.userType !== 'ORGANIZATION') {
      router.push('/dashboard')
    } else if (status === 'authenticated' && params.id) {
      fetchApplication()
    }
  }, [status, session, router, params.id])

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/applications/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setApplication(data)
        setStatusUpdate(data.status)
        setNotes(data.notes || '')
      } else {
        router.push('/dashboard/applications')
      }
    } catch (error) {
      console.error('Error fetching application:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/applications/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusUpdate, notes }),
      })

      if (response.ok) {
        toast.success('Application status updated!')
        await fetchApplication()
      } else {
        toast.error('Failed to update application')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setUpdating(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <RoleDashboardLayout title="Applicant">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </RoleDashboardLayout>
    )
  }

  if (!application) {
    return (
      <RoleDashboardLayout title="Applicant">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-lg">Application not found</div>
        </div>
      </RoleDashboardLayout>
    )
  }

  return (
    <RoleDashboardLayout title="Applicant detail">
      <div className="max-w-6xl">
          <div className="mb-6">
            <Link
              href="/dashboard/applications"
              className="text-primary-600 hover:text-primary-700"
            >
              ← Back to Applications
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Application Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">
                      Application for {application.jobPost.title}
                    </h1>
                    <p className="text-gray-600">{application.jobPost.organization.organizationName}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      application.status === 'ACCEPTED'
                        ? 'bg-green-100 text-green-800'
                        : application.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : application.status === 'REVIEWED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {application.status}
                  </span>
                </div>

                {application.coverLetter && (
                  <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-2">Cover Letter</h2>
                    <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                      {application.coverLetter}
                    </div>
                  </div>
                )}
              </div>

              {/* Candidate Profile */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Candidate Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {application.user.jobSeekerProfile.profilePicture ? (
                      <img
                        src={application.user.jobSeekerProfile.profilePicture}
                        alt={`${application.user.jobSeekerProfile.firstName} ${application.user.jobSeekerProfile.lastName}`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">
                        {application.user.jobSeekerProfile.firstName}{' '}
                        {application.user.jobSeekerProfile.lastName}
                      </h3>
                      <p className="text-gray-600">
                        {application.user.jobSeekerProfile.currentJobTitle || 'Job Seeker'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center space-x-2 text-gray-700">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span>{application.user.email}</span>
                    </div>
                    {application.user.jobSeekerProfile.phone && (
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <span>{application.user.jobSeekerProfile.phone}</span>
                      </div>
                    )}
                    {application.user.jobSeekerProfile.location && (
                      <div className="flex items-center space-x-2 text-gray-700">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <span>{application.user.jobSeekerProfile.location}</span>
                      </div>
                    )}
                  </div>

                  {application.user.jobSeekerProfile.bio && (
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Bio</h4>
                      <p className="text-gray-700">{application.user.jobSeekerProfile.bio}</p>
                    </div>
                  )}

                  {application.user.jobSeekerProfile.competencies &&
                    application.user.jobSeekerProfile.competencies.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {application.user.jobSeekerProfile.competencies.map((comp: any, idx: number) => (
                            <span
                              key={idx}
                              className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
                            >
                              {comp.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Update */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Update Status</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="REVIEWED">Reviewed</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Add notes..."
                    />
                  </div>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating}
                    className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </div>

              {/* Application Details */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Application Details</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Applied:</span>
                    <span className="ml-2 font-medium">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {application.reviewedAt && (
                    <div>
                      <span className="text-gray-600">Reviewed:</span>
                      <span className="ml-2 font-medium">
                        {new Date(application.reviewedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Current Status:</span>
                    <span className="ml-2 font-medium">{application.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </RoleDashboardLayout>
  )
}
