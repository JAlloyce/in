-- Fix foreign key relationships and add missing tables
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. Add missing foreign key relationships
-- =====================================================

-- Add foreign key constraint for posts -> profiles relationship
ALTER TABLE public.posts 
ADD CONSTRAINT posts_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for likes -> profiles relationship
ALTER TABLE public.likes 
ADD CONSTRAINT likes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for comments -> profiles relationship
ALTER TABLE public.comments 
ADD CONSTRAINT comments_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- =====================================================
-- 2. Create missing notifications table
-- =====================================================

CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Add foreign key constraints for notifications
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_recipient_id_fkey 
FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- =====================================================
-- 3. Create missing tables that might be referenced
-- =====================================================

-- Connections table
CREATE TABLE public.connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id)
);

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Connections policies
CREATE POLICY "Users can view their connections" ON public.connections
  FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create connection requests" ON public.connections
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update received requests" ON public.connections
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Add foreign key constraints
ALTER TABLE public.connections 
ADD CONSTRAINT connections_requester_id_fkey 
FOREIGN KEY (requester_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.connections 
ADD CONSTRAINT connections_receiver_id_fkey 
FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- =====================================================
-- 4. Create conversations and messages tables
-- =====================================================

-- Conversations table
CREATE TABLE public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_1_id, participant_2_id)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Add foreign key constraints
ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_participant_1_id_fkey 
FOREIGN KEY (participant_1_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_participant_2_id_fkey 
FOREIGN KEY (participant_2_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Messages table
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Add foreign key constraints
ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- =====================================================
-- 5. Grant permissions for new tables
-- =====================================================

GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.connections TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.messages TO authenticated;

GRANT SELECT ON public.notifications TO anon;
GRANT SELECT ON public.connections TO anon;
GRANT SELECT ON public.conversations TO anon;
GRANT SELECT ON public.messages TO anon;

-- =====================================================
-- 6. Create indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON public.notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_connections_requester_id ON public.connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver_id ON public.connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1_id ON public.conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2_id ON public.conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

-- =====================================================
-- 7. Insert sample posts for testing
-- =====================================================

-- Get the first user (should be your OAuth user)
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get the first user from profiles
    SELECT id INTO user_uuid FROM public.profiles LIMIT 1;
    
    IF user_uuid IS NOT NULL THEN
        -- Insert sample posts
        INSERT INTO public.posts (content, author_id) VALUES
        ('Welcome to LinkedIn Clone! Excited to be here and connect with amazing professionals. 🚀', user_uuid),
        ('Just completed a great project using React and Supabase. The OAuth integration was smooth!', user_uuid),
        ('Looking forward to building more connections and sharing knowledge with the community.', user_uuid);
        
        -- Insert sample notifications
        INSERT INTO public.notifications (recipient_id, sender_id, type, title, message) VALUES
        (user_uuid, user_uuid, 'welcome', 'Welcome to LinkedIn Clone!', 'Thank you for joining our professional network.'),
        (user_uuid, user_uuid, 'system', 'Profile Setup Complete', 'Your profile has been successfully created.');
        
        RAISE NOTICE 'Sample data created for user %', user_uuid;
    ELSE
        RAISE NOTICE 'No users found in profiles table';
    END IF;
END $$;

-- =====================================================
-- 8. Verify foreign key relationships
-- =====================================================

-- Check foreign key constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- Check that we have data
SELECT 'Profiles' as table_name, count(*) as count FROM public.profiles
UNION ALL
SELECT 'Companies', count(*) FROM public.companies  
UNION ALL
SELECT 'Posts', count(*) FROM public.posts
UNION ALL
SELECT 'Notifications', count(*) FROM public.notifications
ORDER BY table_name;