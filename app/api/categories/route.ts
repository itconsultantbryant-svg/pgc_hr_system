import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/client'

export const dynamic = 'force-dynamic'

const FALLBACK_CATEGORIES = [
  'Healthcare',
  'Construction',
  'Security',
  'Driver & Logistics',
  'Cleaning & Housekeeping',
  'Customer Service',
  'Sales & Marketing',
  'Admin & Office Support',
  'Information Technology',
  'Education & Training',
  'Engineering & Technical',
  'Finance & Accounting',
]

export async function GET() {
  try {
    const categories = await prisma.jobCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Fallback list prevents category dropdown from breaking on transient DB/migration issues.
    return NextResponse.json(
      FALLBACK_CATEGORIES.map((name, index) => ({
        id: `fallback-${index + 1}`,
        name,
      }))
    )
  }
}
