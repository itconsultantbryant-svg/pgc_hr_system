'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'

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

export default function Footer() {
  const [footerContent, setFooterContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFooterContent()
    const interval = setInterval(fetchFooterContent, 20000)
    return () => clearInterval(interval)
  }, [])

  const fetchFooterContent = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/content?position=footer', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setFooterContent(data)
      }
    } catch (error) {
      console.error('Error fetching footer content:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/libstaffconnect-logo.png"
                alt="Libstaffconnect Logo"
                className="h-10 w-auto object-contain"
              />
              <span className="text-xl font-bold text-white">Lib-StaffConnect</span>
            </div>
            <p className="text-sm">
              Connecting professionals, companies, and employers on a comprehensive platform
              for employment and contract opportunities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-primary-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-primary-400 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-primary-400 transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services#job-seekers" className="hover:text-primary-400 transition-colors">
                  For Job Seekers
                </Link>
              </li>
              <li>
                <Link href="/services#companies" className="hover:text-primary-400 transition-colors">
                  For Companies
                </Link>
              </li>
              <li>
                <Link href="/services#employers" className="hover:text-primary-400 transition-colors">
                  For Employers
                </Link>
              </li>
              <li>
                <Link href="/services#packages" className="hover:text-primary-400 transition-colors">
                  Subscription Packages
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Mail className="h-5 w-5 mt-0.5 text-primary-400 flex-shrink-0" />
                <a href="mailto:info@prinstinegroup.org" className="hover:text-primary-400 transition-colors">
                  info@prinstinegroup.org
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="h-5 w-5 mt-0.5 text-primary-400 flex-shrink-0" />
                <a href="tel:+231774917393" className="hover:text-primary-400 transition-colors">
                  0774917393
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 mt-0.5 text-primary-400 flex-shrink-0" />
                <span>PA Rib House Junction, Airfield Sinkor, Monrovia-Liberia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-white font-semibold mb-4">Footer Updates</h3>
          {loading ? (
            <p className="text-sm text-gray-400">Loading updates...</p>
          ) : footerContent.length === 0 ? (
            <p className="text-sm text-gray-400">No updates yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {footerContent.map((item) => (
                <div key={item.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold text-sm">{item.title}</h4>
                    <span className="inline-block bg-primary-700 text-white px-2 py-0.5 rounded text-[10px]">
                      {item.type}
                    </span>
                  </div>
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-24 object-cover rounded-md mb-2"
                    />
                  ) : null}
                  <p className="text-xs text-gray-300 line-clamp-3">{item.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Prinstine Group of Companies. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-sm hover:text-primary-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm hover:text-primary-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-center md:justify-start gap-3 text-sm text-gray-400">
            <span>
              Powered by:{' '}
              <a
                href="https://prinstinegroup.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 underline underline-offset-2"
              >
                Prinstine Group of Companies
              </a>
            </span>
            <img
              src="/prinstine_job_platform.png"
              alt="Prinstine Group Logo"
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
