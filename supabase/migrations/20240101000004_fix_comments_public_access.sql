-- Migration: Fix Comments Public Access
-- Allow unauthenticated users to read comments

-- Drop existing restrictive comment read policy
DROP POLICY IF EXISTS "Users can view comments on visible posts" ON comments;

-- Create new policy that allows public reading of comments
CREATE POLICY "Comments are publicly readable" ON comments
  FOR SELECT USING (true);

-- Keep insert policy for authenticated users only
-- This ensures only logged in users can create comments
-- but anyone can read them

-- Also update the post comments fetch to not require auth for reading
-- This will be handled in the application layer 