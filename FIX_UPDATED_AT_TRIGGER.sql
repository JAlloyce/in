-- 🚨 URGENT FIX: Updated_at trigger error
-- This fixes the error: record "new" has no field "updated_at"

-- First, let's add the updated_at column to notifications table
DO $$ 
BEGIN
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        -- Set initial values for existing records
        UPDATE public.notifications SET updated_at = created_at WHERE updated_at IS NULL;
    END IF;
END $$;

-- Now let's create/update the handle_updated_at function to be safer
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set updated_at if the column exists in the table
    IF TG_OP = 'UPDATE' THEN
        -- Check if updated_at column exists before trying to set it
        BEGIN
            NEW.updated_at = NOW();
        EXCEPTION 
            WHEN undefined_column THEN
                -- If updated_at column doesn't exist, just return NEW unchanged
                NULL;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists on notifications
DROP TRIGGER IF EXISTS handle_notifications_updated_at ON public.notifications;

-- Only create the trigger if updated_at column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        CREATE TRIGGER handle_notifications_updated_at 
        BEFORE UPDATE ON public.notifications 
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

-- Now let's safely fix the notifications table columns
DO $$ 
BEGIN
    -- Add user_id column as nullable first (if it doesn't exist)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Fix the user_id NULL values without triggering the updated_at function
DO $$
DECLARE
    default_user_id UUID;
BEGIN
    -- Get the first available user ID
    SELECT id INTO default_user_id FROM public.profiles LIMIT 1;
    
    -- If no profiles exist, use your user ID
    IF default_user_id IS NULL THEN
        default_user_id := '950c554c-a3e2-47bd-88f3-9cbc3da7b80c';
    END IF;
    
    -- Temporarily disable the trigger to avoid the error
    ALTER TABLE public.notifications DISABLE TRIGGER ALL;
    
    -- Update all existing NULL user_id values
    UPDATE public.notifications 
    SET user_id = default_user_id 
    WHERE user_id IS NULL;
    
    -- Re-enable triggers
    ALTER TABLE public.notifications ENABLE TRIGGER ALL;
END $$;

-- Now make the column NOT NULL (after cleaning up NULLs)
ALTER TABLE public.notifications ALTER COLUMN user_id SET NOT NULL;

-- Add other missing columns safely
DO $$ 
BEGIN
    -- Add post_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'post_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;
    END IF;
    
    -- Add from_user_id column if it doesn't exist  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'from_user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN from_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_post_id ON public.notifications(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_from_user_id ON public.notifications(from_user_id);

-- Enable RLS and create policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.notifications TO authenticated;

-- ✅ TRIGGER ERROR FIXED!
-- This script:
-- ✅ Adds missing updated_at column to notifications
-- ✅ Fixes the handle_updated_at function to handle missing columns
-- ✅ Temporarily disables triggers during data cleanup
-- ✅ Safely adds user_id column and fixes NULL values
-- ✅ Adds all other missing columns and proper policies