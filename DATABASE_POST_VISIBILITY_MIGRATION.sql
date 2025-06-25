-- Migration: Add visibility column to posts table
-- Run this in Supabase SQL Editor if you want to add post visibility features

-- Add visibility column to posts table
ALTER TABLE posts 
ADD COLUMN visibility text DEFAULT 'public' 
CHECK (visibility IN ('public', 'connections', 'private'));

-- Add comment for documentation
COMMENT ON COLUMN posts.visibility IS 'Post visibility: public (everyone), connections (connections only), private (only me)';

-- Add index for better performance when filtering by visibility
CREATE INDEX idx_posts_visibility ON posts(visibility);

-- Update existing posts to have public visibility
UPDATE posts SET visibility = 'public' WHERE visibility IS NULL;

-- Update RLS policies to respect visibility settings
DROP POLICY IF EXISTS "Users can view all posts" ON posts;

CREATE POLICY "Users can view public posts" ON posts
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can view their own posts" ON posts
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can view connection posts if connected" ON posts
  FOR SELECT USING (
    visibility = 'connections' 
    AND (
      auth.uid() = author_id 
      OR EXISTS (
        SELECT 1 FROM connections 
        WHERE (
          (requester_id = auth.uid() AND receiver_id = author_id)
          OR (requester_id = author_id AND receiver_id = auth.uid())
        )
        AND status = 'accepted'
      )
    )
  ); 