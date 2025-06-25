-- 🚨 QUICK FIX: Notifications table missing user_id column
-- This fixes the error: column "user_id" does not exist

-- First, let's check what columns actually exist in notifications table
-- and add the missing ones

DO $$ 
BEGIN
    -- Add user_id column if it doesn't exist (for the recipient of the notification)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
    END IF;
    
    -- Add post_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'post_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_notifications_post_id ON public.notifications(post_id);
    END IF;
    
    -- Add from_user_id column if it doesn't exist  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'from_user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN from_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_notifications_from_user_id ON public.notifications(from_user_id);
    END IF;

    -- Add type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN type TEXT DEFAULT 'general';
    END IF;

    -- Add title column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'title'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN title TEXT DEFAULT 'Notification';
    END IF;

    -- Add message column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'message'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN message TEXT DEFAULT 'You have a new notification';
    END IF;

    -- Add is_read column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'is_read'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Update the policies to use the correct column name
DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.notifications TO authenticated;

-- ✅ NOTIFICATIONS TABLE FIXED!
-- This adds all missing columns to notifications table:
-- ✅ user_id (recipient of notification)
-- ✅ post_id (related post if applicable)
-- ✅ from_user_id (who triggered the notification)
-- ✅ type, title, message, is_read (notification details)