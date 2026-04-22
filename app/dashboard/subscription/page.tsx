'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import DashboardPageShell from '@/components/layout/DashboardPageShell'
import { CreditCard, Check, DollarSign, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Subscription {
  id: string
  type: 'DIRECT' | 'INDIRECT'
  amount: number
  status: string
  startDate: string | null
  endDate: string | null
  payments: Payment[]
}

interface Payment {
  id: string
  amount: number
  status: string
  createdAt: string
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<'DIRECT' | 'INDIRECT' | null>(null)
  const [indirectAmount, setIndirectAmount] = useState('5')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      fetchSubscriptions()
    }
  }, [status, router])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/subscriptions')
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (type: 'DIRECT' | 'INDIRECT', amount: number) => {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, amount }),
      })

      if (response.ok) {
        toast.success('Subscription created! Payment is pending approval.')
        await fetchSubscriptions()
        setSelectedPackage(null)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to create subscription')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const activeSubscription = subscriptions.find((sub) => sub.status === 'ACTIVE')

  if (loading || status === 'loading') {
    return (
      <DashboardPageShell title="Subscription">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardPageShell>
    )
  }

  return (
    <DashboardPageShell title="Subscription">
      <div className="max-w-6xl">
          <h1 className="mb-8 text-2xl font-bold lg:hidden">Subscription Management</h1>

          {activeSubscription ? (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Active Subscription</h2>
                  <p className="text-gray-600">
                    Package: {activeSubscription.type === 'DIRECT' ? 'Direct' : 'In-Direct'}
                  </p>
                  <p className="text-gray-600">Amount: ${activeSubscription.amount}/year</p>
                  {activeSubscription.endDate && (
                    <p className="text-gray-600">
                      Expires: {new Date(activeSubscription.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full">
                  Active
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Choose a Package</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Direct Package */}
                <div className="border-2 border-primary-600 rounded-lg p-6 bg-white shadow-lg">
                  <div className="text-center mb-6">
                    <DollarSign className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Direct Package</h3>
                    <div className="text-4xl font-bold text-primary-600 mb-2">$10</div>
                    <p className="text-gray-600">per year</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Full profile showcase</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Direct contact with employers</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Priority in search results</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Access to all job postings</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => handleSubscribe('DIRECT', 10)}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Subscribe Now
                  </button>
                </div>

                {/* In-Direct Package */}
                <div className="border-2 border-gray-300 rounded-lg p-6 bg-white shadow-lg">
                  <div className="text-center mb-6">
                    <Shield className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">In-Direct Package</h3>
                    <div className="text-4xl font-bold text-gray-600 mb-2">$5+</div>
                    <p className="text-gray-600">minimum per year</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Limited profile showcase</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Contact through Lib-StaffConnect</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Basic profile details visible</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Privacy protection</span>
                    </li>
                  </ul>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (minimum $5)
                    </label>
                    <input
                      type="number"
                      min="5"
                      step="0.01"
                      value={indirectAmount}
                      onChange={(e) => setIndirectAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <button
                    onClick={() => handleSubscribe('INDIRECT', parseFloat(indirectAmount))}
                    className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Subscribe Now
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-yellow-100">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-yellow-700" />
              <h2 className="text-2xl font-semibold">Payment Methods</h2>
            </div>
            <p className="text-gray-600 mb-5">
              After creating your subscription request, pay using one of the options below. Your
              subscription is activated only after admin payment approval.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">MTN Mobile Money</h3>
                <p className="text-sm text-gray-600 mt-1">Merchant Number</p>
                <p className="text-xl font-bold text-gray-900 mt-1">0887417954</p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Orange Money</h3>
                <p className="text-sm text-gray-600 mt-1">Merchant Number</p>
                <p className="text-xl font-bold text-gray-900 mt-1">8644338</p>
              </div>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Inquiry</h3>
              <p className="text-sm text-gray-700 mb-3">
                For inquiries related to payments or bank transfers, please contact us:
              </p>
              <div className="text-sm text-gray-800 space-y-1">
                <p>+231(0)-774-917-393 / +231(0)-887-917-393</p>
                <p>
                  <a
                    href="mailto:info@prinstinegroup.org"
                    className="text-primary-700 hover:text-primary-800 underline"
                  >
                    info@prinstinegroup.org
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Subscription History */}
          {subscriptions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Subscription History</h2>
              <div className="space-y-4">
                {subscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">
                          {subscription.type === 'DIRECT' ? 'Direct' : 'In-Direct'} Package
                        </h3>
                        <p className="text-gray-600">${subscription.amount}/year</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          subscription.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : subscription.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {subscription.status}
                      </span>
                    </div>
                    {subscription.payments && subscription.payments.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>
                          Latest Payment: ${subscription.payments[0].amount} -{' '}
                          {subscription.payments[0].status} (
                          {new Date(subscription.payments[0].createdAt).toLocaleDateString()})
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </DashboardPageShell>
  )
}
