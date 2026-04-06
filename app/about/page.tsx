'use client'

import Layout from '@/components/layout/Layout'
import { Building2, Users, Target, Award, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AboutPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="container-custom relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
          >
            About Prinstine Group
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto leading-relaxed"
          >
            Connecting talent with opportunity through innovative technology and personalized service
          </motion.p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Our Mission</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Prinstine Group of Companies is dedicated to creating a comprehensive platform
                  that bridges the gap between job seekers, companies seeking contracts, and employers
                  looking for talent. We believe in empowering individuals and organizations by
                  providing transparent, efficient, and accessible employment and contracting solutions.
                </p>
                <p>
                  Our platform serves as a trusted intermediary, ensuring that all parties benefit
                  from meaningful connections and opportunities.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="card bg-gradient-to-br from-primary-50 to-primary-100"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-md">
                <Building2 className="h-10 w-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Building Connections</h3>
              <p className="text-gray-700 leading-relaxed">
                We facilitate connections that drive career growth and business success through
                innovative technology and personalized service.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section bg-gray-50">
        <div className="container-custom">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900"
          >
            Our Values
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'People First',
                description: 'We prioritize the needs and aspirations of our users, ensuring every interaction adds value to their journey.',
                color: 'from-blue-50 to-blue-100',
              },
              {
                icon: Target,
                title: 'Excellence',
                description: 'We strive for excellence in everything we do, from platform design to customer service.',
                color: 'from-green-50 to-green-100',
              },
              {
                icon: Award,
                title: 'Integrity',
                description: 'We operate with transparency and honesty, building trust through consistent actions.',
                color: 'from-purple-50 to-purple-100',
              },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card bg-gradient-to-br ${value.color} text-center`}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-md">
                  <value.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{value.title}</h3>
                <p className="text-gray-700 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="section">
        <div className="container-custom max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900"
          >
            What We Offer
          </motion.h2>
          <div className="space-y-6">
            {[
              {
                title: 'For Job Seekers',
                description: 'Create comprehensive profiles showcasing your skills, experience, and education. Connect directly with employers or through our intermediary services.',
              },
              {
                title: 'For Companies',
                description: 'Showcase your company and services to organizations seeking contract opportunities. Access a network of potential clients and projects.',
              },
              {
                title: 'For Employers',
                description: 'Find the right talent for your organization. Post job openings and connect with qualified candidates through our comprehensive platform.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card border-l-4 border-primary-600"
              >
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{item.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}
