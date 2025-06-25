import { corsHeaders } from '../_shared/cors.js'
import { requireAuth, createErrorResponse, createSuccessResponse, supabaseAdmin } from '../_shared/auth.js'

const ALLOWED_BUCKETS = {
  'avatars': {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    public: true
  },
  'banners': {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    public: true
  },
  'post-media': {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'],
    public: true
  },
  'resumes': {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    public: false
  },
  'message-attachments': {
    maxSize: 25 * 1024 * 1024, // 25MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'application/zip'],
    public: false
  },
  'workspace-files': {
    maxSize: 25 * 1024 * 1024, // 25MB
    allowedTypes: ['application/pdf', 'application/zip', 'text/plain', 'application/json'],
    public: false
  },
  'company-logos': {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    public: true
  },
  'community-covers': {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    public: true
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405)
  }

  try {
    const user = await requireAuth(req)
    
    // Parse form data
    const formData = await req.formData()
    const file = formData.get('file')
    const bucket = formData.get('bucket')
    const customPath = formData.get('path') || null

    if (!file || !(file instanceof File)) {
      return createErrorResponse('File is required')
    }

    if (!bucket || !ALLOWED_BUCKETS[bucket]) {
      return createErrorResponse('Invalid bucket')
    }

    const bucketConfig = ALLOWED_BUCKETS[bucket]

    // Validate file size
    if (file.size > bucketConfig.maxSize) {
      return createErrorResponse(`File too large. Maximum size is ${bucketConfig.maxSize / 1024 / 1024}MB`)
    }

    // Validate file type
    if (!bucketConfig.allowedTypes.includes(file.type)) {
      return createErrorResponse(`Invalid file type. Allowed types: ${bucketConfig.allowedTypes.join(', ')}`)
    }

    // Generate file path
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    
    let filePath
    if (customPath) {
      filePath = customPath
    } else {
      // Default path structure: user_id/timestamp_randomId.ext
      filePath = `${user.id}/${timestamp}_${randomId}.${fileExt}`
    }

    // Upload file to Supabase Storage
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      return createErrorResponse('Failed to upload file', 500)
    }

    // Get public URL if bucket is public
    let publicUrl = null
    if (bucketConfig.public) {
      const { data: urlData } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(filePath)
      publicUrl = urlData.publicUrl
    }

    // For images, get dimensions
    let dimensions = null
    if (file.type.startsWith('image/')) {
      // In a real implementation, you'd use an image processing library
      // For now, we'll just return placeholder dimensions
      dimensions = { width: 0, height: 0 }
    }

    return createSuccessResponse({
      path: filePath,
      bucket: bucket,
      public_url: publicUrl,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      dimensions: dimensions,
      uploaded_at: new Date().toISOString()
    }, 201)

  } catch (error) {
    console.error('Upload file error:', error)
    return createErrorResponse('Internal server error', 500)
  }
})