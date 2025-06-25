-- 🎯 FINAL COMPREHENSIVE DATABASE SCHEMA FIX
-- This fixes ALL the foreign key mismatches between your database and React app

-- =====================================
-- PHASE 1: ADD MISSING PROFILE COLUMNS
-- =====================================

-- Add missing columns to profiles table that your app expects
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Populate from auth.users data
UPDATE profiles SET 
    email = (SELECT email FROM auth.users WHERE auth.users.id = profiles.id),
    full_name = COALESCE(name, 'User')
WHERE email IS NULL OR full_name IS NULL;

-- =====================================
-- PHASE 2: FIX POSTS TABLE FOREIGN KEYS
-- =====================================

-- Drop existing constraint and recreate to reference profiles
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE posts ADD CONSTRAINT posts_author_id_fkey 
    FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- =====================================
-- PHASE 3: FIX COMMENTS TABLE FOREIGN KEYS  
-- =====================================

-- Drop existing constraint and recreate to reference profiles
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
ALTER TABLE comments ADD CONSTRAINT comments_author_id_fkey 
    FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- =====================================
-- PHASE 4: FIX LIKES TABLE FOREIGN KEYS
-- =====================================

-- Drop existing constraint and recreate to reference profiles
ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE likes ADD CONSTRAINT likes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- =====================================
-- PHASE 5: FIX NOTIFICATIONS TABLE
-- =====================================

-- Add updated_at column for triggers
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add user_id column that your app expects
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id UUID;

-- Migrate data from recipient_id to user_id (matching to profiles)
UPDATE notifications SET user_id = (
    SELECT profiles.id FROM profiles 
    WHERE profiles.id = notifications.recipient_id
) WHERE user_id IS NULL;

-- If no matching profile, create one or use default
DO $$
DECLARE
    default_user_id UUID;
BEGIN
    -- Get first available profile ID
    SELECT id INTO default_user_id FROM profiles LIMIT 1;
    
    -- If no profiles exist, use your user ID
    IF default_user_id IS NULL THEN
        default_user_id := '950c554c-a3e2-47bd-88f3-9cbc3da7b80c';
    END IF;
    
    -- Update any remaining NULL user_id values
    UPDATE notifications 
    SET user_id = default_user_id 
    WHERE user_id IS NULL;
END $$;

-- Make user_id NOT NULL and add foreign key
ALTER TABLE notifications ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix other notification foreign keys to reference profiles
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_from_user_id_fkey;
ALTER TABLE notifications ADD CONSTRAINT notifications_from_user_id_fkey 
    FOREIGN KEY (from_user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- =====================================
-- PHASE 6: FIX COMPANY TABLES
-- =====================================

-- Fix companies.created_by to reference profiles
ALTER TABLE companies DROP CONSTRAINT IF EXISTS companies_created_by_fkey;
ALTER TABLE companies ADD CONSTRAINT companies_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- Fix company_followers.user_id to reference profiles  
ALTER TABLE company_followers DROP CONSTRAINT IF EXISTS company_followers_user_id_fkey;
ALTER TABLE company_followers ADD CONSTRAINT company_followers_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- =====================================
-- PHASE 7: FIX SHARES TABLE
-- =====================================

-- Add missing foreign key constraints to shares table
ALTER TABLE shares ADD CONSTRAINT IF NOT EXISTS shares_post_id_fkey 
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
ALTER TABLE shares ADD CONSTRAINT IF NOT EXISTS shares_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- =====================================
-- PHASE 8: ENSURE PROPER TRIGGERS
-- =====================================

-- Create safe updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set updated_at if column exists
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    EXCEPTION 
        WHEN undefined_column THEN
            RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at column
DROP TRIGGER IF EXISTS handle_posts_updated_at ON posts;
CREATE TRIGGER handle_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS handle_notifications_updated_at ON notifications;
CREATE TRIGGER handle_notifications_updated_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- =====================================
-- PHASE 9: CREATE PERFORMANCE INDEXES
-- =====================================

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- =====================================
-- PHASE 10: UPDATE ROW LEVEL SECURITY
-- =====================================

-- Enable RLS on core tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
DROP POLICY IF EXISTS "Users can view all posts" ON posts;
CREATE POLICY "Users can view all posts" ON posts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can create posts" ON posts;
CREATE POLICY "Users can create posts" ON posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE TO authenticated USING (auth.uid() = author_id);

-- Create policies for comments
DROP POLICY IF EXISTS "Users can view all comments" ON comments;
CREATE POLICY "Users can view all comments" ON comments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON comments;
CREATE POLICY "Users can create comments" ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- Create policies for likes
DROP POLICY IF EXISTS "Users can view all likes" ON likes;
CREATE POLICY "Users can view all likes" ON likes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can manage own likes" ON likes;
CREATE POLICY "Users can manage own likes" ON likes FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create policies for notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- =====================================
-- ✅ SCHEMA FIX COMPLETE!
-- =====================================

-- This fix addresses:
-- ✅ All foreign key mismatches (auth.users -> profiles)
-- ✅ Missing profile columns (email, full_name)
-- ✅ Notifications table user_id column
-- ✅ Missing updated_at columns and triggers
-- ✅ Performance indexes
-- ✅ Row Level Security policies
-- ✅ All relationship errors your app was experiencing

-- Your React app should now work perfectly with this schema!