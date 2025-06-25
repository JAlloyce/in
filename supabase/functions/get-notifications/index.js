import { corsHeaders } from '../_shared/cors.js'
import { requireAuth, createErrorResponse, createSuccessResponse, supabaseAdmin } from '../_shared/auth.js'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return createErrorResponse('Method not allowed', 405)
  }

  try {
    const user = await requireAuth(req)
    const url = new URL(req.url)
    
    // Parse query parameters
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50)
    const unread_only = url.searchParams.get('unread_only') === 'true'
    
    const offset = (page - 1) * limit

    // Build notifications query
    let query = supabaseAdmin
      .from('notifications')
      .select(`
        id,
        type,
        title,
        content,
        data,
        is_read,
        created_at,
        profiles!notifications_sender_id_fkey (
          id,
          name,
          avatar_url,
          headline
        )
      `)
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (unread_only) {
      query = query.eq('is_read', false)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('Notifications query error:', error)
      return createErrorResponse('Failed to fetch notifications', 500)
    }

    // Get unread count
    const { count: unreadCount } = await supabaseAdmin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .eq('is_read', false)

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', user.id)

    if (unread_only) {
      countQuery = countQuery.eq('is_read', false)
    }

    const { count: totalCount } = await countQuery

    // Process notifications
    const processedNotifications = notifications?.map(notification => ({
      ...notification,
      sender: notification.profiles,
      profiles: undefined
    })) || []

    return createSuccessResponse({
      notifications: processedNotifications,
      unread_count: unreadCount || 0,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        total_pages: Math.ceil((totalCount || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Get notifications error:', error)
    return createErrorResponse('Internal server error', 500)
  }
})