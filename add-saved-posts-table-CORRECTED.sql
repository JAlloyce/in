-- Add Missing saved_posts Table - CORRECTED VERSION
-- This script only operates on tables that actually exist in the database

-- Create saved_posts table
CREATE TABLE IF NOT EXISTS public.saved_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    UNIQUE(user_id, post_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON public.saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON public.saved_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_created_at ON public.saved_posts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for saved_posts
DROP POLICY IF EXISTS "Users can view their own saved posts" ON public.saved_posts;
DROP POLICY IF EXISTS "Users can save posts" ON public.saved_posts;
DROP POLICY IF EXISTS "Users can unsave their posts" ON public.saved_posts;

CREATE POLICY "Users can view their own saved posts" ON public.saved_posts
    FOR SELECT USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can save posts" ON public.saved_posts
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

CREATE POLICY "Users can unsave their posts" ON public.saved_posts
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- Add updated_at trigger
CREATE TRIGGER handle_saved_posts_updated_at
    BEFORE UPDATE ON public.saved_posts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT ALL ON public.saved_posts TO authenticated;

-- Add missing count columns to posts table if they don't exist (POSTS TABLE EXISTS)
DO $$ 
BEGIN
    -- Add likes_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'likes_count'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN likes_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add comments_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'comments_count'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN comments_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add shares_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'shares_count'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN shares_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add missing count columns to profiles table if they don't exist (PROFILES TABLE EXISTS)
DO $$ 
BEGIN
    -- Add followers_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'followers_count'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN followers_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add missing count columns to companies table if it exists (COMPANIES TABLE EXISTS)
DO $$ 
BEGIN
    -- Only add posts_count if companies table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'companies' 
        AND table_schema = 'public'
    ) THEN
        -- Add follower_count column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'companies' 
            AND column_name = 'follower_count'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.companies ADD COLUMN follower_count INTEGER DEFAULT 0;
        END IF;
    END IF;
END $$;

-- SKIP communities table operations since it doesn't exist
-- Note: Communities.jsx will need to be updated to not use communities.posts_count

-- Create functions to update counts automatically
CREATE OR REPLACE FUNCTION public.update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update likes count
    IF TG_TABLE_NAME = 'likes' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.posts 
            SET likes_count = likes_count + 1 
            WHERE id = NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.posts 
            SET likes_count = GREATEST(0, likes_count - 1) 
            WHERE id = OLD.post_id;
        END IF;
    END IF;

    -- Update comments count
    IF TG_TABLE_NAME = 'comments' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.posts 
            SET comments_count = comments_count + 1 
            WHERE id = NEW.post_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.posts 
            SET comments_count = GREATEST(0, comments_count - 1) 
            WHERE id = OLD.post_id;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically update counts (only for tables that exist)
DO $$ 
BEGIN
    -- Drop existing triggers if they exist
    DROP TRIGGER IF EXISTS update_likes_count ON public.likes;
    DROP TRIGGER IF EXISTS update_comments_count ON public.comments;
    
    -- Create new triggers only if the referenced tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'likes' AND table_schema = 'public') THEN
        CREATE TRIGGER update_likes_count
            AFTER INSERT OR DELETE ON public.likes
            FOR EACH ROW EXECUTE FUNCTION public.update_post_counts();
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments' AND table_schema = 'public') THEN
        CREATE TRIGGER update_comments_count
            AFTER INSERT OR DELETE ON public.comments
            FOR EACH ROW EXECUTE FUNCTION public.update_post_counts();
    END IF;
END $$;

COMMIT;