'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User, MapPin, Search } from 'lucide-react'
import Layout from '@/components/layout/Layout'

interface TalentProfile {
  id: string
  firstName: string
  lastName: string
  currentJobTitle?: string | null
  location?: string | null
  bio?: string | null
  profilePicture?: string | null
  competencies?: Array<{ id: string; name: string }>
}

export default function TalentPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [talents, setTalents] = useState<TalentProfile[]>([])

  const fetchTalents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type: 'talents',
        ...(query && { query }),
      })
      const response = await fetch(`/api/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTalents(data.jobSeekers || [])
      }
    } catch (error) {
      console.error('Failed to fetch talents:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTalents()
  }, [])

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50/30 to-gray-100 dark:from-gray-900 dark:via-yellow-900/10 dark:to-gray-800 py-8">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Talent</h1>
            <p className="text-gray-600 dark:text-gray-400">Find and connect with professionals.</p>
          </div>

          <div className="card mb-8 border-yellow-100 dark:border-yellow-900/30">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchTalents()}
                  placeholder="Search talent by name, job title, location, skills, competencies..."
                  className="w-full pl-10"
                  aria-label="Search talents"
                />
              </div>
              <button
                type="button"
                onClick={fetchTalents}
                className="btn bg-yellow-500 text-gray-900 hover:bg-yellow-400"
              >
                Search Talent
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading talents...</div>
          ) : talents.length === 0 ? (
            <div className="card text-center py-12">No talent profiles found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {talents.map((talent) => (
                <div key={talent.id} className="card card-hover">
                  <div className="flex items-start gap-3 mb-4">
                    {talent.profilePicture ? (
                      <img
                        src={talent.profilePicture}
                        alt={`${talent.firstName} ${talent.lastName}`}
                        className="w-14 h-14 rounded-full object-cover border border-yellow-200"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">
                        <User className="h-7 w-7 text-yellow-700" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{talent.firstName} {talent.lastName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{talent.currentJobTitle || 'Professional'}</p>
                    </div>
                  </div>
                  {talent.location && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-primary-600" />
                      <span className="truncate">{talent.location}</span>
                    </div>
                  )}
                  {talent.bio && <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">{talent.bio}</p>}
                  {talent.competencies && talent.competencies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {talent.competencies.slice(0, 3).map((skill) => (
                        <span key={skill.id} className="badge badge-warning text-xs">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link href={`/profiles/${talent.id}`} className="btn btn-outline w-full justify-center">
                    View & Contact
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
