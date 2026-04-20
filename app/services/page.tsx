'use client'

import Layout from '@/components/layout/Layout'
import Link from 'next/link'
import { Check, User, Building2, Briefcase, DollarSign, Shield, Star } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ServicesPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="container-custom relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
          >
            Our Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto"
          >
            Comprehensive solutions for job seekers, companies, and employers
          </motion.p>
        </div>
      </section>

      {/* Subscription Packages */}
      <section id="packages" className="section">
        <div className="container-custom">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900"
          >
            Subscription Packages
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Direct Package */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card border-2 border-primary-600 relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <div className="badge badge-primary flex items-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span>Popular</span>
                </div>
              </div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-4">
                  <DollarSign className="h-10 w-10 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900">Direct Package</h3>
                <div className="text-5xl font-bold text-primary-600 mb-2">$10</div>
                <p className="text-gray-600">per year</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Full profile showcase to employers',
                  'Direct contact with employers',
                  'Priority in search results',
                  'Access to all job postings',
                  'Full profile details visible',
                ].map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" className="btn btn-primary w-full justify-center text-lg py-3">
                Get Started
              </Link>
            </motion.div>

            {/* In-Direct Package */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card border-2 border-gray-300"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                  <Shield className="h-10 w-10 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900">In-Direct Package</h3>
                <div className="text-5xl font-bold text-gray-700 mb-2">$5+</div>
                <p className="text-gray-600">minimum per year</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Limited profile showcase',
                  'Contact through Lib-StaffConnect',
                  'Basic profile details visible',
                  'Access to selected job postings',
                  'Privacy protection',
                ].map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" className="btn btn-secondary w-full justify-center text-lg py-3">
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services by User Type */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900"
          >
            Services by User Type
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                id: 'job-seekers',
                icon: User,
                title: 'For Job Seekers',
                features: [
                  'Create comprehensive profiles',
                  'Showcase skills and experience',
                  'Connect with employers',
                  'Apply to job openings',
                  'Track applications',
                ],
                color: 'from-blue-50 to-blue-100',
              },
              {
                id: 'companies',
                icon: Building2,
                title: 'For Companies',
                features: [
                  'Showcase company profile',
                  'Find contract opportunities',
                  'Connect with organizations',
                  'Post service offerings',
                  'Build business network',
                ],
                color: 'from-green-50 to-green-100',
              },
              {
                id: 'employers',
                icon: Briefcase,
                title: 'For Employers',
                features: [
                  'Post job openings',
                  'Browse candidate profiles',
                  'Find contract services',
                  'Manage applications',
                  'Contact candidates',
                ],
                color: 'from-purple-50 to-purple-100',
              },
            ].map((service, index) => (
              <motion.div
                key={service.id}
                id={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card bg-gradient-to-br ${service.color}`}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-md">
                  <service.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">{service.title}</h3>
                <ul className="space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start text-gray-700">
                      <Check className="h-5 w-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}
