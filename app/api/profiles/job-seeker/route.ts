import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/prisma/client'
import { canonicalUploadRef, mapJobSeekerProfileUrls } from '@/lib/profileMediaUrl'

export const dynamic = 'force-dynamic'

const isPersistentImageUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('blob:')) return false
  if (/^https?:\/\//i.test(trimmed)) return true
  return trimmed.startsWith('/uploads/')
}

const normalizeProfilePictures = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  const unique = new Set<string>()
  for (const item of value) {
    if (!isPersistentImageUrl(item)) continue
    const c = canonicalUploadRef(item as string)
    if (c) unique.add(c)
  }
  return Array.from(unique).slice(0, 3)
}

const normalizeSinglePicture = (value: unknown): string | null => {
  if (!isPersistentImageUrl(value)) return null
  return canonicalUploadRef(value as string)
}

// GET - Get job seeker profile
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.jobSeekerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        experiences: { orderBy: { startDate: 'desc' } },
        educations: { orderBy: { startDate: 'desc' } },
        competencies: true,
        references: true,
        languages: true,
      },
    })

    return NextResponse.json(profile ? mapJobSeekerProfileUrls(profile as any) : profile)
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create or update job seeker profile
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'JOB_SEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      phone,
      whatsappNumber,
      bio,
      location,
      category,
      availability,
      currentJobTitle,
      expectedSalary,
      profilePicture,
      profilePictures,
      experiences,
      educations,
      competencies,
      references,
      languages,
    } = body

    const existingProfile = await prisma.jobSeekerProfile.findUnique({
      where: { userId: session.user.id },
      select: { profilePicture: true, profilePictures: true },
    })

    const normalizedProfilePicture = isPersistentImageUrl(profilePicture)
      ? normalizeSinglePicture(profilePicture) ?? existingProfile?.profilePicture ?? null
      : existingProfile?.profilePicture || null

    const normalizedProfilePictures = Array.isArray(profilePictures)
      ? normalizeProfilePictures(profilePictures)
      : existingProfile?.profilePictures || []

    // Upsert profile
    const profile = await prisma.jobSeekerProfile.upsert({
      where: { userId: session.user.id },
      update: {
        firstName,
        lastName,
        phone,
        whatsappNumber,
        bio,
        location,
        category,
        availability,
        currentJobTitle,
        expectedSalary,
        profilePicture: normalizedProfilePicture,
        profilePictures: normalizedProfilePictures,
      },
      create: {
        userId: session.user.id,
        firstName,
        lastName,
        phone,
        whatsappNumber,
        bio,
        location,
        category,
        availability,
        currentJobTitle,
        expectedSalary,
        profilePicture: isPersistentImageUrl(profilePicture) ? normalizeSinglePicture(profilePicture) : null,
        profilePictures: normalizeProfilePictures(profilePictures),
      },
    })

    // Update related data if provided
    if (experiences) {
      await prisma.experience.deleteMany({ where: { profileId: profile.id } })
      const validExperiences = experiences.filter(
        (exp: any) => exp.company && exp.position && exp.startDate
      )
      if (validExperiences.length > 0) {
        await prisma.experience.createMany({
          data: validExperiences.map((exp: any) => ({
            company: exp.company,
            position: exp.position,
            description: exp.description || null,
            profileId: profile.id,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            isCurrent: exp.isCurrent || false,
          })),
        })
      }
    }

    if (educations) {
      await prisma.education.deleteMany({ where: { profileId: profile.id } })
      const validEducations = educations.filter(
        (edu: any) => edu.institution && edu.degree && edu.startDate
      )
      if (validEducations.length > 0) {
        await prisma.education.createMany({
          data: validEducations.map((edu: any) => ({
            institution: edu.institution,
            degree: edu.degree,
            field: edu.field || null,
            profileId: profile.id,
            startDate: new Date(edu.startDate),
            endDate: edu.endDate ? new Date(edu.endDate) : null,
            isCurrent: edu.isCurrent || false,
            description: edu.description || null,
          })),
        })
      }
    }

    if (competencies) {
      await prisma.competency.deleteMany({ where: { profileId: profile.id } })
      if (competencies.length > 0) {
        await prisma.competency.createMany({
          data: competencies.map((comp: any) => ({
            ...comp,
            profileId: profile.id,
          })),
        })
      }
    }

    if (references) {
      await prisma.reference.deleteMany({ where: { profileId: profile.id } })
      if (references.length > 0) {
        await prisma.reference.createMany({
          data: references.map((ref: any) => ({
            ...ref,
            profileId: profile.id,
          })),
        })
      }
    }

    if (languages) {
      await prisma.language.deleteMany({ where: { profileId: profile.id } })
      if (languages.length > 0) {
        await prisma.language.createMany({
          data: languages.map((lang: any) => ({
            ...lang,
            profileId: profile.id,
          })),
        })
      }
    }

    const updatedProfile = await prisma.jobSeekerProfile.findUnique({
      where: { id: profile.id },
      include: {
        experiences: { orderBy: { startDate: 'desc' } },
        educations: { orderBy: { startDate: 'desc' } },
        competencies: true,
        references: true,
        languages: true,
      },
    })

    return NextResponse.json(
      updatedProfile ? mapJobSeekerProfileUrls(updatedProfile as any) : updatedProfile,
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating/updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.userType !== 'JOB_SEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    let existingProfile = await prisma.jobSeekerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, profilePicture: true, profilePictures: true },
    })

    if (!existingProfile) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true },
      })
      const handle = user?.email?.split('@')[0]?.replace(/[^a-zA-Z0-9._-]/g, '') || 'member'
      const pretty =
        handle.length > 0 ? handle.charAt(0).toUpperCase() + handle.slice(1) : 'Member'

      existingProfile = await prisma.jobSeekerProfile.create({
        data: {
          userId: session.user.id,
          firstName: pretty,
          lastName: 'Profile',
          profilePicture: null,
          profilePictures: [],
        },
        select: { id: true, profilePicture: true, profilePictures: true },
      })
    }

    const profilePicture = body?.profilePicture
    const profilePictures = body?.profilePictures

    const nextPicture =
      profilePicture === null
        ? null
        : isPersistentImageUrl(profilePicture)
          ? normalizeSinglePicture(profilePicture) ?? existingProfile.profilePicture
          : existingProfile.profilePicture

    const nextPictures = Array.isArray(profilePictures)
      ? normalizeProfilePictures(profilePictures)
      : existingProfile.profilePictures

    const updated = await prisma.jobSeekerProfile.update({
      where: { id: existingProfile.id },
      data: {
        profilePicture: nextPicture,
        profilePictures: nextPictures,
      },
      select: {
        id: true,
        profilePicture: true,
        profilePictures: true,
      },
    })

    return NextResponse.json(mapJobSeekerProfileUrls(updated as any))
  } catch (error: any) {
    console.error('Error updating profile images:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
