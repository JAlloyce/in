import { useState } from "react"
import { 
  HiPhotograph, HiVideoCamera, HiCalendar, 
  HiGlobe, HiX, HiEmojiHappy, HiChat, HiUsers
} from "react-icons/hi"
import { FaBuilding } from "react-icons/fa"
import { posts, storage, auth } from '../../lib/supabase'
import { Button, Card, Avatar, Input } from '../ui'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Responsive CreatePost Component
 * 
 * Features:
 * - Mobile-first responsive design
 * - Touch-optimized controls
 * - Proper form handling for mobile
 * - Accessibility compliant
 * - iOS keyboard optimizations
 */
export default function CreatePost({ user, onPostCreated }) {
  const [showModal, setShowModal] = useState(false)
  const [content, setContent] = useState("")
  const [postType, setPostType] = useState("user")
  const [mediaFiles, setMediaFiles] = useState([])
  const [mediaPreview, setMediaPreview] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleMediaSelect = (event) => {
    const files = Array.from(event.target.files)
    setMediaFiles(files)
    
    // Create preview URLs
    const previews = files.map(file => {
      if (file.type.startsWith('image/')) {
        return {
          type: 'image',
          url: URL.createObjectURL(file),
          file
        }
      } else if (file.type.startsWith('video/')) {
        return {
          type: 'video', 
          url: URL.createObjectURL(file),
          file
        }
      }
      return {
        type: 'document',
        name: file.name,
        file
      }
    })
    setMediaPreview(previews)
  }

  const removeMedia = (index) => {
    const newFiles = mediaFiles.filter((_, i) => i !== index)
    const newPreviews = mediaPreview.filter((_, i) => i !== index)
    
    // Revoke object URL to prevent memory leaks
    if (mediaPreview[index]?.url) {
      URL.revokeObjectURL(mediaPreview[index].url)
    }
    
    setMediaFiles(newFiles)
    setMediaPreview(newPreviews)
  }

  const uploadMedia = async () => {
    if (mediaFiles.length === 0) return []

    const uploadedUrls = []
    const uploadedFiles = [] // Track successful uploads for cleanup
    
    for (const [index, file] of mediaFiles.entries()) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}_${index}_${Math.random().toString(36).substring(2)}.${fileExt}`
      
      try {
        const { data, error } = await storage.uploadFile('post-media', fileName, file)
        
        if (error) {
          console.error('Error uploading file:', error)
          // Clean up previously uploaded files
          for (const uploadedFile of uploadedFiles) {
            await storage.deleteFile('post-media', uploadedFile)
          }
          throw new Error(`Failed to upload ${file.name}`)
        }
        
        const publicUrl = storage.getPublicUrl('post-media', fileName)
        uploadedUrls.push(publicUrl)
        uploadedFiles.push(fileName)
      } catch (err) {
        // Clean up on any error
        for (const uploadedFile of uploadedFiles) {
          await storage.deleteFile('post-media', uploadedFile)
        }
        throw err
      }
    }
    
    return uploadedUrls
  }

  const handleSubmit = async () => {
    if (!user) {
      setError('Please log in to create posts')
      return
    }

    if (!content.trim()) {
      setError('Please write something to share')
      return
    }

    try {
      setUploading(true)
      setError(null)

      // Upload media files if any
      const mediaUrls = await uploadMedia()

      // Create the post
      const postData = {
        author_id: user.id,
        content: content.trim(),
        post_type: postType,
        image_url: mediaUrls[0] ?? null,
        media_urls: mediaUrls.length ? mediaUrls : null
      }

      const { data: newPost, error: postError } = await posts.create(postData)

      if (postError) {
        console.error('Error creating post:', postError)
        setError('Failed to create post. Please try again.')
        return
      }

      // Transform the post data for the parent component
      const transformedPost = {
        id: newPost.id,
        type: newPost.post_type || 'user',
        author: {
          name: newPost.author?.name || user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          title: newPost.author?.headline || 'Professional',
          avatar: newPost.author?.avatar_url || user.user_metadata?.avatar_url
        },
        content: newPost.content,
        timestamp: 'Just now',
        likes: 0,
        comments: 0,
        shares: 0,
        media_urls: newPost.media_urls || [],
        user_liked: false,
        commentsList: []
      }

      // Notify parent component
      if (onPostCreated) {
        onPostCreated(transformedPost)
      }

      // Reset form
      resetForm()
      setShowModal(false)

    } catch (err) {
      console.error('Error creating post:', err)
      setError(err.message || 'Failed to create post. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setContent("")
    setPostType("user")
    setMediaFiles([])
    
    // Clean up preview URLs
    mediaPreview.forEach(preview => {
      if (preview.url) {
        URL.revokeObjectURL(preview.url)
      }
    })
    setMediaPreview([])
    setError(null)
  }

  const handleCancel = () => {
    resetForm()
    setShowModal(false)
  }

  if (!user) {
    return (
      <Card className="text-center mobile-safe">
        <HiChat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-heading-3 mb-2">Share with your network</h3>
                        <p className="text-body text-gray-600 mb-4">Join Intru to start sharing your thoughts and experiences</p>
        <Button variant="primary" size="md" className="touch-target">
          Sign In
        </Button>
      </Card>
    )
  }

  return (
    <>
      {/* Main Create Post Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow border border-gray-200 p-4 md:p-6 mobile-safe"
      >
        <div className="flex items-start space-x-3">
            <Avatar 
              src={user?.user_metadata?.avatar_url}
              name={user?.user_metadata?.full_name || user?.email}
            size="md"
            />
            
          <div className="flex-1">
            <button
              onClick={() => setShowModal(true)}
              className="w-full text-left p-3 md:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors touch-target focus-visible mobile-safe"
              aria-label="Start a post"
            >
              <span className="text-gray-500 text-base">What's on your mind?</span>
            </button>
            
            {/* Action Buttons - Mobile Optimized */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex space-x-2 md:space-x-4 overflow-x-auto scrollbar-hide">
              <button 
                  onClick={() => setShowModal(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-target focus-visible"
                  aria-label="Add photo"
              >
                  <HiPhotograph className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium hidden sm:block">Photo</span>
              </button>
                
                <button 
                  onClick={() => setShowModal(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-target focus-visible"
                  aria-label="Add video"
                >
                  <HiVideoCamera className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium hidden sm:block">Video</span>
                    </button>

                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-target focus-visible"
                  aria-label="Add event"
                >
                  <HiCalendar className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium hidden sm:block">Event</span>
                </button>
                
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-target focus-visible"
                  aria-label="Write article"
                >
                  <FaBuilding className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium hidden sm:block">Article</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Create Post Modal - Mobile Optimized */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-modal-backdrop bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col mobile-safe"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Create a post</h2>
                <button
                  onClick={handleCancel}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors touch-target focus-visible"
                  aria-label="Close modal"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {/* User Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar 
                    src={user?.user_metadata?.avatar_url}
                    name={user?.user_metadata?.full_name || user?.email}
                    size="md"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-base">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                    </h3>
                    <select 
                      value={postType}
                      onChange={(e) => setPostType(e.target.value)}
                      className="mt-1 text-sm bg-gray-100 border border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
                    >
                      <option value="user">Anyone</option>
                      <option value="connections">Connections only</option>
                    </select>
                  </div>
                </div>

                {/* Content Textarea */}
                <div className="mb-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What do you want to talk about?"
                    rows={4}
                    className="w-full p-3 text-base bg-white border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 mobile-safe"
                    style={{ fontSize: '16px' }} // Prevent iOS zoom
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {content.length}/2000
                    </span>
                    <button 
                      type="button"
                      className="p-1 text-gray-400 hover:text-gray-600 touch-target"
                      aria-label="Add emoji"
                    >
                      <HiEmojiHappy className="w-5 h-5" />
                    </button>
                  </div>
                </div>

              {/* Media Preview */}
              {mediaPreview.length > 0 && (
                  <div className="mb-4">
                    <div className="grid grid-cols-2 gap-2">
                  {mediaPreview.map((preview, index) => (
                        <div key={index} className="relative group">
                          {preview.type === 'image' ? (
                          <img 
                            src={preview.url} 
                            alt="Preview"
                              className="w-full h-32 object-cover rounded-lg"
                          />
                          ) : preview.type === 'video' ? (
                          <video 
                            src={preview.url} 
                              className="w-full h-32 object-cover rounded-lg"
                            controls
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm text-gray-600">{preview.name}</span>
                        </div>
                      )}
                          <button
                            onClick={() => removeMedia(index)}
                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors touch-target"
                            aria-label="Remove media"
                          >
                            <HiX className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                </div>
              )}

                {/* Media Upload */}
                <div className="border border-dashed border-gray-300 rounded-lg p-4 mb-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaSelect}
                    className="hidden"
                    id="media-upload"
                  />
                  <label
                    htmlFor="media-upload"
                    className="flex flex-col items-center justify-center cursor-pointer touch-target"
                  >
                    <HiPhotograph className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Add photos or videos</span>
                </label>
            </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                  )}
                </div>
                
              {/* Modal Footer */}
              <div className="p-4 md:p-6 border-t bg-gray-50">
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={uploading}
                    className="flex-1 touch-target"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!content.trim() || uploading}
                    loading={uploading}
                    className="flex-1 touch-target"
                  >
                    {uploading ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>
            </motion.div>
        </div>
      )}
      </AnimatePresence>
    </>
  )
}
