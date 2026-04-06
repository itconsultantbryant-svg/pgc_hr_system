'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { FileText, Plus, Edit, Trash2, Image, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

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

export default function AdminContentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [contents, setContents] = useState<ContentItem[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: 'text' as 'text' | 'image' | 'advertisement',
    content: '',
    imageUrl: '',
    position: 'homepage',
    isActive: true,
  })

  const fetchContents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/content')
      if (response.ok) {
        const data = await response.json()
        setContents(data)
      } else {
        toast.error('Failed to fetch content')
      }
    } catch (error) {
      console.error('Error fetching contents:', error)
      toast.error('Failed to fetch content')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user.userType !== 'ADMIN') {
      router.push('/dashboard')
    } else if (status === 'authenticated') {
      fetchContents()
    }
  }, [status, session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const response = await fetch(
        editingContent ? `/api/admin/content/${editingContent.id}` : '/api/admin/content',
        {
          method: editingContent ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to save content')
      }

      const savedContent = await response.json()
      setContents((prev) => {
        if (editingContent) {
          return prev.map((item) => (item.id === savedContent.id ? savedContent : item))
        }
        return [savedContent, ...prev]
      })

      toast.success(editingContent ? 'Content updated successfully!' : 'Content created successfully!')
      setShowModal(false)
      setEditingContent(null)
      setFormData({
        title: '',
        type: 'text',
        content: '',
        imageUrl: '',
        position: 'homepage',
        isActive: true,
      })
    } catch (error) {
      console.error('Error saving content:', error)
      toast.error('Failed to save content')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      const response = await fetch(`/api/admin/content/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Failed to delete content')
      }
      setContents((prev) => prev.filter((item) => item.id !== id))
      toast.success('Content deleted successfully!')
    } catch (error) {
      console.error('Error deleting content:', error)
      toast.error('Failed to delete content')
    }
  }

  const handleEdit = (content: ContentItem) => {
    setEditingContent(content)
    setFormData({
      title: content.title,
      type: content.type,
      content: content.content,
      imageUrl: content.imageUrl || '',
      position: content.position,
      isActive: content.isActive,
    })
    setShowModal(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload/profile-picture', {
        method: 'POST',
        body: uploadFormData,
      })

      if (response.ok) {
        const data = await response.json()
        const imageUrl = data.url || data.imageUrl || ''
        setFormData((prev) => ({ ...prev, imageUrl }))
        toast.success('Image uploaded successfully!')
      } else {
        toast.error('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="spinner w-12 h-12 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                  Content Management
                </h1>
                <p className="text-gray-600">Manage platform content and advertisements</p>
              </div>
              <button
                onClick={() => {
                  setEditingContent(null)
                  setFormData({
                    title: '',
                    type: 'text',
                    content: '',
                    imageUrl: '',
                    position: 'homepage',
                    isActive: true,
                  })
                  setShowModal(true)
                }}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Content</span>
              </button>
            </div>
          </motion.div>

          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-start">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Content Management Features</h3>
                <p className="text-blue-800 text-sm">
                  Manage homepage content, advertisements, and promotional materials. Content can be displayed
                  on the homepage, jobs page, or throughout the platform.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Content List */}
          {contents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-soft p-12 text-center"
            >
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No content yet</h3>
              <p className="text-gray-600 mb-6">
                Start by adding content or advertisements to display on your platform.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Your First Content</span>
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((content, index) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-soft hover-lift border border-gray-100 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{content.title}</h3>
                      <span className="inline-block bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs mb-2">
                        {content.type}
                      </span>
                      <p className="text-sm text-gray-500 capitalize">{content.position}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        content.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {content.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {content.imageUrl && (
                    <img
                      src={content.imageUrl}
                      alt={content.title}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}

                  <p className="text-gray-700 text-sm line-clamp-3 mb-4">{content.content}</p>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-xs text-gray-500">
                      {new Date(content.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(content)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(content.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {editingContent ? 'Edit Content' : 'Add New Content'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setEditingContent(null)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter content title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value as any })
                      }
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="text">Text</option>
                      <option value="image">Image</option>
                      <option value="advertisement">Advertisement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position *
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="homepage">Homepage</option>
                      <option value="jobs">Jobs Page</option>
                      <option value="sidebar">Sidebar</option>
                      <option value="footer">Footer</option>
                    </select>
                  </div>

                  {formData.type === 'image' || formData.type === 'advertisement' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg inline-flex items-center space-x-2"
                        >
                          <Upload className="h-4 w-4" />
                          <span>Upload Image</span>
                        </label>
                        {formData.imageUrl && (
                          <img
                            src={formData.imageUrl}
                            alt="Preview"
                            className="h-20 w-20 object-cover rounded"
                          />
                        )}
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter content text"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                      Active (visible on platform)
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        setEditingContent(null)
                      }}
                      className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      {saving ? 'Saving...' : editingContent ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </div>
    </AdminLayout>
  )
}

