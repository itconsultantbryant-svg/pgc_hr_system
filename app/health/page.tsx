'use client'

import { useState } from 'react'
import Layout from '@/components/layout/Layout'

type HealthResult = {
  ok: boolean
  status: number
  message: string
  payload?: unknown
}

export default function HealthPage() {
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<HealthResult | null>(null)

  const runCheck = async () => {
    setChecking(true)
    setResult(null)

    try {
      const response = await fetch('/api/stats', { cache: 'no-store' })
      const payload = await response.json().catch(() => null)

      if (response.ok) {
        setResult({
          ok: true,
          status: response.status,
          message: 'Frontend can reach backend API successfully.',
          payload,
        })
      } else {
        setResult({
          ok: false,
          status: response.status,
          message: 'Backend API responded with an error.',
          payload,
        })
      }
    } catch (error: any) {
      setResult({
        ok: false,
        status: 0,
        message: error?.message || 'Network request failed.',
      })
    } finally {
      setChecking(false)
    }
  }

  const runDeepCheck = async () => {
    setChecking(true)
    setResult(null)

    try {
      const response = await fetch('/api/diag', { cache: 'no-store' })
      const payload = await response.json().catch(() => null)
      setResult({
        ok: response.ok,
        status: response.status,
        message: response.ok
          ? 'Backend diagnostics passed.'
          : 'Backend diagnostics failed. Check payload for exact reason.',
        payload,
      })
    } catch (error: any) {
      setResult({
        ok: false,
        status: 0,
        message: error?.message || 'Diagnostics request failed.',
      })
    } finally {
      setChecking(false)
    }
  }

  const runUploadsCheck = async () => {
    setChecking(true)
    setResult(null)

    try {
      const response = await fetch('/api/diag/uploads', { cache: 'no-store' })
      const payload = await response.json().catch(() => null)
      setResult({
        ok: response.ok,
        status: response.status,
        message: response.ok
          ? 'Uploads diagnostics passed.'
          : 'Uploads diagnostics failed. Check payload for exact reason.',
        payload,
      })
    } catch (error: any) {
      setResult({
        ok: false,
        status: 0,
        message: error?.message || 'Uploads diagnostics request failed.',
      })
    } finally {
      setChecking(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container-custom max-w-3xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-yellow-100 dark:border-yellow-900/30 shadow-sm p-6 md:p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Deployment Health Check</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Use this page after Vercel deployment to confirm the frontend can reach the backend through proxy rewrites.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={runCheck}
                disabled={checking}
                className="px-5 py-2.5 rounded-lg bg-yellow-500 text-gray-900 font-semibold hover:bg-yellow-400 disabled:opacity-60"
              >
                {checking ? 'Checking...' : 'Run API Check'}
              </button>
              <button
                type="button"
                onClick={runDeepCheck}
                disabled={checking}
                className="px-5 py-2.5 rounded-lg border border-yellow-300 text-yellow-800 font-semibold hover:bg-yellow-50 disabled:opacity-60"
              >
                {checking ? 'Checking...' : 'Run Deep Check'}
              </button>
              <button
                type="button"
                onClick={runUploadsCheck}
                disabled={checking}
                className="px-5 py-2.5 rounded-lg border border-blue-300 text-blue-800 font-semibold hover:bg-blue-50 disabled:opacity-60"
              >
                {checking ? 'Checking...' : 'Run Uploads Check'}
              </button>
            </div>

            {result && (
              <div
                className={`mt-6 rounded-lg border p-4 ${
                  result.ok
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <p className="font-semibold">
                  {result.ok ? 'PASS' : 'FAIL'} ({result.status || 'no status'})
                </p>
                <p className="mt-1">{result.message}</p>
                {result.payload ? (
                  <pre className="mt-3 max-h-64 overflow-auto rounded bg-black/5 p-3 text-xs">
                    {JSON.stringify(result.payload, null, 2)}
                  </pre>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
