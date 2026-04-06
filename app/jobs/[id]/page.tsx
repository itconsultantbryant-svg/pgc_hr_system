'use client'

import Layout from '@/components/layout/Layout'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Briefcase, MapPin, DollarSign, Clock, Building2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

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
  createdAt: string
  organization: {
    organizationName: string
    logo: string | null
    description: string | null
    location: string | null
  }
  _count: {
    applications: number
  }
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [job, setJob] = useState<JobPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchJob()
    }
  }, [params.id])

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setJob(data)
        checkApplicationStatus(data.id)
      } else {
        router.push('/jobs')
      }
    } catch (error) {
      console.error('Error fetching job:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkApplicationStatus = async (jobId: string) => {
    if (!session) return

    try {
      const response = await fetch('/api/applications')
      if (response.ok) {
        const applications = await response.json()
        const applied = applications.some((app: any) => app.jobPostId === jobId)
        setHasApplied(applied)
      }
    } catch (error) {
      console.error('Error checking application status:', error)
    }
  }

  const handleApply = async () => {
    if (!session) {
      toast.error('Please login to apply')
      router.push('/auth/login')
      return
    }

    if (session.user.userType !== 'JOB_SEEKER') {
      toast.error('Only job seekers can apply for jobs')
      return
    }

    setApplying(true)
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobPostId: job?.id,
          coverLetter: coverLetter || null,
        }),
      })

      if (response.ok) {
        toast.success('Application submitted successfully!')
        setHasApplied(true)
        setShowApplyForm(false)
        setCoverLetter('')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to submit application')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    )
  }

  if (!job) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Job not found</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container-custom">
          <Link
            href="/jobs"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Jobs
          </Link>

          <div className="card">
            <div className="flex items-start space-x-6 mb-8">
              {job.organization.logo ? (
                <img
                  src={job.organization.logo}
                  alt={job.organization.organizationName}
                  className="w-24 h-24 rounded-xl object-cover shadow-md"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center shadow-md">
                  <Building2 className="h-12 w-12 text-gray-500" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">{job.title}</h1>
                <p className="text-xl text-gray-600 font-medium">{job.organization.organizationName}</p>
                {job.organization.location && (
                  <p className="text-gray-500 mt-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.organization.location}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-200">
              {job.location && (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary-600" />
                  <span className="text-gray-700 font-medium">{job.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <Briefcase className="h-5 w-5 text-primary-600" />
                <span className="text-gray-700 font-medium">{job.jobType.replace('_', ' ')}</span>
              </div>
              {job.salaryRange && (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary-600" />
                  <span className="text-gray-700 font-medium">{job.salaryRange}</span>
                </div>
              )}
              {job.applicationDeadline && (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-primary-600" />
                  <span className="text-gray-700 font-medium">{new Date(job.applicationDeadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="prose max-w-none mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Job Description</h2>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</div>

              {job.requirements && (
                <>
                  <h2 className="text-2xl font-bold mb-4 mt-8 text-gray-900">Requirements</h2>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.requirements}</div>
                </>
              )}
            </div>

            {session?.user.userType === 'JOB_SEEKER' && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                {hasApplied ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                    <p className="text-green-800 font-semibold text-lg mb-2 flex items-center">
                      <span className="text-2xl mr-2">✓</span>
                      You have already applied for this position
                    </p>
                    <Link
                      href="/dashboard/applications"
                      className="text-green-700 hover:text-green-800 text-sm font-medium inline-flex items-center transition-colors"
                    >
                      View your applications →
                    </Link>
                  </div>
                ) : (
                  <>
                    {!showApplyForm ? (
                      <button
                        onClick={() => setShowApplyForm(true)}
                        className="btn btn-primary px-8 py-3 text-lg"
                      >
                        Apply for this Position
                      </button>
                    ) : (
                      <div className="space-y-6">
                        <div className="form-group">
                          <label className="form-label">
                            Cover Letter (Optional)
                          </label>
                          <textarea
                            rows={8}
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            className="form-input resize-none"
                            placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <button
                            onClick={handleApply}
                            disabled={applying}
                            className="btn btn-primary flex-1 justify-center"
                          >
                            {applying ? (
                              <>
                                <div className="spinner w-5 h-5 border-white mr-2"></div>
                                <span>Submitting...</span>
                              </>
                            ) : (
                              'Submit Application'
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setShowApplyForm(false)
                              setCoverLetter('')
                            }}
                            className="btn btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {!session && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                  <p className="text-blue-800 font-semibold mb-4 text-lg">
                    Please login or create an account to apply for this position.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href="/auth/login"
                      className="btn btn-primary justify-center"
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/register"
                      className="btn btn-secondary justify-center"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
