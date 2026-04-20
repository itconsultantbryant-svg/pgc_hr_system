'use client'

import Layout from '@/components/layout/Layout'
import { useState, useEffect } from 'react'
import { Search, Briefcase, MapPin, DollarSign, Clock } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'

interface JobPost {
  id: string
  title: string
  description: string
  location: string | null
  jobType: string
  salaryRange: string | null
  category: string | null
  applicationDeadline: string | null
  createdAt: string
  organization: {
    organizationName: string
    logo: string | null
  }
  _count: {
    applications: number
  }
}

interface ContentItem {
  id: string
  title: string
  type: 'text' | 'image' | 'advertisement'
  content: string
  imageUrl?: string
  position: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function JobsPage() {
  const { data: session } = useSession()
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)
  const [jobsContent, setJobsContent] = useState<ContentItem[]>([])
  const [sidebarContent, setSidebarContent] = useState<ContentItem[]>([])
  const [contentLoading, setContentLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: '',
    category: '',
  })

  useEffect(() => {
    fetchJobs()
  }, [filters])

  useEffect(() => {
    fetchPageContent()
    const interval = setInterval(fetchPageContent, 20000)
    return () => clearInterval(interval)
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.location) params.append('location', filters.location)
      if (filters.jobType) params.append('jobType', filters.jobType)
      if (filters.category) params.append('category', filters.category)

      const response = await fetch(`/api/jobs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPageContent = async () => {
    try {
      setContentLoading(true)
      const [jobsResponse, sidebarResponse] = await Promise.all([
        fetch('/api/content?position=jobs', { cache: 'no-store' }),
        fetch('/api/content?position=sidebar', { cache: 'no-store' }),
      ])

      if (jobsResponse.ok) {
        const data = await jobsResponse.json()
        setJobsContent(data)
      }
      if (sidebarResponse.ok) {
        const data = await sidebarResponse.json()
        setSidebarContent(data)
      }
    } catch (error) {
      console.error('Error fetching page content:', error)
    } finally {
      setContentLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50/30 to-gray-100 dark:from-gray-900 dark:via-yellow-900/10 dark:to-gray-800 py-8">
        <div className="container-custom">
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Job Openings</h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Browse available job opportunities and find your next career move with top companies
            </p>
          </div>

          {/* Search and Filters */}
          <div className="card mb-8 border-yellow-100 dark:border-yellow-900/30">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={filters.jobType}
                  onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
              </div>
            </div>
          </div>

          {/* Jobs Page Content */}
          <div className="card mb-8 border-yellow-100 dark:border-yellow-900/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Latest Job Updates</h2>
            </div>
            {contentLoading ? (
              <div className="text-gray-600">Loading content...</div>
            ) : jobsContent.length === 0 ? (
              <div className="text-gray-600">No updates yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobsContent.map((item) => (
                  <div key={item.id} className="border border-yellow-100 dark:border-yellow-900/30 rounded-lg p-4 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <span className="inline-block bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 px-2 py-1 rounded text-xs">
                        {item.type}
                      </span>
                    </div>
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-32 object-cover rounded-md mb-3"
                      />
                    ) : null}
                    <p className="text-gray-700 text-sm line-clamp-3">{item.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Job Listings */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              {loading ? (
                <div className="text-center py-20">
                  <div className="spinner w-12 h-12 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg">Loading jobs...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="card text-center py-20">
                  <Briefcase className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-3xl font-bold mb-3 text-gray-900">No jobs found</h3>
                  <p className="text-gray-600 max-w-md mx-auto text-lg">
                    Try adjusting your search criteria or check back later for new opportunities.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {jobs.map((job) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card card-hover"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-start space-x-4 mb-4">
                            {job.organization.logo ? (
                              <img
                                src={job.organization.logo}
                                alt={job.organization.organizationName}
                                className="w-20 h-20 rounded-xl object-cover shadow-md flex-shrink-0"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                                <Briefcase className="h-10 w-10 text-gray-500" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/jobs/${job.id}`}
                                className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 block mb-1"
                              >
                                {job.title}
                              </Link>
                              <p className="text-gray-600 font-medium">{job.organization.organizationName}</p>
                            </div>
                          </div>

                          <p className="text-gray-700 mb-5 line-clamp-3 leading-relaxed">{job.description}</p>

                          <div className="flex flex-wrap gap-3 mb-5">
                            {job.location && (
                              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-gray-700">
                                <MapPin className="h-4 w-4 text-primary-600" />
                                <span className="font-medium">{job.location}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-gray-700">
                              <Briefcase className="h-4 w-4 text-primary-600" />
                              <span className="font-medium">{job.jobType.replace('_', ' ')}</span>
                            </div>
                            {job.salaryRange && (
                              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-gray-700">
                                <DollarSign className="h-4 w-4 text-primary-600" />
                                <span className="font-medium">{job.salaryRange}</span>
                              </div>
                            )}
                            {job.applicationDeadline && (
                              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm text-gray-700">
                                <Clock className="h-4 w-4 text-primary-600" />
                                <span className="font-medium">Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="btn btn-primary"
                        >
                          View Details
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
                  <h3 className="text-xl font-bold mb-4">Sidebar Updates</h3>
                  {contentLoading ? (
                    <p className="text-gray-600">Loading content...</p>
                  ) : sidebarContent.length === 0 ? (
                    <p className="text-gray-600">No updates yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {sidebarContent.map((item) => (
                        <div key={item.id} className="border border-gray-100 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{item.title}</h4>
                            <span className="inline-block bg-primary-100 text-primary-800 px-2 py-0.5 rounded text-xs">
                              {item.type}
                            </span>
                          </div>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-28 object-cover rounded-md mb-3"
                            />
                          ) : null}
                          <p className="text-sm text-gray-700 line-clamp-3">{item.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  )
}
