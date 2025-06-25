-- Safe Database Fix Script - Checks for existing constraints and tables
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. Check and create missing notifications table ONLY if it doesn't exist
-- =====================================================

DO $$ 
BEGIN
    -- Only create notifications table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
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

        -- Create policies
        CREATE POLICY "Users can view their own notifications" ON public.notifications
          FOR SELECT USING (auth.uid() = recipient_id);

        CREATE POLICY "Users can create notifications" ON public.notifications
          FOR INSERT WITH CHECK (auth.role() = 'authenticated');

        CREATE POLICY "Users can update their own notifications" ON public.notifications
          FOR UPDATE USING (auth.uid() = recipient_id);

        -- Grant permissions
        GRANT ALL ON public.notifications TO authenticated;
        GRANT SELECT ON public.notifications TO anon;

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON public.notifications(sender_id);

        RAISE NOTICE 'Created notifications table with policies and indexes';
    ELSE
        RAISE NOTICE 'Notifications table already exists, skipping creation';
    END IF;
END $$;

-- =====================================================
-- 2. Check and add foreign key constraints ONLY if they don't exist
-- =====================================================

DO $$ 
BEGIN
    -- Check for posts_author_id_fkey constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'posts_author_id_fkey' 
        AND table_name = 'posts' 
        AND table_schema = 'public'
    ) THEN
        -- Check if profiles table exists first
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
            ALTER TABLE public.posts 
            ADD CONSTRAINT posts_author_id_fkey 
            FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added posts_author_id_fkey constraint';
        ELSE
            RAISE NOTICE 'Profiles table does not exist, cannot add posts_author_id_fkey constraint';
        END IF;
    ELSE
        RAISE NOTICE 'posts_author_id_fkey constraint already exists';
    END IF;

    -- Check for likes_user_id_fkey constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'likes_user_id_fkey' 
        AND table_name = 'likes' 
        AND table_schema = 'public'
    ) THEN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
            ALTER TABLE public.likes 
            ADD CONSTRAINT likes_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added likes_user_id_fkey constraint';
        END IF;
    ELSE
        RAISE NOTICE 'likes_user_id_fkey constraint already exists';
    END IF;

    -- Check for comments_author_id_fkey constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comments_author_id_fkey' 
        AND table_name = 'comments' 
        AND table_schema = 'public'
    ) THEN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
            ALTER TABLE public.comments 
            ADD CONSTRAINT comments_author_id_fkey 
            FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added comments_author_id_fkey constraint';
        END IF;
    ELSE
        RAISE NOTICE 'comments_author_id_fkey constraint already exists';
    END IF;

    -- Check for notifications foreign key constraints
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        -- notifications_recipient_id_fkey
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'notifications_recipient_id_fkey' 
            AND table_name = 'notifications' 
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.notifications 
            ADD CONSTRAINT notifications_recipient_id_fkey 
            FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added notifications_recipient_id_fkey constraint';
        END IF;

        -- notifications_sender_id_fkey
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'notifications_sender_id_fkey' 
            AND table_name = 'notifications' 
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.notifications 
            ADD CONSTRAINT notifications_sender_id_fkey 
            FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
            RAISE NOTICE 'Added notifications_sender_id_fkey constraint';
        END IF;
    END IF;
END $$;

-- =====================================================
-- 3. Insert sample posts for testing (only if user exists and no posts exist)
-- =====================================================

DO $$
DECLARE
    user_uuid UUID;
    post_count INTEGER;
BEGIN
    -- Get the first user from profiles
    SELECT id INTO user_uuid FROM public.profiles LIMIT 1;
    
    IF user_uuid IS NOT NULL THEN
        -- Check if user already has posts
        SELECT COUNT(*) INTO post_count FROM public.posts WHERE author_id = user_uuid;
        
        IF post_count = 0 THEN
            -- Insert sample posts
            INSERT INTO public.posts (content, author_id) VALUES
            ('Welcome to LinkedIn Clone! Excited to be here and connect with amazing professionals. 🚀', user_uuid),
            ('Just completed a great project using React and Supabase. The OAuth integration was smooth!', user_uuid),
            ('Looking forward to building more connections and sharing knowledge with the community.', user_uuid);
            
            RAISE NOTICE 'Added sample posts for user %', user_uuid;
        ELSE
            RAISE NOTICE 'User % already has % posts, skipping sample post creation', user_uuid, post_count;
        END IF;

        -- Insert sample notifications if none exist
        SELECT COUNT(*) INTO post_count FROM public.notifications WHERE recipient_id = user_uuid;
        
        IF post_count = 0 AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
            INSERT INTO public.notifications (recipient_id, sender_id, type, title, message) VALUES
            (user_uuid, user_uuid, 'welcome', 'Welcome to LinkedIn Clone!', 'Thank you for joining our professional network.'),
            (user_uuid, user_uuid, 'system', 'Profile Setup Complete', 'Your profile has been successfully created.');
            
            RAISE NOTICE 'Added sample notifications for user %', user_uuid;
        END IF;
    ELSE
        RAISE NOTICE 'No users found in profiles table';
    END IF;
END $$;

-- =====================================================
-- 4. Verify current database state
-- =====================================================

-- Show all foreign key constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
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
    AND tc.table_name IN ('posts', 'likes', 'comments', 'notifications')
ORDER BY tc.table_name, tc.constraint_name;

-- Show table row counts
SELECT 
    'Profiles' as table_name, 
    count(*) as count 
FROM public.profiles
UNION ALL
SELECT 'Companies', count(*) FROM public.companies  
UNION ALL
SELECT 'Posts', count(*) FROM public.posts
UNION ALL
SELECT 'Notifications', COALESCE((SELECT count(*) FROM public.notifications), 0)
ORDER BY table_name;

-- Show table existence
SELECT 
    table_name,
    CASE WHEN table_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'companies', 'posts', 'likes', 'comments', 'notifications')
ORDER BY table_name;