-- 🚨 URGENT FIX: Notifications table has NULL values
-- This fixes the error: column "user_id" contains null values

-- First, let's safely add the user_id column allowing NULL values initially,
-- then clean up the data and make it NOT NULL

DO $$ 
BEGIN
    -- Step 1: Add user_id column as nullable first
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        -- Add as nullable column first
        ALTER TABLE public.notifications ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
        
        -- Get a default user ID (first profile in the system)
        DECLARE
            default_user_id UUID;
        BEGIN
            SELECT id INTO default_user_id FROM public.profiles LIMIT 1;
            
            -- If no profiles exist, create a system user
            IF default_user_id IS NULL THEN
                INSERT INTO public.profiles (id, name, headline) 
                VALUES (gen_random_uuid(), 'System', 'System Notifications')
                RETURNING id INTO default_user_id;
            END IF;
            
            -- Update all existing NULL user_id values with default user
            UPDATE public.notifications 
            SET user_id = default_user_id 
            WHERE user_id IS NULL;
            
            -- Now make the column NOT NULL
            ALTER TABLE public.notifications ALTER COLUMN user_id SET NOT NULL;
        END;
        
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
    END IF;
    
    -- Add other missing columns (as nullable to avoid conflicts)
    
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
        -- Update existing NULL values
        UPDATE public.notifications SET type = 'general' WHERE type IS NULL;
    END IF;

    -- Add title column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'title'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN title TEXT DEFAULT 'Notification';
        -- Update existing NULL values
        UPDATE public.notifications SET title = 'Notification' WHERE title IS NULL;
    END IF;

    -- Add message column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'message'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN message TEXT DEFAULT 'You have a new notification';
        -- Update existing NULL values
        UPDATE public.notifications SET message = 'You have a new notification' WHERE message IS NULL;
    END IF;

    -- Add is_read column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'is_read'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
        -- Update existing NULL values
        UPDATE public.notifications SET is_read = FALSE WHERE is_read IS NULL;
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

-- ✅ NOTIFICATIONS TABLE SAFELY FIXED!
-- This script:
-- ✅ Safely adds user_id column without NULL constraint errors
-- ✅ Assigns existing notifications to a default user
-- ✅ Makes user_id NOT NULL after cleaning up data
-- ✅ Adds all other missing columns safely
-- ✅ Updates existing NULL values with defaults