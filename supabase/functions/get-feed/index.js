import { corsHeaders } from '../_shared/cors.js'
import { requireAuth, createErrorResponse, createSuccessResponse, supabaseAdmin } from '../_shared/auth.js'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authenticate user
    const user = await requireAuth(req)
    
    // Parse query parameters
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50) // Max 50 posts
    const type = url.searchParams.get('type') || 'all'
    const source_id = url.searchParams.get('source_id') || undefined

    const offset = (page - 1) * limit

    // Build the feed query based on type
    let query = supabaseAdmin
      .from('posts')
      .select(`
        id,
        content,
        media_urls,
        post_type,
        source_id,
        likes_count,
        comments_count,
        shares_count,
        views_count,
        created_at,
        updated_at,
        profiles!posts_author_id_fkey (
          id,
          name,
          headline,
          avatar_url,
          is_verified
        ),
        likes!inner (
          id,
          user_id
        ),
        comments (
          id,
          content,
          created_at,
          profiles!comments_author_id_fkey (
            id,
            name,
            avatar_url
          )
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters based on feed type
    if (type === 'connections') {
      // Get user's connections first
      const { data: connections } = await supabaseAdmin
        .from('connections')
        .select('requester_id, receiver_id')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted')

      const connectionIds = connections?.map(conn => 
        conn.requester_id === user.id ? conn.receiver_id : conn.requester_id
      ) || []

      // Add user's own posts
      connectionIds.push(user.id)

      query = query.in('author_id', connectionIds)
    } else if (type === 'community' && source_id) {
      // Check if user is member of the community
      const { data: membership } = await supabaseAdmin
        .from('community_members')
        .select('id')
        .eq('community_id', source_id)
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        return createErrorResponse('Not a member of this community', 403)
      }

      query = query
        .eq('post_type', 'community')
        .eq('source_id', source_id)
    } else {
      // 'all' type - posts from connections and public communities
      const { data: connections } = await supabaseAdmin
        .from('connections')
        .select('requester_id, receiver_id')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted')

      const connectionIds = connections?.map(conn => 
        conn.requester_id === user.id ? conn.receiver_id : conn.requester_id
      ) || []
      connectionIds.push(user.id)

      // Get user's community memberships
      const { data: communityMemberships } = await supabaseAdmin
        .from('community_members')
        .select('community_id')
        .eq('user_id', user.id)

      const communityIds = communityMemberships?.map(m => m.community_id) || []

      // Complex query for mixed feed
      if (connectionIds.length > 0 && communityIds.length > 0) {
        query = query.or(`
          and(post_type.eq.user,author_id.in.(${connectionIds.join(',')})),
          and(post_type.eq.community,source_id.in.(${communityIds.join(',')}))
        `)
      } else if (connectionIds.length > 0) {
        query = query.eq('post_type', 'user').in('author_id', connectionIds)
      } else if (communityIds.length > 0) {
        query = query.eq('post_type', 'community').in('source_id', communityIds)
      }
    }

    const { data: posts, error } = await query

    if (error) {
      console.error('Feed query error:', error)
      return createErrorResponse('Failed to fetch feed', 500)
    }

    // Process posts to add user interaction flags
    const processedPosts = await Promise.all(posts?.map(async (post) => {
      // Check if current user liked this post
      const userLiked = post.likes?.some(like => like.user_id === user.id) || false

      // Get recent comments (limit to 3 for feed)
      const recentComments = post.comments
        ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        ?.slice(0, 3) || []

      // Update view count
      await supabaseAdmin
        .from('posts')
        .update({ views_count: (post.views_count || 0) + 1 })
        .eq('id', post.id)

      return {
        ...post,
        author: post.profiles,
        user_liked: userLiked,
        recent_comments: recentComments,
        // Remove the raw relations to clean up response
        profiles: undefined,
        likes: undefined,
        comments: undefined
      }
    }) || [])

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('posts')
      .select('id', { count: 'exact', head: true })

    if (type === 'connections') {
      const { data: connections } = await supabaseAdmin
        .from('connections')
        .select('requester_id, receiver_id')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted')

      const connectionIds = connections?.map(conn => 
        conn.requester_id === user.id ? conn.receiver_id : conn.requester_id
      ) || []
      connectionIds.push(user.id)

      countQuery = countQuery.in('author_id', connectionIds)
    }

    const { count } = await countQuery

    return createSuccessResponse({
      posts: processedPosts,
      pagination: {
        page: page,
        limit: limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Feed error:', error)
    return createErrorResponse('Internal server error', 500)
  }
})