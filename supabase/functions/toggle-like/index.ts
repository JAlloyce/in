import { corsHeaders } from '../_shared/cors.ts'
import { requireAuth, createErrorResponse, createSuccessResponse, supabaseAdmin } from '../_shared/auth.ts'

interface ToggleLikeRequest {
  post_id: string
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
    const body: ToggleLikeRequest = await req.json()

    if (!body.post_id) {
      return createErrorResponse('Post ID is required')
    }

    // Check if post exists and user can access it
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select(`
        id,
        author_id,
        content,
        profiles!posts_author_id_fkey (
          id,
          name
        )
      `)
      .eq('id', body.post_id)
      .single()

    if (postError || !post) {
      return createErrorResponse('Post not found', 404)
    }

    // Check if user already liked this post
    const { data: existingLike } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('post_id', body.post_id)
      .eq('user_id', user.id)
      .single()

    let isLiked = false

    if (existingLike) {
      // Unlike the post
      const { error } = await supabaseAdmin
        .from('likes')
        .delete()
        .eq('id', existingLike.id)

      if (error) {
        return createErrorResponse('Failed to unlike post', 500)
      }

      isLiked = false
    } else {
      // Like the post
      const { error } = await supabaseAdmin
        .from('likes')
        .insert({
          post_id: body.post_id,
          user_id: user.id
        })

      if (error) {
        return createErrorResponse('Failed to like post', 500)
      }

      // Create notification for post author (if not self-like)
      if (post.author_id !== user.id) {
        const { data: userProfile } = await supabaseAdmin
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single()

        await supabaseAdmin
          .from('notifications')
          .insert({
            recipient_id: post.author_id,
            sender_id: user.id,
            type: 'like',
            title: 'New like',
            content: `${userProfile?.name} liked your post`,
            data: { post_id: body.post_id }
          })
      }

      isLiked = true
    }

    // Get updated like count
    const { data: updatedPost } = await supabaseAdmin
      .from('posts')
      .select('likes_count')
      .eq('id', body.post_id)
      .single()

    return createSuccessResponse({
      liked: isLiked,
      likes_count: updatedPost?.likes_count || 0
    })

  } catch (error) {
    console.error('Toggle like error:', error)
    return createErrorResponse('Internal server error', 500)
  }
})