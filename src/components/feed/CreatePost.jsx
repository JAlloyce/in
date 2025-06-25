import { useState } from "react"
import { 
  HiPhotograph, HiVideoCamera, HiCalendar, 
  HiGlobe, HiX, HiEmojiHappy, HiChat, HiUsers
} from "react-icons/hi"
import { FaBuilding } from "react-icons/fa"
import { posts, storage, auth } from '../../lib/supabase'

/**
 * CreatePost Component - Real-time Post Creation
 * 
 * Connected to Supabase backend with:
 * - Real user authentication
 * - File upload to Supabase storage
 * - Post creation with media support
 * - Professional LinkedIn-style interface
 */
export default function CreatePost({ user, onPostCreated }) {
  const [showModal, setShowModal] = useState(false)
  const [content, setContent] = useState("")
  const [postType, setPostType] = useState("user")
  const [visibility, setVisibility] = useState("public")
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
    
    for (const file of mediaFiles) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { data, error } = await storage.uploadFile('post-media', fileName, file)
      
      if (error) {
        console.error('Error uploading file:', error)
        throw new Error(`Failed to upload ${file.name}`)
      }
      
      const publicUrl = storage.getPublicUrl('post-media', fileName)
      uploadedUrls.push(publicUrl)
    }
    
    return uploadedUrls
  }

  const handleSubmit = async () => {
    if (!user) {
      alert('Please log in to create posts')
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
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        visibility
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
          name: newPost.profiles?.full_name || user.user_metadata?.full_name || user.email,
          title: newPost.profiles?.headline || 'Professional',
          avatar: newPost.profiles?.avatar_url || user.user_metadata?.avatar_url
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
    setVisibility("public")
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <HiChat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Share with your network</h3>
          <p className="text-gray-600 mb-4">Join LinkedIn to start sharing your thoughts and experiences</p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Main Create Post Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4">
          {user?.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt="Your avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-semibold">
                {(user.user_metadata?.full_name || user.email)?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
          >
            What's on your mind?
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-blue-600 transition-colors"
          >
            <HiPhotograph className="w-5 h-5" />
            <span className="font-medium">Photo</span>
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-green-600 transition-colors"
          >
            <HiVideoCamera className="w-5 h-5" />
            <span className="font-medium">Video</span>
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-orange-600 transition-colors"
          >
            <HiCalendar className="w-5 h-5" />
            <span className="font-medium">Event</span>
          </button>
        </div>
      </div>

      {/* Modal for creating post */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Create a post</h2>
              <button 
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <HiX className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* User Info */}
              <div className="flex items-center gap-3 mb-4">
                {user?.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Your avatar"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold">
                      {(user.user_metadata?.full_name || user.email)?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {user.user_metadata?.full_name || user.email}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 text-sm text-gray-600 hover:bg-gray-100 px-2 py-1 rounded">
                      <HiGlobe className="w-4 h-4" />
                      <span>Public</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Post Type Selection */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setPostType("user")}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    postType === "user" 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Personal
                </button>
                <button
                  onClick={() => setPostType("community")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                    postType === "community" 
                      ? "bg-purple-100 text-purple-700" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <HiUsers className="w-4 h-4" />
                  Community
                </button>
                <button
                  onClick={() => setPostType("page")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                    postType === "page" 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaBuilding className="w-4 h-4" />
                  Company
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {/* Text Content */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What do you want to talk about?"
                className="w-full min-h-[120px] p-3 border-none resize-none focus:outline-none text-lg placeholder-gray-500"
                disabled={uploading}
              />

              {/* Media Preview */}
              {mediaPreview.length > 0 && (
                <div className="mt-4 space-y-4">
                  {mediaPreview.map((preview, index) => (
                    <div key={index} className="relative">
                      {preview.type === 'image' && (
                        <div className="relative">
                          <img 
                            src={preview.url} 
                            alt="Preview"
                            className="w-full max-h-64 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeMedia(index)}
                            className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70"
                          >
                            <HiX className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      )}
                      
                      {preview.type === 'video' && (
                        <div className="relative">
                          <video 
                            src={preview.url} 
                            controls
                            className="w-full max-h-64 rounded-lg"
                          />
                          <button
                            onClick={() => removeMedia(index)}
                            className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70"
                          >
                            <HiX className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      )}

                      {preview.type === 'document' && (
                        <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                          <span className="text-sm text-gray-700">{preview.name}</span>
                          <button
                            onClick={() => removeMedia(index)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <HiX className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Media Upload Actions */}
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                  <HiPhotograph className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Photo</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMediaSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>

                <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                  <HiVideoCamera className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Video</span>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={handleMediaSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>

                <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <HiEmojiHappy className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Feeling</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {content.length > 0 && (
                    <span>{content.length} characters</span>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!content.trim() || uploading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Posting...</span>
                      </>
                    ) : (
                      <span>Post</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
