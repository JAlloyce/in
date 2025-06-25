import { corsHeaders } from '../_shared/cors.ts'
import { requireAuth, createErrorResponse, createSuccessResponse, supabaseAdmin } from '../_shared/auth.ts'

interface UploadRequest {
  bucket: string
  file_name: string
  file_type: string
  file_size: number
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
    
    // Parse the multipart form data
    const formData = await req.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string
    const customPath = formData.get('path') as string

    if (!file) {
      return createErrorResponse('No file provided')
    }

    if (!bucket) {
      return createErrorResponse('Bucket name is required')
    }

    // Validate bucket exists and user has access
    const allowedBuckets = [
      'avatars',
      'banners', 
      'post-media',
      'resumes',
      'workspace-files',
      'message-attachments'
    ]

    if (!allowedBuckets.includes(bucket)) {
      return createErrorResponse('Invalid bucket', 400)
    }

    // Validate file size based on bucket
    const maxSizes: Record<string, number> = {
      'avatars': 5 * 1024 * 1024, // 5MB
      'banners': 10 * 1024 * 1024, // 10MB
      'post-media': 50 * 1024 * 1024, // 50MB
      'resumes': 10 * 1024 * 1024, // 10MB
      'workspace-files': 50 * 1024 * 1024, // 50MB
      'message-attachments': 25 * 1024 * 1024 // 25MB
    }

    if (file.size > maxSizes[bucket]) {
      return createErrorResponse(
        `File too large. Maximum size for ${bucket} is ${maxSizes[bucket] / (1024 * 1024)}MB`
      )
    }

    // Validate file type based on bucket
    const allowedTypes: Record<string, string[]> = {
      'avatars': ['image/jpeg', 'image/png', 'image/webp'],
      'banners': ['image/jpeg', 'image/png', 'image/webp'],
      'post-media': ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'],
      'resumes': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'workspace-files': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'],
      'message-attachments': ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'video/mp4', 'audio/mpeg', 'audio/wav']
    }

    if (!allowedTypes[bucket].includes(file.type)) {
      return createErrorResponse(
        `Invalid file type. Allowed types for ${bucket}: ${allowedTypes[bucket].join(', ')}`
      )
    }

    // Generate secure file path
    const fileExtension = file.name.split('.').pop()
    const fileName = `${Date.now()}_${crypto.randomUUID()}.${fileExtension}`
    const filePath = customPath || `${user.id}/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return createErrorResponse('Failed to upload file', 500)
    }

    // Get public URL for public buckets
    let publicUrl = null
    const publicBuckets = ['avatars', 'banners', 'post-media', 'company-logos', 'community-covers']
    
    if (publicBuckets.includes(bucket)) {
      const { data } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(filePath)
      publicUrl = data.publicUrl
    }

    // Process different file types
    let processedData: any = {}

    if (file.type.startsWith('image/')) {
      // For images, we could add image processing here (resize, optimize, etc.)
      processedData.dimensions = await getImageDimensions(file)
    }

    if (bucket === 'resumes' && file.type === 'application/pdf') {
      // For resumes, we could extract text for AI analysis
      processedData.text_extracted = true
    }

    return createSuccessResponse({
      path: filePath,
      public_url: publicUrl,
      file_name: fileName,
      file_size: file.size,
      file_type: file.type,
      bucket: bucket,
      processed_data: processedData,
      upload_id: uploadData.id
    }, 201)

  } catch (error) {
    console.error('Upload file error:', error)
    return createErrorResponse('Internal server error', 500)
  }
})

// Helper function to get image dimensions
async function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  try {
    const bitmap = await createImageBitmap(file)
    return {
      width: bitmap.width,
      height: bitmap.height
    }
  } catch {
    return null
  }
}