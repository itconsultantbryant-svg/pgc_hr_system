'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import RoleDashboardLayout from '@/components/layout/RoleDashboardLayout'
import { Briefcase, Users, MapPin, DollarSign, Calendar } from 'lucide-react'
import Link from 'next/link'

interface JobPost {
  id: string
  title: string
  description: string
  requirements: string | null
  location: string | null
  jobType: string
  salaryRange: string | null
  category: string | null
  applicationDeadline: string | null
  isActive: boolean
  createdAt: string
  _count: {
    applications: number
  }
  organization: {
    organizationName: string
    logo: string | null
  }
}

export default function JobPostDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [jobPost, setJobPost] = useState<JobPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user.userType !== 'ORGANIZATION') {
      router.push('/dashboard')
    } else if (status === 'authenticated' && params.id) {
      fetchJobPost()
    }
  }, [status, session, router, params.id])

  const fetchJobPost = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setJobPost(data)
      } else {
        router.push('/dashboard/job-posts')
      }
    } catch (error) {
      console.error('Error fetching job post:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <RoleDashboardLayout title="Job post">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </RoleDashboardLayout>
    )
  }

  if (!jobPost) {
    return (
      <RoleDashboardLayout title="Job post">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-lg">Job post not found</div>
        </div>
      </RoleDashboardLayout>
    )
  }

  return (
    <RoleDashboardLayout title="Job post">
      <div className="max-w-4xl">
          <div className="mb-6">
            <Link
              href="/dashboard/job-posts"
              className="text-primary-600 hover:text-primary-700"
            >
              ← Back to Job Posts
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{jobPost.title}</h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  {jobPost.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{jobPost.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Briefcase className="h-4 w-4" />
                    <span>{jobPost.jobType.replace('_', ' ')}</span>
                  </div>
                  {jobPost.salaryRange && (
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{jobPost.salaryRange}</span>
                    </div>
                  )}
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  jobPost.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {jobPost.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="border-t border-b py-6 mb-6">
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{jobPost.description}</p>

                {jobPost.requirements && (
                  <>
                    <h2 className="text-xl font-semibold mb-3 mt-6">Requirements</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{jobPost.requirements}</p>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Applications</div>
                <div className="text-2xl font-bold">{jobPost._count.applications}</div>
              </div>
              {jobPost.applicationDeadline && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Deadline</div>
                  <div className="text-lg font-semibold">
                    {new Date(jobPost.applicationDeadline).toLocaleDateString()}
                  </div>
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Posted</div>
                <div className="text-lg font-semibold">
                  {new Date(jobPost.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Link
                href={`/dashboard/applications?jobPostId=${jobPost.id}`}
                className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 text-center"
              >
                View Applications ({jobPost._count.applications})
              </Link>
              <Link
                href={`/dashboard/job-posts/${jobPost.id}/edit`}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Edit
              </Link>
            </div>
          </div>
      </div>
    </RoleDashboardLayout>
  )
}
