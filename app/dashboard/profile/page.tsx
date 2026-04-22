'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import RoleDashboardLayout from '@/components/layout/RoleDashboardLayout'
import { User, Upload, Plus, X, Briefcase, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import { canonicalUploadRef, resolveProfileMediaUrl } from '@/lib/profileMediaUrl'

interface ExperienceEntry {
  id?: string
  company: string
  position: string
  description?: string
  startDate: string
  endDate?: string
  isCurrent?: boolean
}

interface EducationEntry {
  id?: string
  institution: string
  degree: string
  field?: string
  startDate: string
  endDate?: string
  isCurrent?: boolean
  description?: string
}

interface ProfileData {
  firstName: string
  lastName: string
  phone: string
  whatsappNumber: string
  bio: string
  location: string
  category: string
  availability: string
  currentJobTitle: string
  expectedSalary: string
  profilePicture: string
  profilePictures: string[]
  experiences: ExperienceEntry[]
  educations: EducationEntry[]
  competencies: any[]
  references: any[]
  languages: any[]
}

interface JobCategoryOption {
  id: string
  name: string
}

type CropTarget = 'primary' | 'additional'

interface CropSession {
  target: CropTarget
  file: File
  previewUrl: string
  aspect: number
  title: string
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const loadImageFromUrl = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Unable to load selected image'))
    img.src = src
  })

