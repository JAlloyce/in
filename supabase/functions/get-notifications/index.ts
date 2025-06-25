import { corsHeaders } from '../_shared/cors.ts'
import { requireAuth, createErrorResponse, createSuccessResponse, supabaseAdmin } from '../_shared/auth.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return createErrorResponse('Method not allowed', 405)
  }

  try {
    const user = await requireAuth(req)
    
    // Parse query parameters
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50)
    const unreadOnly = url.searchParams.get('unread_only') === 'true'
    const type = url.searchParams.get('type') // Filter by notification type

    const offset = (page - 1) * limit

    // Build query
    let query = supabaseAdmin
      .from('notifications')
      .select(`
        id,
        type,
        title,
        content,
        data,
        read,
        created_at,
        profiles!notifications_sender_id_fkey (
          id,
          name,
          avatar_url,
          is_verified
        )
      `)
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (unreadOnly) {
      query = query.eq('read', false)
    }

    if (type) {
      query = query.eq('type', type)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('Notifications query error:', error)
      return createErrorResponse('Failed to fetch notifications', 500)
    }

    // Process notifications
    const processedNotifications = notifications?.map(notification => ({
      ...notification,
      sender: notification.profiles,
      profiles: undefined
    })) || []

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', user.id)

    if (unreadOnly) {
      countQuery = countQuery.eq('read', false)
    }

    if (type) {
      countQuery = countQuery.eq('type', type)
    }

    const { count } = await countQuery

    // Get unread count
    const { count: unreadCount } = await supabaseAdmin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .eq('read', false)

    return createSuccessResponse({
      notifications: processedNotifications,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      },
      unread_count: unreadCount || 0
    })

  } catch (error) {
    console.error('Get notifications error:', error)
    return createErrorResponse('Internal server error', 500)
  }
})