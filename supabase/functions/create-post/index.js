import { corsHeaders } from '../_shared/cors.js'
import { requireAuth, createErrorResponse, createSuccessResponse, supabaseAdmin, validateInput } from '../_shared/auth.js'
import { generatePostInsights } from '../_shared/ai.js'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405)
  }

  try {
    const user = await requireAuth(req)
    const body = await req.json()

    // Validate input
    await validateInput({
      content: ['required'],
      post_type: [],
      source_id: ['uuid']
    }, body)

    if (!body.content || !body.content.trim()) {
      return createErrorResponse('Post content cannot be empty')
    }

    if (body.content.length > 3000) {
      return createErrorResponse('Post content too long (max 3000 characters)')
    }

    // Validate community/page access if specified
    if (body.post_type === 'community' && body.source_id) {
      const { data: membership } = await supabaseAdmin
        .from('community_members')
        .select('id, role')
        .eq('community_id', body.source_id)
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        return createErrorResponse('Not a member of this community', 403)
      }
    }

    // Validate media URLs if provided
    if (body.media_urls && body.media_urls.length > 10) {
      return createErrorResponse('Too many media files (max 10)')
    }

    // Create the post
    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .insert({
        author_id: user.id,
        content: body.content,
        media_urls: body.media_urls || [],
        post_type: body.post_type || 'user',
        source_id: body.source_id || null
      })
      .select(`
        id,
        content,
        media_urls,
        post_type,
        source_id,
        likes_count,
        comments_count,
        shares_count,
        created_at,
        profiles!posts_author_id_fkey (
          id,
          name,
          headline,
          avatar_url,
          is_verified
        )
      `)
      .single()

    if (error) {
      console.error('Post creation error:', error)
      return createErrorResponse('Failed to create post', 500)
    }

    // Generate AI insights for the post (async, don't wait)
    generatePostInsights(body.content)
      .then(insights => {
        // Store insights in a separate table or use them for analytics
        console.log('Post insights:', insights)
      })
      .catch(error => console.error('AI insights error:', error))

    // Create notifications for connections (if user post)
    if (body.post_type === 'user' || !body.post_type) {
      // Get user's connections
      const { data: connections } = await supabaseAdmin
        .from('connections')
        .select('requester_id, receiver_id')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted')

      const connectionIds = connections?.map(conn => 
        conn.requester_id === user.id ? conn.receiver_id : conn.requester_id
      ) || []

      // Create notifications for connections (batch insert)
      if (connectionIds.length > 0) {
        const notifications = connectionIds.map(connectionId => ({
          recipient_id: connectionId,
          sender_id: user.id,
          type: 'post',
          title: 'New post',
          content: `${post.profiles?.name} shared a new post`,
          data: { post_id: post.id }
        }))

        await supabaseAdmin
          .from('notifications')
          .insert(notifications)
      }
    }

    return createSuccessResponse({
      post: {
        ...post,
        author: post.profiles,
        profiles: undefined
      }
    }, 201)

  } catch (error) {
    console.error('Create post error:', error)
    return createErrorResponse('Internal server error', 500)
  }
})