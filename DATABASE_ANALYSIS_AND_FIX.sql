-- LinkedIn Clone Database Analysis and Fix Script
-- Run this in Supabase SQL Editor to fix any schema issues

-- 1. Add missing tables for messaging functionality
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  participant_1_id uuid NOT NULL,
  participant_2_id uuid NOT NULL,
  last_message_at timestamp with time zone,
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_participant_1_id_fkey FOREIGN KEY (participant_1_id) REFERENCES public.profiles(id),
  CONSTRAINT conversations_participant_2_id_fkey FOREIGN KEY (participant_2_id) REFERENCES public.profiles(id),
  CONSTRAINT unique_participants UNIQUE (participant_1_id, participant_2_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE,
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);

-- 2. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_1_id, participant_2_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_likes_post_user ON public.likes(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections(status);

-- 3. Add missing columns if they don't exist
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_urls text[] DEFAULT '{}';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS post_type text DEFAULT 'user' CHECK (post_type IN ('user', 'community', 'page'));
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS source_id uuid;

-- 4. Add WebSocket presence table for real-time features
CREATE TABLE IF NOT EXISTS public.presence (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  status text DEFAULT 'online' CHECK (status IN ('online', 'away', 'offline')),
  last_seen timestamp with time zone DEFAULT now(),
  socket_id text,
  CONSTRAINT presence_pkey PRIMARY KEY (id),
  CONSTRAINT presence_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT unique_user_presence UNIQUE (user_id)
);

-- 5. Create table for AI chat history
CREATE TABLE IF NOT EXISTS public.workspace_ai_chats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message text NOT NULL,
  response text,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT workspace_ai_chats_pkey PRIMARY KEY (id),
  CONSTRAINT workspace_ai_chats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

-- 6. Enable Row Level Security on all tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_ai_chats ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for messaging
CREATE POLICY "Users can view their own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
    )
  );

-- 8. Create RLS policies for presence
CREATE POLICY "Anyone can view presence" ON public.presence
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own presence" ON public.presence
  FOR ALL USING (auth.uid() = user_id);

-- 9. Create RLS policies for AI chats
CREATE POLICY "Users can view their own AI chats" ON public.workspace_ai_chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI chats" ON public.workspace_ai_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. Create function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create trigger for updating conversation timestamp
CREATE TRIGGER update_conversation_timestamp
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message();

-- 12. Fix any orphaned foreign keys or data integrity issues
-- Clean up likes without valid posts
DELETE FROM public.likes WHERE post_id NOT IN (SELECT id FROM public.posts);

-- Clean up comments without valid posts
DELETE FROM public.comments WHERE post_id NOT IN (SELECT id FROM public.posts);

-- 13. Grant necessary permissions
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.presence TO authenticated;
GRANT ALL ON public.workspace_ai_chats TO authenticated;

-- 14. Create updated_at triggers for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Done! Your database schema is now complete and optimized. 