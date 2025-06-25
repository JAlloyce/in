import { corsHeaders } from '../_shared/cors.js'
import { requireAuth, createErrorResponse, createSuccessResponse, supabaseAdmin, validateInput } from '../_shared/auth.js'

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
    if (!body.recipient_id && !body.conversation_id) {
      return createErrorResponse('Either recipient_id or conversation_id is required')
    }

    if (!body.content && !body.media_url) {
      return createErrorResponse('Message content or media is required')
    }

    if (body.content && body.content.length > 5000) {
      return createErrorResponse('Message content too long (max 5000 characters)')
    }

    let conversationId = body.conversation_id

    // If no conversation_id provided, find or create one
    if (!conversationId && body.recipient_id) {
      // Check if recipient exists
      const { data: recipient } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', body.recipient_id)
        .single()

      if (!recipient) {
        return createErrorResponse('Recipient not found', 404)
      }

      // Don't allow messaging yourself
      if (body.recipient_id === user.id) {
        return createErrorResponse('Cannot send messages to yourself')
      }

      // Check if conversation already exists between these users
      const { data: existingConversation } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .or(`and(participant_ids.cs.{${user.id}},participant_ids.cs.{${body.recipient_id}})`)
        .single()

      if (existingConversation) {
        conversationId = existingConversation.id
      } else {
        // Create new conversation
        const { data: newConversation, error: convError } = await supabaseAdmin
          .from('conversations')
          .insert({
            participant_ids: [user.id, body.recipient_id],
            is_group: false
          })
          .select('id')
          .single()

        if (convError) {
          console.error('Conversation creation error:', convError)
          return createErrorResponse('Failed to create conversation', 500)
        }

        conversationId = newConversation.id
      }
    }

    // Verify user is participant in the conversation
    const { data: conversation } = await supabaseAdmin
      .from('conversations')
      .select('participant_ids')
      .eq('id', conversationId)
      .single()

    if (!conversation || !conversation.participant_ids.includes(user.id)) {
      return createErrorResponse('Not authorized to send message in this conversation', 403)
    }

    // Create the message
    const { data: message, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: body.content || null,
        media_url: body.media_url || null,
        message_type: body.media_url ? 'media' : 'text'
      })
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        media_url,
        message_type,
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

    // Update conversation's last message info
    await supabaseAdmin
      .from('conversations')
      .update({
        last_message_id: message.id,
        last_message_at: message.created_at,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    // Create notifications for other participants
    const otherParticipants = conversation.participant_ids.filter(id => id !== user.id)
    
    if (otherParticipants.length > 0) {
      const notifications = otherParticipants.map(participantId => ({
        recipient_id: participantId,
        sender_id: user.id,
        type: 'message',
        title: 'New message',
        content: `${message.profiles?.name} sent you a message`,
        data: { 
          conversation_id: conversationId,
          message_id: message.id
        }
      }))

      await supabaseAdmin
        .from('notifications')
        .insert(notifications)
    }

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