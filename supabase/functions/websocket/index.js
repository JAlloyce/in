import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const upgrade = req.headers.get("upgrade") || "";
  
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("This endpoint requires WebSocket", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  // Get JWT from query params for authentication
  const url = new URL(req.url);
  const jwt = url.searchParams.get("jwt");
  
  if (!jwt) {
    console.error("Auth token not provided");
    return new Response("Auth token not provided", { 
      status: 403,
      headers: corsHeaders 
    });
  }

  // Create Supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  )

  // Verify JWT and get user
  const { data, error } = await supabase.auth.getUser(jwt);
  
  if (error || !data.user) {
    console.error(error);
    return new Response("Invalid token provided", { 
      status: 403,
      headers: corsHeaders 
    });
  }

  const userId = data.user.id;
  const socketId = crypto.randomUUID();

  // Upgrade to WebSocket
  const { socket, response } = Deno.upgradeWebSocket(req);

  // Update user presence on connection
  socket.onopen = async () => {
    console.log(`WebSocket connected: ${userId} (${socketId})`);
    
    // Update presence to online
    await supabase
      .from('presence')
      .upsert({
        user_id: userId,
        status: 'online',
        socket_id: socketId,
        last_seen: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    // Send connection acknowledgment
    socket.send(JSON.stringify({
      type: 'connected',
      socketId,
      userId
    }));
  };

  // Handle incoming messages
  socket.onmessage = async (e) => {
    try {
      const message = JSON.parse(e.data);
      console.log("Received message:", message.type);
      
      switch (message.type) {
        case 'ping':
          // Handle heartbeat
          socket.send(JSON.stringify({ type: 'pong' }));
          await updatePresence(supabase, userId);
          break;

        case 'message:send':
          // Handle real-time messaging
          await handleMessage(supabase, socket, message, userId);
          break;

        case 'typing:start':
        case 'typing:stop':
          // Handle typing indicators
          await handleTypingIndicator(supabase, socket, message, userId);
          break;

        case 'presence:update':
          // Update user status
          await updatePresence(supabase, userId, message.status);
          break;

        case 'post:interaction':
          // Handle real-time post interactions
          await handlePostInteraction(supabase, socket, message, userId);
          break;

        case 'notification:read':
          // Mark notification as read
          await handleNotificationRead(supabase, message, userId);
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Message handling error:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Failed to process message'
      }));
    }
  };

  // Handle errors
  socket.onerror = (e) => console.log("WebSocket error:", e);

  // Handle disconnection
  socket.onclose = async () => {
    console.log(`WebSocket disconnected: ${userId}`);
    
    // Update presence to offline
    await supabase
      .from('presence')
      .update({
        status: 'offline',
        last_seen: new Date().toISOString()
      })
      .eq('user_id', userId);
  };

  return response;
});

// Helper functions

async function updatePresence(supabase, userId, status = 'online') {
  await supabase
    .from('presence')
    .update({
      status,
      last_seen: new Date().toISOString()
    })
    .eq('user_id', userId);
}

async function handleMessage(supabase, socket, message, senderId) {
  const { conversationId, content, recipientId } = message.data;
  
  // Save message to database
  const { data: newMessage, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      is_read: false
    })
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey (
        id, name, avatar_url
      )
    `)
    .single();

  if (error) {
    console.error('Failed to save message:', error);
    socket.send(JSON.stringify({
      type: 'error',
      message: 'Failed to send message'
    }));
    return;
  }

  // Send confirmation to sender
  socket.send(JSON.stringify({
    type: 'message:sent',
    data: newMessage
  }));

  // Create notification for recipient
  await supabase
    .from('notifications')
    .insert({
      recipient_id: recipientId,
      sender_id: senderId,
      type: 'message',
      title: 'New message',
      message: `You have a new message`,
      user_id: recipientId,
      data: { conversation_id: conversationId }
    });
}

async function handleTypingIndicator(supabase, socket, message, userId) {
  // In a real implementation, you would broadcast this to other connected users
  // For now, we'll just acknowledge it
  socket.send(JSON.stringify({
    type: 'typing:ack',
    data: { userId }
  }));
}

async function handlePostInteraction(supabase, socket, message, userId) {
  const { action, postId, data } = message.data;
  
  // Send acknowledgment
  socket.send(JSON.stringify({
    type: 'post:interaction:ack',
    data: {
      postId,
      action,
      userId
    }
  }));
}

async function handleNotificationRead(supabase, message, userId) {
  const { notificationId } = message.data;
  
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId);
} 