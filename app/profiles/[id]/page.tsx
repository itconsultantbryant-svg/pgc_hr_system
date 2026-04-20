'use client'

import Layout from '@/components/layout/Layout'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { User, Building2, MapPin, Mail, Phone, Briefcase, GraduationCap, Award, DollarSign, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface Profile {
  id: string
  type: 'job-seeker' | 'company'
  hasDirectPackage?: boolean
  jobSeeker?: {
    id: string
    firstName: string
    lastName: string
    bio: string
    location: string
    category?: string
    jobCategory?: string
    currentJobTitle: string
    expectedSalary: string
    profilePicture: string
    phone?: string | null
    whatsappNumber?: string | null
    experiences: any[]
    educations: any[]
    competencies: any[]
    languages: any[]
    references: any[]
    hasDirectPackage?: boolean
    user: {
      email: string | null
      subscriptions?: Array<{ type: string; status: string }>
    }
  }
  company?: {
    id: string
    companyName: string
    description: string
    location: string
    industry: string
    logo: string
    website: string
    phone: string | null
    email: string | null
    services: string
    hasDirectPackage?: boolean
    currentPerformance?: string | null
    previousPerformance?: string | null
    currentClients?: string | null
    previousClients?: string | null
    revenueGenerated?: string | null
    contractCompletionAbility?: string | null
    otherDetails?: string | null
    executives?: Array<{ id: string; name: string; role: string; bio?: string | null; profileImage?: string | null }>
  }
}

const PLATFORM_CONTACT = {
  email: 'info@prinstinegroup.org',
  phone: '+231774917393',
  whatsapp: '+231774917393',
}

export default function ProfileDetailPage() {
  const params = useParams()
  const profileId = params.id as string
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profileId) {
      fetchProfile()
    }
  }, [profileId])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/profiles/${profileId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.type === 'job-seeker') {
          const { type, ...jobSeeker } = data
          setProfile({
            id: data.id,
            type: 'job-seeker',
            jobSeeker,
          })
        } else if (data.type === 'company') {
          const { type, ...company } = data
          setProfile({
            id: data.id,
            type: 'company',
            company,
          })
        } else {
          toast.error('Profile type not supported')
        }
      } else {
        toast.error('Profile not found')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-lg text-gray-700 dark:text-gray-300">Loading profile...</div>
        </div>
      </Layout>
    )
  }

  if (!profile) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Profile Not Found</h1>
            <Link href="/" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              Return to Home
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const isDirectPackage = !!profile.jobSeeker?.hasDirectPackage

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
          >
            ← Back to Home
          </Link>

          {profile.type === 'job-seeker' && profile.jobSeeker ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                  {profile.jobSeeker.profilePicture ? (
                    <img
                      src={profile.jobSeeker.profilePicture}
                      alt={`${profile.jobSeeker.firstName} ${profile.jobSeeker.lastName}`}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="h-16 w-16 text-white" />
                    </div>
                  )}
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold mb-2">
                      {profile.jobSeeker.firstName} {profile.jobSeeker.lastName}
                    </h1>
                    <p className="text-xl text-primary-100 mb-2">{profile.jobSeeker.currentJobTitle}</p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-primary-100">
                      {profile.jobSeeker.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{profile.jobSeeker.location}</span>
                        </div>
                      )}
                      {(profile.jobSeeker.category || profile.jobSeeker.jobCategory) && (
                        <div className="flex items-center space-x-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{profile.jobSeeker.category || profile.jobSeeker.jobCategory}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-8">
                {/* Bio */}
                {profile.jobSeeker.bio && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">About</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profile.jobSeeker.bio}</p>
                  </div>
                )}

                {/* Contact - Only for Direct package: WhatsApp, Phone, Email */}
                {isDirectPackage && (profile.jobSeeker.user?.email || profile.jobSeeker.phone || profile.jobSeeker.whatsappNumber) && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Contact</h2>
                    <div className="space-y-3">
                      {profile.jobSeeker.whatsappNumber && (
                        <a
                          href={`https://wa.me/${profile.jobSeeker.whatsappNumber.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                          <MessageCircle className="h-5 w-5" />
                          WhatsApp: {profile.jobSeeker.whatsappNumber}
                        </a>
                      )}
                      {profile.jobSeeker.phone && (
                        <a
                          href={`tel:${profile.jobSeeker.phone}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                        >
                          <Phone className="h-5 w-5" />
                          Call: {profile.jobSeeker.phone}
                        </a>
                      )}
                      {profile.jobSeeker.user?.email && (
                        <a
                          href={`mailto:${profile.jobSeeker.user.email}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition-colors"
                        >
                          <Mail className="h-5 w-5" />
                          Email: {profile.jobSeeker.user.email}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Expected Salary - only when Direct package */}
                {isDirectPackage && profile.jobSeeker.expectedSalary && (
                  <div className="flex items-center space-x-2 text-lg">
                    <DollarSign className="h-5 w-5 text-primary-600" />
                    <span className="font-semibold">Expected Salary:</span>
                    <span>{profile.jobSeeker.expectedSalary}</span>
                  </div>
                )}

                {/* Competencies - only when Direct package */}
                {isDirectPackage && profile.jobSeeker.competencies && profile.jobSeeker.competencies.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
                      <Award className="h-6 w-6 mr-2 text-primary-600 dark:text-primary-400" />
                      Skills & Competencies
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.jobSeeker.competencies.map((comp: any) => (
                        <span
                          key={comp.id}
                          className="bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 px-4 py-2 rounded-full"
                        >
                          {comp.name} {comp.level && `(${comp.level})`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience - only when Direct package */}
                {isDirectPackage && profile.jobSeeker.experiences && profile.jobSeeker.experiences.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4 flex items-center">
                      <Briefcase className="h-6 w-6 mr-2 text-primary-600" />
                      Experience
                    </h2>
                    <div className="space-y-4">
                      {profile.jobSeeker.experiences.map((exp: any) => (
                        <div key={exp.id} className="border-l-4 border-primary-600 pl-4">
                          <h3 className="font-semibold text-lg">{exp.position || exp.jobTitle}</h3>
                          <p className="text-primary-600">{exp.company}</p>
                          <p className="text-gray-600 text-sm">
                            {exp.startDate && new Date(exp.startDate).toLocaleDateString()} -{' '}
                            {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                          </p>
                          {exp.description && (
                            <p className="text-gray-700 mt-2">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education - only when Direct package */}
                {isDirectPackage && profile.jobSeeker.educations && profile.jobSeeker.educations.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-4 flex items-center">
                      <GraduationCap className="h-6 w-6 mr-2 text-primary-600" />
                      Education
                    </h2>
                    <div className="space-y-4">
                      {profile.jobSeeker.educations.map((edu: any) => (
                        <div key={edu.id} className="border-l-4 border-primary-600 pl-4">
                          <h3 className="font-semibold text-lg">{edu.degree}</h3>
                          <p className="text-primary-600">{edu.institution}</p>
                          <p className="text-gray-600 text-sm">
                            {edu.startDate && new Date(edu.startDate).toLocaleDateString()} -{' '}
                            {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Indirect package contact route */}
                {!isDirectPackage && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                    <p className="text-yellow-800">
                      This profile uses an Indirect subscription. To hire this professional, contact Prinstine Group of Companies first.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={`https://wa.me/${PLATFORM_CONTACT.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                      >
                        <MessageCircle className="h-5 w-5" />
                        WhatsApp: {PLATFORM_CONTACT.whatsapp}
                      </a>
                      <a
                        href={`tel:${PLATFORM_CONTACT.phone}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                      >
                        <Phone className="h-5 w-5" />
                        Call: {PLATFORM_CONTACT.phone}
                      </a>
                      <a
                        href={`mailto:${PLATFORM_CONTACT.email}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition-colors"
                      >
                        <Mail className="h-5 w-5" />
                        Email: {PLATFORM_CONTACT.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : profile.type === 'company' && profile.company ? (
            (() => {
              const companyDirect = !!profile.company.hasDirectPackage
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                      {profile.company.logo ? (
                        <img
                          src={profile.company.logo}
                          alt={profile.company.companyName}
                          className="w-32 h-32 rounded-lg object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-lg bg-white/20 flex items-center justify-center">
                          <Building2 className="h-16 w-16 text-white" />
                        </div>
                      )}
                      <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold mb-2">{profile.company.companyName}</h1>
                        {profile.company.industry && (
                          <p className="text-xl text-primary-100 mb-2">{profile.company.industry}</p>
                        )}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-primary-100">
                          {profile.company.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{profile.company.location}</span>
                            </div>
                          )}
                          {companyDirect && profile.company.website && (
                            <a
                              href={profile.company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 hover:text-white"
                            >
                              <span>Visit Website</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-8">
                    {/* Description - basic, always show */}
                    {profile.company.description && (
                      <div>
                        <h2 className="text-2xl font-semibold mb-4">About</h2>
                        <p className="text-gray-700 leading-relaxed">{profile.company.description}</p>
                      </div>
                    )}

                    {/* Direct package only: Services, Performance, Clients, Revenue, Executives, Contract ability, Other, Contact */}
                    {companyDirect && (
                      <>
                        {profile.company.services && (
                          <div>
                            <h2 className="text-2xl font-semibold mb-4">Services</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{profile.company.services}</p>
                          </div>
                        )}

                        {profile.company.currentPerformance && (
                          <div>
                            <h2 className="text-2xl font-semibold mb-4">Current performance</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{profile.company.currentPerformance}</p>
                          </div>
                        )}
                        {profile.company.previousPerformance && (
                          <div>
                            <h2 className="text-2xl font-semibold mb-4">Previous performance</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{profile.company.previousPerformance}</p>
                          </div>
                        )}
                        {profile.company.currentClients && (
                          <div>
                            <h2 className="text-2xl font-semibold mb-4">Current clients</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{profile.company.currentClients}</p>
                          </div>
                        )}
                        {profile.company.previousClients && (
                          <div>
                            <h2 className="text-2xl font-semibold mb-4">Previous clients</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{profile.company.previousClients}</p>
                          </div>
                        )}
                        {profile.company.revenueGenerated && (
                          <div>
                            <h2 className="text-2xl font-semibold mb-4">Revenue generated</h2>
                            <p className="text-gray-700">{profile.company.revenueGenerated}</p>
                          </div>
                        )}
                        {profile.company.contractCompletionAbility && (
                          <div>
                            <h2 className="text-2xl font-semibold mb-4">Contract completion ability</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{profile.company.contractCompletionAbility}</p>
                          </div>
                        )}
                        {profile.company.otherDetails && (
                          <div>
                            <h2 className="text-2xl font-semibold mb-4">Other details</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{profile.company.otherDetails}</p>
                          </div>
                        )}

                        {profile.company.executives && profile.company.executives.length > 0 && (
                          <div>
                            <h2 className="text-2xl font-semibold mb-4">Company executives</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {profile.company.executives.map((exec: any) => (
                                <div key={exec.id} className="border border-gray-200 rounded-lg p-4 flex gap-4">
                                  {exec.profileImage ? (
                                    <img src={exec.profileImage} alt={exec.name} className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
                                  ) : (
                                    <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                                      <User className="h-10 w-10 text-primary-600" />
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="font-semibold text-lg text-gray-900">{exec.name}</h3>
                                    <p className="text-primary-600 font-medium">{exec.role}</p>
                                    {exec.bio && <p className="text-gray-600 text-sm mt-2">{exec.bio}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h2 className="text-2xl font-semibold mb-4">Contact information</h2>
                          <div className="space-y-2">
                            {profile.company.email && (
                              <div className="flex items-center space-x-2">
                                <Mail className="h-5 w-5 text-primary-600" />
                                <a href={`mailto:${profile.company.email}`} className="text-primary-600 hover:underline">
                                  {profile.company.email}
                                </a>
                              </div>
                            )}
                            {profile.company.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-5 w-5 text-primary-600" />
                                <a href={`tel:${profile.company.phone}`} className="text-primary-600 hover:underline">
                                  {profile.company.phone}
                                </a>
                              </div>
                            )}
                            {!profile.company.email && !profile.company.phone && (
                              <p className="text-gray-500">No contact details listed.</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {!companyDirect && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                        <p className="text-yellow-800">
                          This company uses an Indirect package. To hire this company, contact Prinstine Group of Companies first.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <a
                            href={`https://wa.me/${PLATFORM_CONTACT.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                          >
                            <MessageCircle className="h-5 w-5" />
                            WhatsApp: {PLATFORM_CONTACT.whatsapp}
                          </a>
                          <a
                            href={`tel:${PLATFORM_CONTACT.phone}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                          >
                            <Phone className="h-5 w-5" />
                            Call: {PLATFORM_CONTACT.phone}
                          </a>
                          <a
                            href={`mailto:${PLATFORM_CONTACT.email}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition-colors"
                          >
                            <Mail className="h-5 w-5" />
                            Email: {PLATFORM_CONTACT.email}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })()
          ) : null}
        </div>
      </div>
    </Layout>
  )
}

