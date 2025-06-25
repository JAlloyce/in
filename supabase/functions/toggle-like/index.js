import { corsHeaders } from '../_shared/cors.js'
import { requireAuth, createErrorResponse, createSuccessResponse, supabaseAdmin } from '../_shared/auth.js'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405)
  }

  try {
    const user = await requireAuth(req)
    const { post_id } = await req.json()

    if (!post_id) {
      return createErrorResponse('Post ID is required')
    }

    // Check if post exists
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('id, author_id, likes_count')
      .eq('id', post_id)
      .single()

    if (postError || !post) {
      return createErrorResponse('Post not found', 404)
    }

    // Check if user already liked this post
    const { data: existingLike } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', user.id)
      .single()

    let liked = false
    let newLikesCount = post.likes_count || 0

    if (existingLike) {
      // Unlike the post
      await supabaseAdmin
        .from('likes')
        .delete()
        .eq('id', existingLike.id)

      newLikesCount = Math.max(0, newLikesCount - 1)
    } else {
      // Like the post
      await supabaseAdmin
        .from('likes')
        .insert({
          post_id: post_id,
          user_id: user.id
        })

      liked = true
      newLikesCount += 1

      // Create notification for post author (if not liking own post)
      if (post.author_id !== user.id) {
        const { data: liker } = await supabaseAdmin
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
            content: `${liker?.name || 'Someone'} liked your post`,
            data: { post_id: post_id }
          })
      }
    }

    // Update the post's like count
    await supabaseAdmin
      .from('posts')
      .update({ likes_count: newLikesCount })
      .eq('id', post_id)

    return createSuccessResponse({
      liked,
      likes_count: newLikesCount,
      message: liked ? 'Post liked' : 'Post unliked'
    })

  } catch (error) {
    console.error('Toggle like error:', error)
    return createErrorResponse('Internal server error', 500)
  }
})