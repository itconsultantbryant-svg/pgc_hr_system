import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/client'
import { mapJobSeekerProfileUrls } from '@/lib/profileMediaUrl'

// GET - Get public profile by ID (for profile detail page)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const profileId = params.id

    // Try to find as job seeker profile
    const jobSeekerProfile = await prisma.jobSeekerProfile.findUnique({
      where: { id: profileId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            subscriptions: {
              where: { status: 'ACTIVE' },
              include: {
                payments: {
                  where: { status: 'APPROVED' },
                  take: 1,
                },
              },
            },
          },
        },
        experiences: { orderBy: { startDate: 'desc' } },
        educations: { orderBy: { startDate: 'desc' } },
        competencies: true,
        references: true,
        languages: true,
      },
    })

    if (jobSeekerProfile && jobSeekerProfile.isVisible) {
      const { user, experiences, educations, competencies, references, languages, ...rest } = jobSeekerProfile
      const mediaRest = mapJobSeekerProfileUrls(rest)
      // Direct package = ACTIVE subscription with type DIRECT and at least one APPROVED payment
      const hasDirectPackage = user.subscriptions.some(
        (sub) => sub.type === 'DIRECT' && sub.payments && sub.payments.length > 0
      )
      const profileData: Record<string, unknown> = {
        ...mediaRest,
        type: 'job-seeker',
        hasDirectPackage,
        user: {
          id: user.id,
          email: hasDirectPackage ? user.email : null,
        },
        experiences: hasDirectPackage ? experiences : [],
        educations: hasDirectPackage ? educations : [],
        competencies: hasDirectPackage ? competencies : [],
        references: hasDirectPackage ? references : [],
        languages: hasDirectPackage ? languages : [],
      }
      if (!hasDirectPackage) {
        profileData.phone = null
        profileData.whatsappNumber = null
      }
      return NextResponse.json(profileData)
    }

    // Try to find as company profile
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { id: profileId },
      include: {
        user: {
          select: {
            id: true,
            subscriptions: {
              where: { status: 'ACTIVE' },
              include: {
                payments: {
                  where: { status: 'APPROVED' },
                  take: 1,
                },
              },
            },
          },
        },
        executives: { orderBy: { order: 'asc' } },
      },
    })

    if (companyProfile && companyProfile.isVisible) {
      const { user, executives, ...rest } = companyProfile
      const hasDirectPackage = user.subscriptions.some(
        (sub) => sub.type === 'DIRECT' && sub.payments && sub.payments.length > 0
      )
      const profileData: Record<string, unknown> = {
        ...rest,
        type: 'company',
        hasDirectPackage,
        executives: hasDirectPackage ? executives : [],
        currentPerformance: hasDirectPackage ? rest.currentPerformance : null,
        previousPerformance: hasDirectPackage ? rest.previousPerformance : null,
        currentClients: hasDirectPackage ? rest.currentClients : null,
        previousClients: hasDirectPackage ? rest.previousClients : null,
        revenueGenerated: hasDirectPackage ? rest.revenueGenerated : null,
        contractCompletionAbility: hasDirectPackage ? rest.contractCompletionAbility : null,
        otherDetails: hasDirectPackage ? rest.otherDetails : null,
      }
      if (!hasDirectPackage) {
        profileData.phone = null
        profileData.email = null
        profileData.website = null
      }
      return NextResponse.json(profileData)
    }

    // Try to find as organization profile
    const organizationProfile = await prisma.organizationProfile.findUnique({
      where: { id: profileId },
    })

    if (organizationProfile && organizationProfile.isVisible) {
      const { ...profileData } = organizationProfile
      return NextResponse.json({
        ...profileData,
        type: 'organization',
      })
    }

    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

