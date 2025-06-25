-- Fix Missing Database Tables
-- This script creates the notifications and connections tables that are missing

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'connection_request', 'connection_accepted', 'job_application', 'mention')),
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    connection_id UUID,
    data JSONB DEFAULT '{}'::jsonb
);

-- Create notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON public.notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- 2. Create connections table
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    message TEXT,
    UNIQUE(requester_id, receiver_id)
);

-- Create connections indexes
CREATE INDEX IF NOT EXISTS idx_connections_requester_id ON public.connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver_id ON public.connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections(status);
CREATE INDEX IF NOT EXISTS idx_connections_created_at ON public.connections(created_at DESC);

-- Add foreign key reference for notifications connection_id
ALTER TABLE public.notifications ADD CONSTRAINT notifications_connection_id_fkey 
FOREIGN KEY (connection_id) REFERENCES public.connections(id) ON DELETE CASCADE;

-- 3. Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (
        auth.uid() = recipient_id
    );

CREATE POLICY "Users can insert notifications for others" ON public.notifications
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id OR sender_id IS NULL
    );

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (
        auth.uid() = recipient_id
    );

-- 5. Create RLS Policies for connections
CREATE POLICY "Users can view their own connections" ON public.connections
    FOR SELECT USING (
        auth.uid() = requester_id OR auth.uid() = receiver_id
    );

CREATE POLICY "Users can create connection requests" ON public.connections
    FOR INSERT WITH CHECK (
        auth.uid() = requester_id
    );

CREATE POLICY "Users can update connections they're involved in" ON public.connections
    FOR UPDATE USING (
        auth.uid() = requester_id OR auth.uid() = receiver_id
    );

-- 6. Create notification trigger function
CREATE OR REPLACE FUNCTION public.create_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification for likes
    IF TG_TABLE_NAME = 'likes' THEN
        INSERT INTO public.notifications (recipient_id, sender_id, type, title, message, post_id)
        SELECT 
            p.created_by,
            NEW.user_id,
            'like',
            'Someone liked your post',
            'Your post received a new like',
            NEW.post_id
        FROM public.posts p
        WHERE p.id = NEW.post_id
        AND p.created_by != NEW.user_id; -- Don't notify users about their own likes
    END IF;

    -- Create notification for comments
    IF TG_TABLE_NAME = 'comments' THEN
        INSERT INTO public.notifications (recipient_id, sender_id, type, title, message, post_id, comment_id)
        SELECT 
            p.created_by,
            NEW.user_id,
            'comment',
            'Someone commented on your post',
            LEFT(NEW.content, 100),
            NEW.post_id,
            NEW.id
        FROM public.posts p
        WHERE p.id = NEW.post_id
        AND p.created_by != NEW.user_id; -- Don't notify users about their own comments
    END IF;

    -- Create notification for connection requests
    IF TG_TABLE_NAME = 'connections' AND NEW.status = 'pending' THEN
        INSERT INTO public.notifications (recipient_id, sender_id, type, title, message, connection_id)
        VALUES (
            NEW.receiver_id,
            NEW.requester_id,
            'connection_request',
            'New connection request',
            'Someone wants to connect with you',
            NEW.id
        );
    END IF;

    -- Create notification for accepted connections
    IF TG_TABLE_NAME = 'connections' AND NEW.status = 'accepted' AND OLD.status = 'pending' THEN
        INSERT INTO public.notifications (recipient_id, sender_id, type, title, message, connection_id)
        VALUES (
            NEW.requester_id,
            NEW.receiver_id,
            'connection_accepted',
            'Connection request accepted',
            'Your connection request was accepted',
            NEW.id
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create notification triggers
DO $$ 
BEGIN
    -- Drop existing triggers if they exist
    DROP TRIGGER IF EXISTS create_like_notification ON public.likes;
    DROP TRIGGER IF EXISTS create_comment_notification ON public.comments;
    DROP TRIGGER IF EXISTS create_connection_notification ON public.connections;
    
    -- Create new triggers
    CREATE TRIGGER create_like_notification
        AFTER INSERT ON public.likes
        FOR EACH ROW EXECUTE FUNCTION public.create_notification();

    CREATE TRIGGER create_comment_notification
        AFTER INSERT ON public.comments
        FOR EACH ROW EXECUTE FUNCTION public.create_notification();

    CREATE TRIGGER create_connection_notification
        AFTER INSERT OR UPDATE ON public.connections
        FOR EACH ROW EXECUTE FUNCTION public.create_notification();
END $$;

-- 8. Add sample notifications for testing
INSERT INTO public.notifications (recipient_id, sender_id, type, title, message)
SELECT 
    '950c554c-a3e2-47bd-88f3-9cbc3da7b80c',
    id,
    'connection_request',
    'Welcome to LinkedIn Clone!',
    'Thanks for joining our platform. Start connecting with professionals.'
FROM public.profiles 
WHERE id != '950c554c-a3e2-47bd-88f3-9cbc3da7b80c'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.connections TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Update updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers for new tables
CREATE TRIGGER handle_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_connections_updated_at
    BEFORE UPDATE ON public.connections
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

COMMIT;