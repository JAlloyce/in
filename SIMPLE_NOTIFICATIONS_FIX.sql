-- 🚨 SIMPLE FIX: Notifications table NULL values
-- This safely handles existing NULL values

-- Step 1: Add user_id column as nullable first (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        -- Add as nullable column first
        ALTER TABLE public.notifications ADD COLUMN user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 2: Get a default user ID and update NULL values
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
    
    -- Update all existing NULL user_id values
    UPDATE public.notifications 
    SET user_id = default_user_id 
    WHERE user_id IS NULL;
END $$;

-- Step 3: Now make the column NOT NULL (after cleaning up NULLs)
ALTER TABLE public.notifications ALTER COLUMN user_id SET NOT NULL;

-- Step 4: Add other missing columns safely
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

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_post_id ON public.notifications(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_from_user_id ON public.notifications(from_user_id);

-- Step 6: Enable RLS and create policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their notifications" ON public.notifications;
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their notifications" ON public.notifications;
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Step 7: Grant permissions
GRANT ALL ON public.notifications TO authenticated;

-- ✅ NOTIFICATIONS FIXED SAFELY!
-- This script handles NULL values properly by:
-- ✅ Adding columns as nullable first
-- ✅ Cleaning up existing NULL data
-- ✅ Making columns NOT NULL after cleanup
-- ✅ Adding proper indexes and policies