const createCroppedImageFile = async (
  file: File,
  opts: { aspect: number; zoom: number; offsetX: number; offsetY: number }
): Promise<File> => {
  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await loadImageFromUrl(objectUrl)
    const imageWidth = image.naturalWidth || image.width
    const imageHeight = image.naturalHeight || image.height
    const targetAspect = opts.aspect > 0 ? opts.aspect : 1
    const zoom = clamp(opts.zoom, 1, 3)

    let cropWidth = imageWidth
    let cropHeight = cropWidth / targetAspect
    if (cropHeight > imageHeight) {
      cropHeight = imageHeight
      cropWidth = cropHeight * targetAspect
    }

    cropWidth = cropWidth / zoom
    cropHeight = cropHeight / zoom

    const maxShiftX = (imageWidth - cropWidth) / 2
    const maxShiftY = (imageHeight - cropHeight) / 2
    const shiftX = (clamp(opts.offsetX, -100, 100) / 100) * maxShiftX
    const shiftY = (clamp(opts.offsetY, -100, 100) / 100) * maxShiftY

    const sourceX = clamp((imageWidth - cropWidth) / 2 + shiftX, 0, imageWidth - cropWidth)
    const sourceY = clamp((imageHeight - cropHeight) / 2 + shiftY, 0, imageHeight - cropHeight)

    const canvas = document.createElement('canvas')
    canvas.width = targetAspect === 1 ? 1000 : 1400
    canvas.height = Math.round(canvas.width / targetAspect)

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Image editor is unavailable in this browser')

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    )

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.92)
    )
    if (!blob) throw new Error('Failed to process image')

    const safeBase = (file.name || 'profile-image').replace(/\.[^.]+$/, '')
    return new File([blob], `${safeBase}-cropped.jpg`, { type: 'image/jpeg' })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileImageUploading, setProfileImageUploading] = useState(false)
  const [extraImageUploading, setExtraImageUploading] = useState(false)
  const [cropSession, setCropSession] = useState<CropSession | null>(null)
  const [cropZoom, setCropZoom] = useState(1)
  const [cropOffsetX, setCropOffsetX] = useState(0)
  const [cropOffsetY, setCropOffsetY] = useState(0)
  const [categories, setCategories] = useState<JobCategoryOption[]>([])
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    phone: '',
    whatsappNumber: '',
    bio: '',
    location: '',
    category: '',
    availability: '',
    currentJobTitle: '',
    expectedSalary: '',
    profilePicture: '',
    profilePictures: [],
    experiences: [],
    educations: [],
    competencies: [],
    references: [],
    languages: [],
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user.userType !== 'JOB_SEEKER') {
      router.push('/dashboard')
    } else if (status === 'authenticated' && session?.user.userType === 'JOB_SEEKER') {
      fetchProfile()
    }
    // Intentionally depend on stable session fields only — the full `session` object identity
    // changes often and was refetching the profile after image uploads, wiping fresh UI state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.user?.id, session?.user?.userType, router])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', { cache: 'no-store' })
      if (!response.ok) return
      const data = await response.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const applyImageFieldsFromApi = (patch: {
    profilePicture?: string | null
    profilePictures?: string[]
  }) => {
    setProfile((prev) => ({
      ...prev,
      profilePicture:
        patch.profilePicture !== undefined
          ? patch.profilePicture &&
              String(patch.profilePicture).trim() !== ''
            ? resolveProfileMediaUrl(patch.profilePicture)
            : ''
          : prev.profilePicture,
      profilePictures: Array.isArray(patch.profilePictures)
        ? patch.profilePictures.map((u) => resolveProfileMediaUrl(u))
        : prev.profilePictures,
    }))
  }

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profiles/job-seeker')
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setProfile({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phone: data.phone || '',
            whatsappNumber: data.whatsappNumber || '',
            bio: data.bio || '',
            location: data.location || '',
            category: data.category || '',
            availability: data.availability || '',
            currentJobTitle: data.currentJobTitle || '',
            expectedSalary: data.expectedSalary || '',
            profilePicture: resolveProfileMediaUrl(data.profilePicture || ''),
            profilePictures: (data.profilePictures || []).map((u: string) =>
              resolveProfileMediaUrl(u)
            ),
            experiences: (data.experiences || []).map((e: any) => ({
              id: e.id,
              company: e.company || '',
              position: e.position || '',
              description: e.description || '',
              startDate: e.startDate ? new Date(e.startDate).toISOString().slice(0, 10) : '',
              endDate: e.endDate ? new Date(e.endDate).toISOString().slice(0, 10) : '',
              isCurrent: e.isCurrent || false,
            })),
            educations: (data.educations || []).map((e: any) => ({
              id: e.id,
              institution: e.institution || '',
              degree: e.degree || '',
              field: e.field || '',
              startDate: e.startDate ? new Date(e.startDate).toISOString().slice(0, 10) : '',
              endDate: e.endDate ? new Date(e.endDate).toISOString().slice(0, 10) : '',
              isCurrent: e.isCurrent || false,
              description: e.description || '',
            })),
            competencies: data.competencies || [],
            references: data.references || [],
            languages: data.languages || [],
          })
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/profiles/job-seeker', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        toast.success('Profile saved successfully!')
        await fetchProfile()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to save profile')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const uploadPrimaryPhoto = async (file: File) => {
    const previewUrl = URL.createObjectURL(file)
    setProfile((prev) => ({ ...prev, profilePicture: previewUrl }))
    setProfileImageUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const storedUrl = data.url || data.path
        const dbRef = (data.path as string) || canonicalUploadRef(storedUrl) || storedUrl
        setProfile((prev) => ({ ...prev, profilePicture: resolveProfileMediaUrl(storedUrl) }))
        try {
          const patch = await persistProfileImages({
            profilePicture: dbRef,
          })
          if (patch) {
            applyImageFieldsFromApi(patch)
          }
          toast.success('Profile picture uploaded successfully!')
        } catch {
          toast.error('Photo uploaded but profile was not updated. Click Save Profile or try again.')
          await fetchProfile()
        }
      } else {
        const errJson = await response.json().catch(() => ({}))
        toast.error(errJson.error || 'Failed to upload profile picture')
        await fetchProfile()
      }
    } catch (error) {
      toast.error('An error occurred while uploading')
      await fetchProfile()
    } finally {
      queueMicrotask(() => URL.revokeObjectURL(previewUrl))
      setProfileImageUploading(false)
    }
  }

  const uploadAdditionalPhoto = async (file: File) => {
    const previewUrl = URL.createObjectURL(file)
    setExtraImageUploading(true)
    setProfile((prev) => ({
      ...prev,
      profilePictures: [...prev.profilePictures, previewUrl].slice(0, 3),
    }))

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const storedUrl = data.url || data.path
        const dbRef = (data.path as string) || canonicalUploadRef(storedUrl) || storedUrl

        let nextForDb: string[] = []
        setProfile((prev) => {
          const withoutPreview = prev.profilePictures.filter((url) => url !== previewUrl)
          const refsForDb = withoutPreview
            .map((u) => canonicalUploadRef(u))
            .filter((u): u is string => !!u)
          nextForDb = [...refsForDb, dbRef].slice(0, 3)
          const nextPictures = [...withoutPreview, resolveProfileMediaUrl(storedUrl)].slice(0, 3)
          return {
            ...prev,
            profilePictures: nextPictures,
          }
        })

        try {
          const patch = await persistProfileImages({
            profilePictures: nextForDb,
          })
          if (patch) applyImageFieldsFromApi(patch)
          toast.success('Additional profile picture uploaded!')
        } catch {
          toast.error('Photo uploaded but profile was not updated. Click Save Profile or try again.')
          await fetchProfile()
        }
      } else {
        setProfile((prev) => ({
          ...prev,
          profilePictures: prev.profilePictures.filter((url) => url !== previewUrl),
        }))
        toast.error('Failed to upload additional picture')
      }
    } catch (error) {
      setProfile((prev) => ({
        ...prev,
        profilePictures: prev.profilePictures.filter((url) => url !== previewUrl),
      }))
      toast.error('An error occurred while uploading')
    } finally {
      queueMicrotask(() => URL.revokeObjectURL(previewUrl))
      setExtraImageUploading(false)
    }
  }

  const openCropSession = (file: File, target: CropTarget) => {
    const previewUrl = URL.createObjectURL(file)
    setCropSession({
      target,
      file,
      previewUrl,
      aspect: target === 'primary' ? 1 : 4 / 3,
      title: target === 'primary' ? 'Crop Profile Picture' : 'Crop Extra Profile Picture',
    })
    setCropZoom(1)
    setCropOffsetX(0)
    setCropOffsetY(0)
  }

  const closeCropSession = () => {
    setCropSession((prev) => {
      if (prev?.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl)
      }
      return null
    })
    setCropZoom(1)
    setCropOffsetX(0)
    setCropOffsetY(0)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    openCropSession(file, 'primary')
    e.target.value = ''
  }

  const handleAdditionalPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (profile.profilePictures.length >= 3) {
      toast.error('You can upload up to 3 profile pictures only.')
      e.target.value = ''
      return
    }

    openCropSession(file, 'additional')
    e.target.value = ''
  }

  const handleCropAndUpload = async () => {
    if (!cropSession) return
    try {
      const croppedFile = await createCroppedImageFile(cropSession.file, {
        aspect: cropSession.aspect,
        zoom: cropZoom,
        offsetX: cropOffsetX,
        offsetY: cropOffsetY,
      })
      if (cropSession.target === 'primary') {
        await uploadPrimaryPhoto(croppedFile)
      } else {
        await uploadAdditionalPhoto(croppedFile)
      }
      closeCropSession()
    } catch (error) {
      toast.error('Failed to crop image. Please try another photo.')
    }
  }

  const handleUploadOriginal = async () => {
    if (!cropSession) return
    try {
      if (cropSession.target === 'primary') {
        await uploadPrimaryPhoto(cropSession.file)
      } else {
        await uploadAdditionalPhoto(cropSession.file)
      }
      closeCropSession()
    } catch {
      toast.error('Failed to upload image. Please try again.')
    }
  }

  const removeAdditionalPhoto = (index: number) => {
    const nextPictures = profile.profilePictures.filter((_, i) => i !== index)
    setProfile({
      ...profile,
      profilePictures: nextPictures,
    })
    const refsForDb = nextPictures
      .map((u) => canonicalUploadRef(u))
      .filter((u): u is string => !!u)
    void persistProfileImages({
      profilePictures: refsForDb,
    })
      .then((patch) => {
        if (patch) applyImageFieldsFromApi(patch)
      })
      .catch(async () => {
        toast.error('Failed to update stored images')
        await fetchProfile()
      })
  }

  const persistProfileImages = async (payload: {
    profilePicture?: string | null
    profilePictures?: string[]
  }): Promise<{ profilePicture?: string | null; profilePictures?: string[] } | null> => {
    const response = await fetch('/api/profiles/job-seeker', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || 'Failed to persist profile images')
    }
    return response.json()
  }

  if (loading || status === 'loading') {
    return (
      <RoleDashboardLayout title="Profile and resume">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </RoleDashboardLayout>
    )
  }

  return (
    <RoleDashboardLayout title="Profile and resume">
      <div className="max-w-4xl">
        <div className="mb-6 lg:hidden">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
        </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 p-6 space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className={`w-32 h-32 rounded-full object-cover ${profileImageUploading ? 'opacity-70' : ''}`}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-yellow-500 text-gray-900 p-2 rounded-full cursor-pointer hover:bg-yellow-400">
                  <Upload className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Profile Picture</h2>
                <p className="text-gray-600 text-sm">
                  Upload a professional photo {profileImageUploading ? '(uploading...)' : ''}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Extra Profile Pictures</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Add 1-3 pictures to show below your public profile.</p>
                </div>
                <label className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                  profile.profilePictures.length >= 3
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-500 text-gray-900 hover:bg-yellow-400 cursor-pointer'
                }`}>
                  <Upload className="h-4 w-4 mr-2" />
                  {extraImageUploading ? 'Uploading...' : 'Add picture'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAdditionalPhotoUpload}
                    className="hidden"
                    disabled={profile.profilePictures.length >= 3}
                  />
                </label>
              </div>

              {profile.profilePictures.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {profile.profilePictures.map((imageUrl, index) => (
                    <div key={`${imageUrl}-${index}`} className="relative shrink-0">
                      <img
                        src={imageUrl}
                        alt={`Profile extra ${index + 1}`}
                        className="w-24 h-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeAdditionalPhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                        aria-label={`Remove photo ${index + 1}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No extra photos added yet.</p>
              )}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g. +1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp number</label>
                <input
                  type="tel"
                  value={profile.whatsappNumber}
                  onChange={(e) => setProfile({ ...profile, whatsappNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g. 1234567890 (with country code)"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Salary</label>
                <input
                  type="text"
                  value={profile.expectedSalary}
                  onChange={(e) => setProfile({ ...profile, expectedSalary: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g. $50,000 - $60,000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                rows={4}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={profile.category}
                  onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                  {profile.category && !categories.some((category) => category.name === profile.category) ? (
                    <option value={profile.category}>{profile.category}</option>
                  ) : null}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Job Title
                </label>
                <input
                  type="text"
                  value={profile.currentJobTitle}
                  onChange={(e) => setProfile({ ...profile, currentJobTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Job Experience - optional, only if they have worked somewhere */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary-600" />
                Job Experience
              </h3>
              <p className="text-sm text-gray-500 mb-3">Add your work history if you have previously worked somewhere.</p>
              {profile.experiences.map((exp, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Experience #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, experiences: profile.experiences.filter((_, i) => i !== index) })}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Company name"
                      value={exp.company}
                      onChange={(e) => {
                        const next = [...profile.experiences]
                        next[index] = { ...next[index], company: e.target.value }
                        setProfile({ ...profile, experiences: next })
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Job title / Position"
                      value={exp.position}
                      onChange={(e) => {
                        const next = [...profile.experiences]
                        next[index] = { ...next[index], position: e.target.value }
                        setProfile({ ...profile, experiences: next })
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start date</label>
                      <input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => {
                          const next = [...profile.experiences]
                          next[index] = { ...next[index], startDate: e.target.value }
                          setProfile({ ...profile, experiences: next })
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End date (leave empty if current)</label>
                      <input
                        type="date"
                        value={exp.endDate || ''}
                        onChange={(e) => {
                          const next = [...profile.experiences]
                          next[index] = { ...next[index], endDate: e.target.value || undefined }
                          setProfile({ ...profile, experiences: next })
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <textarea
                    placeholder="Description (optional)"
                    value={exp.description || ''}
                    onChange={(e) => {
                      const next = [...profile.experiences]
                      next[index] = { ...next[index], description: e.target.value }
                      setProfile({ ...profile, experiences: next })
                    }}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setProfile({ ...profile, experiences: [...profile.experiences, { company: '', position: '', startDate: '', endDate: '' }] })}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                <Plus className="h-4 w-4" /> Add experience
              </button>
            </div>

            {/* Education */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary-600" />
                Education
              </h3>
              <p className="text-sm text-gray-500 mb-3">Add your educational level and qualifications.</p>
              {profile.educations.map((edu, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Education #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, educations: profile.educations.filter((_, i) => i !== index) })}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Institution / School"
                      value={edu.institution}
                      onChange={(e) => {
                        const next = [...profile.educations]
                        next[index] = { ...next[index], institution: e.target.value }
                        setProfile({ ...profile, educations: next })
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Degree / Qualification"
                      value={edu.degree}
                      onChange={(e) => {
                        const next = [...profile.educations]
                        next[index] = { ...next[index], degree: e.target.value }
                        setProfile({ ...profile, educations: next })
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Field of study (optional)"
                    value={edu.field || ''}
                    onChange={(e) => {
                      const next = [...profile.educations]
                      next[index] = { ...next[index], field: e.target.value }
                      setProfile({ ...profile, educations: next })
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start date</label>
                      <input
                        type="date"
                        value={edu.startDate}
                        onChange={(e) => {
                          const next = [...profile.educations]
                          next[index] = { ...next[index], startDate: e.target.value }
                          setProfile({ ...profile, educations: next })
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End date</label>
                      <input
                        type="date"
                        value={edu.endDate || ''}
                        onChange={(e) => {
                          const next = [...profile.educations]
                          next[index] = { ...next[index], endDate: e.target.value || undefined }
                          setProfile({ ...profile, educations: next })
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <textarea
                    placeholder="Description (optional)"
                    value={edu.description || ''}
                    onChange={(e) => {
                      const next = [...profile.educations]
                      next[index] = { ...next[index], description: e.target.value }
                      setProfile({ ...profile, educations: next })
                    }}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setProfile({ ...profile, educations: [...profile.educations, { institution: '', degree: '', field: '', startDate: '', endDate: '' }] })}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                <Plus className="h-4 w-4" /> Add education
              </button>
            </div>

            {/* Skills/Competencies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {profile.competencies.map((comp, index) => (
                  <span
                    key={index}
                    className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{comp.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setProfile({
                          ...profile,
                          competencies: profile.competencies.filter((_, i) => i !== index),
                        })
                      }}
                      className="hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add a skill and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const input = e.target as HTMLInputElement
                    if (input.value.trim()) {
                      setProfile({
                        ...profile,
                        competencies: [
                          ...profile.competencies,
                          { name: input.value.trim(), level: 'Intermediate' },
                        ],
                      })
                      input.value = ''
                    }
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 disabled:opacity-50 font-semibold"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>

          {cropSession && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {cropSession.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Adjust zoom and position, then upload the cropped image.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeCropSession}
                    className="rounded-md p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    aria-label="Close cropper"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div
                  className="relative w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900"
                  style={{ aspectRatio: `${cropSession.aspect}` }}
                >
                  <img
                    src={cropSession.previewUrl}
                    alt="Crop preview"
                    className="h-full w-full object-cover"
                    style={{
                      transform: `translate(${cropOffsetX}%, ${cropOffsetY}%) scale(${cropZoom})`,
                      transformOrigin: 'center',
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Zoom
                    <input
                      type="range"
                      min={100}
                      max={300}
                      step={1}
                      value={Math.round(cropZoom * 100)}
                      onChange={(e) => setCropZoom(Number(e.target.value) / 100)}
                      className="mt-1 w-full"
                    />
                  </label>
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Left / Right
                    <input
                      type="range"
                      min={-100}
                      max={100}
                      step={1}
                      value={cropOffsetX}
                      onChange={(e) => setCropOffsetX(Number(e.target.value))}
                      className="mt-1 w-full"
                    />
                  </label>
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Up / Down
                    <input
                      type="range"
                      min={-100}
                      max={100}
                      step={1}
                      value={cropOffsetY}
                      onChange={(e) => setCropOffsetY(Number(e.target.value))}
                      className="mt-1 w-full"
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeCropSession}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadOriginal}
                    disabled={profileImageUploading || extraImageUploading}
                    className="px-4 py-2 border border-yellow-400 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 disabled:opacity-50 font-medium"
                  >
                    Use Original
                  </button>
                  <button
                    type="button"
                    onClick={handleCropAndUpload}
                    disabled={profileImageUploading || extraImageUploading}
                    className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 disabled:opacity-50 font-semibold"
                  >
                    {profileImageUploading || extraImageUploading
                      ? 'Uploading...'
                      : 'Crop & Upload'}
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </RoleDashboardLayout>
  )
}
