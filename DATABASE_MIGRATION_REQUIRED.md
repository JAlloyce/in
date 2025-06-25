# 🚨 CRITICAL DATABASE MIGRATION REQUIRED

## Issue Summary
The LinkedIn Clone database has foreign key mismatches that prevent the application from working correctly. Most importantly, **posts, comments, and likes tables are referencing `auth.users` instead of `profiles`**, which breaks the application's data model.

## Current Issues Detected
1. **posts.author_id** → references `auth.users` (should be `profiles`)
2. **comments.author_id** → references `auth.users` (should be `profiles`)
3. **likes.user_id** → references `auth.users` (should be `profiles`)
4. **Missing columns** in `profiles` table: `email`, `full_name`
5. **Mixed references** in notifications table

## ⚠️ MANUAL MIGRATION REQUIRED

**Run this SQL in Supabase SQL Editor with elevated permissions:**

```sql
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
-- PHASE 5: ADD PERFORMANCE INDEXES
-- =====================================

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
```

## After Migration
1. Test that posts, comments, and likes work correctly
2. Verify all foreign key constraints are working
3. Mark DB_001 task as complete: `node taskmaster-ai.js complete DB_001`

## Status
- **Current Status**: ❌ Migration Required (Permission Issues)
- **Next Action**: Manual execution in Supabase Dashboard with admin privileges
- **Priority**: CRITICAL - App will not function correctly without this fix 