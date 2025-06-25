import { corsHeaders } from '../_shared/cors.ts'
import { requireAuth, createErrorResponse, createSuccessResponse, supabaseAdmin } from '../_shared/auth.ts'

interface SendMessageRequest {
  recipient_id?: string
  conversation_id?: string
  content?: string
  media_url?: string
  message_type?: 'text' | 'image' | 'file' | 'voice'
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
    const body: SendMessageRequest = await req.json()

    // Validate input
    if (!body.content && !body.media_url) {
      return createErrorResponse('Message content or media is required')
    }

    if (body.content && body.content.length > 2000) {
      return createErrorResponse('Message too long (max 2000 characters)')
    }

    let conversationId = body.conversation_id

    // If no conversation ID, create or find conversation with recipient
    if (!conversationId && body.recipient_id) {
      // Check if conversation already exists between these users
      const { data: existingConversation } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .contains('participants', [user.id])
        .contains('participants', [body.recipient_id])
        .eq('participants->size', 2) // Ensure it's a 1-on-1 conversation
        .single()

      if (existingConversation) {
        conversationId = existingConversation.id
      } else {
        // Create new conversation
        const { data: newConversation, error: createError } = await supabaseAdmin
          .from('conversations')
          .insert({
            participants: [user.id, body.recipient_id]
          })
          .select('id')
          .single()

        if (createError) {
          return createErrorResponse('Failed to create conversation', 500)
        }

        conversationId = newConversation.id
      }
    }

    if (!conversationId) {
      return createErrorResponse('Conversation ID or recipient ID is required')
    }

    // Verify user is part of the conversation
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('id, participants')
      .eq('id', conversationId)
      .single()

    if (convError || !conversation) {
      return createErrorResponse('Conversation not found', 404)
    }

    if (!conversation.participants.includes(user.id)) {
      return createErrorResponse('Not authorized to send messages in this conversation', 403)
    }

    // Create the message
    const { data: message, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: body.content,
        media_url: body.media_url,
        message_type: body.message_type || 'text',
        read_by: [user.id] // Sender has read it by default
      })
      .select(`
        id,
        content,
        media_url,
        message_type,
        read_by,
        created_at,
        profiles!messages_sender_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .single()

    if (messageError) {
      console.error('Message creation error:', messageError)
      return createErrorResponse('Failed to send message', 500)
    }

    // Update conversation last_message_at
    await supabaseAdmin
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    // Create notifications for other participants
    const otherParticipants = conversation.participants.filter(id => id !== user.id)
    
    if (otherParticipants.length > 0) {
      const notifications = otherParticipants.map(participantId => ({
        recipient_id: participantId,
        sender_id: user.id,
        type: 'message' as any,
        title: 'New message',
        content: body.message_type === 'text' 
          ? (body.content?.substring(0, 100) + (body.content?.length > 100 ? '...' : ''))
          : `Sent ${body.message_type === 'image' ? 'an image' : body.message_type === 'file' ? 'a file' : 'a voice message'}`,
        data: { 
          conversation_id: conversationId,
          message_id: message.id
        }
      }))

      await supabaseAdmin
        .from('notifications')
        .insert(notifications)
    }

    // The real-time subscription will handle broadcasting to connected clients
    // via the Supabase Realtime system

    return createSuccessResponse({
      message: {
        ...message,
        sender: message.profiles,
        profiles: undefined
      },
      conversation_id: conversationId
    }, 201)

  } catch (error) {
    console.error('Send message error:', error)
    return createErrorResponse('Internal server error', 500)
  }
})