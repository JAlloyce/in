-- URGENT: Fix missing foreign key relationship between posts and profiles
-- This is causing the "Could not find a relationship" error
-- Run this in your Supabase SQL Editor RIGHT NOW

-- Add the missing foreign key constraint if it doesn't exist
DO $$ 
BEGIN
    -- Check if the constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'posts_author_id_fkey' 
        AND table_name = 'posts' 
        AND table_schema = 'public'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE public.posts 
        ADD CONSTRAINT posts_author_id_fkey 
        FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added posts_author_id_fkey foreign key constraint';
    ELSE
        RAISE NOTICE 'Foreign key constraint posts_author_id_fkey already exists';
    END IF;
END $$;

-- Verify the constraint was added
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'posts'
    AND tc.table_schema = 'public';

-- Show table counts to confirm data exists
SELECT 'Posts' as table_name, count(*) as count FROM public.posts
UNION ALL
SELECT 'Profiles', count(*) FROM public.profiles
ORDER BY table_name;