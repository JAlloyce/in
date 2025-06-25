-- 🚨 EMERGENCY FIX for LinkedIn Clone Database Issues
-- This fixes the specific errors: post creation, like functionality, comments

-- 1. CRITICAL: Add foreign key constraint for posts.author_id -> profiles.id
DO $$ 
BEGIN
    -- First check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'posts_author_id_fkey'
        AND table_name = 'posts'
        AND table_schema = 'public'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE public.posts ADD CONSTRAINT posts_author_id_fkey 
        FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Create likes table if it doesn't exist (for like functionality)
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    UNIQUE(post_id, user_id)
);

-- Enable RLS and policies for likes
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all likes" ON public.likes;
CREATE POLICY "Users can view all likes" ON public.likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can like posts" ON public.likes;
CREATE POLICY "Users can like posts" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike their likes" ON public.likes;
CREATE POLICY "Users can unlike their likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);

GRANT ALL ON public.likes TO authenticated;

-- 3. Create comments table if it doesn't exist (for comment functionality)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    content TEXT NOT NULL,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Enable RLS and policies for comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all comments" ON public.comments;
CREATE POLICY "Users can view all comments" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their comments" ON public.comments;
CREATE POLICY "Users can update their comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their comments" ON public.comments;
CREATE POLICY "Users can delete their comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

GRANT ALL ON public.comments TO authenticated;

-- 4. Fix notifications table - add missing post_id column
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
END $$;

-- 5. Ensure posts table has all necessary columns
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
    
    -- Add post_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'post_type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN post_type TEXT DEFAULT 'user';
    END IF;
    
    -- Add visibility column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'visibility'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN visibility TEXT DEFAULT 'public';
    END IF;
    
    -- Add media_urls column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'media_urls'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN media_urls TEXT[];
    END IF;
END $$;

-- 6. Create triggers to auto-update counts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'likes_count_trigger') THEN
        CREATE TRIGGER likes_count_trigger
        AFTER INSERT OR DELETE ON public.likes
        FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'comments_count_trigger') THEN
        CREATE TRIGGER comments_count_trigger
        AFTER INSERT OR DELETE ON public.comments
        FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();
    END IF;
END $$;

-- ✅ EMERGENCY FIX COMPLETE!
-- This should immediately fix:
-- ✅ Post creation (foreign key constraint added)
-- ✅ Like functionality (likes table + policies created)
-- ✅ Comment functionality (comments table + policies created) 
-- ✅ Auto-updating like/comment counts (triggers added)
-- ✅ All missing columns added to posts table

-- 🚀 TEST THESE FEATURES NOW:
-- 1. Create a new post
-- 2. Like/unlike posts
-- 3. Add comments to posts
-- 4. All should work without foreign key errors!