import { Suspense } from 'react'

export default function ApplicationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-gray-500">Loading…</div>
      }
    >
      {children}
    </Suspense>
  )
}
