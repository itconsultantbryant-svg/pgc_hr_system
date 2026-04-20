'use client'

import Layout from '@/components/layout/Layout'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function TermsPage() {
  return (
    <Layout>
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 py-16 text-white md:py-20">
        <div className="container-custom relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold tracking-tight md:text-4xl"
          >
            Terms of use
          </motion.h1>
          <p className="mx-auto mt-3 max-w-2xl text-primary-100">
            Rules for using the Lib-StaffConnect Careers platform.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-custom max-w-3xl space-y-8 text-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Agreement</h2>
            <p className="mt-2 leading-relaxed">
              By accessing or using this website and related services, you agree to these terms. If you do not
              agree, do not use the platform.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Accounts</h2>
            <p className="mt-2 leading-relaxed">
              You are responsible for keeping your login credentials secure and for activity under your account.
              You must provide accurate registration information and comply with applicable laws when posting
              jobs, applying, or messaging other users.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Content and conduct</h2>
            <p className="mt-2 leading-relaxed">
              You may not misuse the service, attempt unauthorized access, scrape data in violation of these
              terms, or upload unlawful or harmful content. We may suspend or terminate accounts that violate
              these rules or threaten platform integrity.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Disclaimers</h2>
            <p className="mt-2 leading-relaxed">
              The platform is provided &quot;as is.&quot; We do not guarantee specific hiring outcomes. Listings
              and applications are supplied by users and organizations; you should verify important information
              independently.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Changes</h2>
            <p className="mt-2 leading-relaxed">
              We may update these terms from time to time. Continued use after changes constitutes acceptance of
              the revised terms.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            This summary is not legal advice. For questions, use{' '}
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
