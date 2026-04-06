'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import RoleDashboardLayout from '@/components/layout/RoleDashboardLayout'
import { Briefcase, Plus, Edit, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface JobPost {
  id: string
  title: string
  description: string
  location: string | null
  jobType: string
  salaryRange: string | null
  isActive: boolean
  createdAt: string
  _count: {
    applications: number
  }
}

export default function JobPostsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobPosts, setJobPosts] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user.userType !== 'ORGANIZATION') {
      router.push('/dashboard')
    } else if (status === 'authenticated') {
      fetchJobPosts()
    }
  }, [status, session, router])

  const fetchJobPosts = async () => {
    try {
      const response = await fetch('/api/jobs?organizationId=current')
      if (response.ok) {
        const data = await response.json()
        setJobPosts(data)
      }
    } catch (error) {
      console.error('Error fetching job posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job post?')) return

    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Job post deleted')
        await fetchJobPosts()
      } else {
        toast.error('Failed to delete job post')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  if (loading || status === 'loading') {
    return (
      <RoleDashboardLayout title="Job posts">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </RoleDashboardLayout>
    )
  }

  return (
    <RoleDashboardLayout title="Job posts">
      <div className="max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold lg:hidden">Job Posts</h1>
            <Link
              href="/dashboard/job-posts/new"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>New Job Post</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {jobPosts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No job posts yet</h3>
                <p className="text-gray-600 mb-4">Create your first job post to start receiving applications</p>
                <Link
                  href="/dashboard/job-posts/new"
                  className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                >
                  Create Job Post
                </Link>
              </div>
            ) : (
              jobPosts.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-xl font-semibold">{job.title}</h2>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            job.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2 line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {job.location && <span>📍 {job.location}</span>}
                        {job.jobType && <span>💼 {job.jobType.replace('_', ' ')}</span>}
                        {job.salaryRange && <span>💰 {job.salaryRange}</span>}
                        <span>📄 {job._count.applications} applications</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Link
                        href={`/dashboard/job-posts/${job.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <Link
                        href={`/dashboard/job-posts/${job.id}/edit`}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
      </div>
    </RoleDashboardLayout>
  )
}
