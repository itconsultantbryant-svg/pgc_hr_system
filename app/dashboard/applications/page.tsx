'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardPageShell from '@/components/layout/DashboardPageShell'
import { FileText, Check, X, Clock, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Application {
  id: string
  coverLetter: string | null
  status: string
  createdAt: string
  jobPost: {
    id: string
    title: string
    organization: {
      organizationName: string
      logo: string | null
    }
  }
  user?: {
    jobSeekerProfile: {
      firstName: string
      lastName: string
      profilePicture: string | null
      currentJobTitle: string | null
    }
  }
}

export default function ApplicationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobPostId = searchParams.get('jobPostId')
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      fetchApplications()
    }
  }, [status, session, router, jobPostId])

  const fetchApplications = async () => {
    try {
      const q = jobPostId ? `?jobPostId=${encodeURIComponent(jobPostId)}` : ''
      const response = await fetch(`/api/applications${q}`)
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'REVIEWED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Check className="h-4 w-4" />
      case 'REJECTED':
        return <X className="h-4 w-4" />
      case 'REVIEWED':
        return <Eye className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading || status === 'loading') {
    return (
      <DashboardPageShell title="Applications">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardPageShell>
    )
  }

  const isJobSeeker = session?.user.userType === 'JOB_SEEKER'
  const isOrganization = session?.user.userType === 'ORGANIZATION'

  return (
    <DashboardPageShell title={isJobSeeker ? 'My applications' : 'Applicants'}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">
            {isJobSeeker ? 'My Applications' : 'Job Applications'}
          </h1>

          {applications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
              <p className="text-gray-600">
                {isJobSeeker
                  ? "You haven't applied to any jobs yet. Browse available positions to get started!"
                  : 'No applications have been submitted yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {isJobSeeker ? (
                        <>
                          <div className="flex items-center space-x-3 mb-2">
                            {application.jobPost.organization.logo ? (
                              <img
                                src={application.jobPost.organization.logo}
                                alt={application.jobPost.organization.organizationName}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                            )}
                            <div>
                              <h3 className="text-lg font-semibold">
                                {application.jobPost.title}
                              </h3>
                              <p className="text-gray-600">
                                {application.jobPost.organization.organizationName}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center space-x-3 mb-2">
                            {application.user?.jobSeekerProfile.profilePicture ? (
                              <img
                                src={application.user.jobSeekerProfile.profilePicture}
                                alt={`${application.user.jobSeekerProfile.firstName} ${application.user.jobSeekerProfile.lastName}`}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            )}
                            <div>
                              <h3 className="text-lg font-semibold">
                                {application.user?.jobSeekerProfile.firstName}{' '}
                                {application.user?.jobSeekerProfile.lastName}
                              </h3>
                              <p className="text-gray-600">
                                {application.user?.jobSeekerProfile.currentJobTitle || 'Job Seeker'}
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2">
                            Applied for: <span className="font-semibold">{application.jobPost.title}</span>
                          </p>
                        </>
                      )}

                      {application.coverLetter && (
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                          {application.coverLetter}
                        </p>
                      )}

                      <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          Applied: {new Date(application.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col items-end space-y-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getStatusColor(
                          application.status
                        )}`}
                      >
                        {getStatusIcon(application.status)}
                        <span>{application.status}</span>
                      </span>
                      {isOrganization && (
                        <Link
                          href={`/dashboard/applications/${application.id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardPageShell>
  )
}
