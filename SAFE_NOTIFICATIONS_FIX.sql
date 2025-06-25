-- 🚨 SAFE FIX: Updated_at trigger error without disabling system triggers
-- This fixes the error without touching system triggers

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

-- Create a safer handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set updated_at if the column exists and this is an UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Use dynamic SQL to safely check if column exists
        EXECUTE format('UPDATE %I.%I SET updated_at = NOW() WHERE id = $1', 
                      TG_TABLE_SCHEMA, TG_TABLE_NAME) USING NEW.id;
    END IF;
    
    RETURN NEW;
EXCEPTION 
    WHEN undefined_column THEN
        -- If updated_at column doesn't exist, just return NEW unchanged
        RETURN NEW;
    WHEN OTHERS THEN
        -- For any other error, just return NEW unchanged
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Actually, let's use an even simpler approach - just check if column exists first
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
DECLARE
    column_exists boolean;
BEGIN
    -- Check if updated_at column exists in this table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = TG_TABLE_SCHEMA 
        AND table_name = TG_TABLE_NAME 
        AND column_name = 'updated_at'
    ) INTO column_exists;
    
    -- Only set updated_at if column exists and this is an UPDATE
    IF TG_OP = 'UPDATE' AND column_exists THEN
        NEW.updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add user_id column if it doesn't exist (as nullable first)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.notifications ADD COLUMN user_id UUID;
    END IF;
END $$;

-- Fix NULL user_id values WITHOUT disabling triggers
DO $$
DECLARE
    default_user_id UUID;
    notification_record RECORD;
BEGIN
    -- Get the first available user ID
    SELECT id INTO default_user_id FROM public.profiles LIMIT 1;
    
    -- If no profiles exist, create a default profile first
    IF default_user_id IS NULL THEN
        -- Insert a default profile for your account
        INSERT INTO public.profiles (id, email, full_name, avatar_url)
        VALUES (
            '950c554c-a3e2-47bd-88f3-9cbc3da7b80c',
            'admin@example.com',
            'Admin User',
            'https://via.placeholder.com/150'
        ) ON CONFLICT (id) DO NOTHING;
        
        default_user_id := '950c554c-a3e2-47bd-88f3-9cbc3da7b80c';
    END IF;
    
    -- Update NULL user_id values one by one to avoid trigger issues
    FOR notification_record IN 
        SELECT id FROM public.notifications WHERE user_id IS NULL 
    LOOP
        UPDATE public.notifications 
        SET user_id = default_user_id 
        WHERE id = notification_record.id;
    END LOOP;
END $$;

-- Now add the foreign key constraint
DO $$
BEGIN
    -- First check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_user_id_fkey' 
        AND table_name = 'notifications'
    ) THEN
        ALTER TABLE public.notifications 
        ADD CONSTRAINT notifications_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Now make user_id NOT NULL
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

-- Recreate the trigger only for tables that have updated_at column
DROP TRIGGER IF EXISTS handle_notifications_updated_at ON public.notifications;

-- Create the trigger now that updated_at column exists
CREATE TRIGGER handle_notifications_updated_at 
BEFORE UPDATE ON public.notifications 
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_post_id ON public.notifications(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_from_user_id ON public.notifications(from_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Enable RLS and create policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete their notifications" ON public.notifications;
CREATE POLICY "Users can delete their notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.notifications TO authenticated;
GRANT SELECT ON public.notifications TO anon;

-- ✅ SAFE TRIGGER FIX COMPLETE!
-- This script:
-- ✅ Adds missing updated_at column safely
-- ✅ Creates safer handle_updated_at function that checks column existence
-- ✅ Updates NULL user_id values without disabling system triggers
-- ✅ Adds foreign key constraints properly
-- ✅ Adds all missing columns and indexes
-- ✅ Creates proper RLS policies