'use client'

import Layout from '@/components/layout/Layout'
import { useState, useEffect } from 'react'
import { Search, Filter, Briefcase, Users, Building2, TrendingUp, User, MapPin } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    type: 'all' // all, job-seekers, companies
  })
  const [profiles, setProfiles] = useState<any>({ jobSeekers: [], companies: [] })
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    jobSeekers: 0,
    companies: 0,
    jobOpenings: 0,
    successRate: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [homepageContent, setHomepageContent] = useState<ContentItem[]>([])
  const [contentLoading, setContentLoading] = useState(true)

  useEffect(() => {
    fetchProfiles()
    fetchStats()
  }, [filters])

  useEffect(() => {
    fetchHomepageContent()
    const interval = setInterval(fetchHomepageContent, 20000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setStats({
          jobSeekers: data.jobSeekers || 0,
          companies: data.companies || 0,
          jobOpenings: data.jobOpenings || 0,
          successRate: data.successRate || 0,
        })
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type: filters.type,
        ...(filters.category && { category: filters.category }),
        ...(filters.location && { location: filters.location }),
        ...(searchQuery && { search: searchQuery }),
      })
      const response = await fetch(`/api/profiles/public?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProfiles(data)
      }
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHomepageContent = async () => {
    try {
      setContentLoading(true)
      const response = await fetch('/api/content?position=homepage', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setHomepageContent(data)
      }
    } catch (error) {
      console.error('Error fetching homepage content:', error)
    } finally {
      setContentLoading(false)
    }
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 md:py-28 lg:py-32 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Connect with <span className="text-primary-200">Opportunities</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-primary-100 leading-relaxed">
              Find your next career move or contract opportunity with Lib-StaffConnect
            </p>
            
            {/* Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-3 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex-1 flex items-center space-x-3 px-4">
                  <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by skills, job title, company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && fetchProfiles()}
                    className="flex-1 border-none outline-none text-gray-900 bg-transparent text-lg placeholder-gray-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchProfiles}
                  className="btn btn-primary whitespace-nowrap px-8 py-3 text-lg"
                >
                  Search
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section bg-white dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-md">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {statsLoading ? (
                  <span className="text-gray-400 animate-pulse">...</span>
                ) : stats.jobSeekers > 0 ? (
                  `${stats.jobSeekers.toLocaleString()}${stats.jobSeekers >= 1000 ? '+' : ''}`
                ) : (
                  '0'
                )}
              </div>
              <div className="text-gray-700 font-medium">Active Job Seekers</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-md">
                <Building2 className="h-8 w-8 text-primary-600" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {statsLoading ? (
                  <span className="text-gray-400 animate-pulse">...</span>
                ) : stats.companies > 0 ? (
                  `${stats.companies.toLocaleString()}${stats.companies >= 1000 ? '+' : ''}`
                ) : (
                  '0'
                )}
              </div>
              <div className="text-gray-700 font-medium">Companies</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-md">
                <Briefcase className="h-8 w-8 text-primary-600" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {statsLoading ? (
                  <span className="text-gray-400 animate-pulse">...</span>
                ) : stats.jobOpenings > 0 ? (
                  `${stats.jobOpenings.toLocaleString()}${stats.jobOpenings >= 1000 ? '+' : ''}`
                ) : (
                  '0'
                )}
              </div>
              <div className="text-gray-700 font-medium">Job Openings</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-md">
                <TrendingUp className="h-8 w-8 text-primary-600" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {statsLoading ? (
                  <span className="text-gray-400 animate-pulse">...</span>
                ) : (
                  `${stats.successRate}%`
                )}
              </div>
              <div className="text-gray-700 font-medium">Success Rate</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Homepage Content */}
      <section className="section bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Latest Updates</h2>
          </div>
          {contentLoading ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading content...</div>
            </div>
          ) : homepageContent.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600 dark:text-gray-400">No updates yet.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {homepageContent.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-100 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">{item.title}</h3>
                      <span className="inline-block bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs">
                        {item.type}
                      </span>
                    </div>
                  </div>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  ) : null}
                  <p className="text-gray-700 text-sm line-clamp-3">{item.content}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">Filters:</span>
            </div>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All</option>
              <option value="job-seekers">Job Seekers</option>
              <option value="companies">Companies</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Categories</option>
              <option value="technology">Technology</option>
              <option value="finance">Finance</option>
              <option value="healthcare">Healthcare</option>
              <option value="education">Education</option>
            </select>
            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>
      </section>

      {/* Profiles Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Featured Profiles</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600 dark:text-gray-400">Loading profiles...</div>
            </div>
          ) : profiles.jobSeekers.length === 0 && profiles.companies.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">No profiles found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Be the first to create a profile and start connecting!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Job Seeker Profiles */}
              {profiles.jobSeekers.map((profile: any) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card card-hover group"
                >
                  <div className="flex items-start space-x-4 mb-4">
                    {profile.profilePicture ? (
                      <img
                        src={profile.profilePicture}
                        alt={`${profile.firstName} ${profile.lastName}`}
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary-100 group-hover:border-primary-300 transition-colors"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center border-2 border-primary-200">
                        <User className="h-8 w-8 text-primary-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
                        {profile.firstName} {profile.lastName}
                      </h3>
                      <p className="text-gray-600 text-sm truncate">{profile.currentJobTitle || 'Professional'}</p>
                    </div>
                  </div>
                  {profile.bio && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">{profile.bio}</p>
                  )}
                  {profile.location && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex items-center">
                      <MapPin className="h-4 w-4 mr-1.5 text-primary-500 flex-shrink-0" />
                      <span className="truncate">{profile.location}</span>
                    </p>
                  )}
                  {profile.competencies && profile.competencies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {profile.competencies.slice(0, 3).map((comp: any) => (
                        <span
                          key={comp.id}
                          className="badge badge-primary text-xs"
                        >
                          {comp.name}
                        </span>
                      ))}
                      {profile.competencies.length > 3 && (
                        <span className="badge badge-gray text-xs">
                          +{profile.competencies.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  <Link
                    href={`/profiles/${profile.id}`}
                    className="btn btn-outline w-full justify-center group-hover:bg-primary-600 group-hover:text-white transition-all"
                  >
                    View Profile
                  </Link>
                </motion.div>
              ))}

              {/* Company Profiles */}
              {profiles.companies.map((company: any) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card card-hover group"
                >
                  <div className="flex items-start space-x-4 mb-4">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.companyName}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-gray-100 group-hover:border-primary-200 transition-colors"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-gray-200">
                        <Building2 className="h-8 w-8 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{company.companyName}</h3>
                      <p className="text-gray-600 text-sm truncate">{company.industry || 'Company'}</p>
                    </div>
                  </div>
                  {company.description && (
                    <p className="text-gray-700 mb-4 line-clamp-2 leading-relaxed">{company.description}</p>
                  )}
                  {company.location && (
                    <p className="text-gray-600 text-sm mb-4 flex items-center">
                      <MapPin className="h-4 w-4 mr-1.5 text-primary-500 flex-shrink-0" />
                      <span className="truncate">{company.location}</span>
                    </p>
                  )}
                  <Link
                    href={`/profiles/${company.id}`}
                    className="btn btn-outline w-full justify-center group-hover:bg-primary-600 group-hover:text-white transition-all"
                  >
                    View Company
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of professionals and companies on our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Account
            </Link>
            <Link
              href="/services"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
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
