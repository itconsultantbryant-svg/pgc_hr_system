'use client'

import Layout from '@/components/layout/Layout'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function PrivacyPage() {
  return (
    <Layout>
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 py-16 text-white md:py-20">
        <div className="container-custom relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight md:text-4xl"
          >
            Privacy policy
          </motion.h1>
          <p className="mx-auto mt-3 max-w-2xl text-primary-100">
            How we handle information when you use the Prinstine Group Careers platform.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-custom max-w-3xl space-y-8 text-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Information we collect</h2>
            <p className="mt-2 leading-relaxed">
              We collect information you provide when you register, build a profile, apply to roles, or contact
              us—such as name, email, employment details, and documents you choose to upload. We also collect
              technical data needed to run the service (for example IP address, browser type, and usage logs)
              where permitted by law.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">How we use information</h2>
            <p className="mt-2 leading-relaxed">
              We use this information to operate the platform, match candidates with opportunities, communicate
              with you about your account, improve security, and comply with legal obligations. Employers and
              organizations you interact with may receive application materials you submit as part of the hiring
              process.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Retention and security</h2>
            <p className="mt-2 leading-relaxed">
              We retain data as long as needed to provide the service and meet legal requirements. We apply
              reasonable technical and organizational measures to protect personal data.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your choices</h2>
            <p className="mt-2 leading-relaxed">
              You may update profile information in your dashboard where available, or contact us to ask about
              access, correction, or deletion, subject to applicable law.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            This page is a general summary and may be updated. For legal questions, consult your own counsel or
            reach us via{' '}
            <Link href="/contact" className="text-primary-600 hover:text-primary-800">
              contact
            </Link>
            .
          </p>
        </div>
      </section>
    </Layout>
  )
}
