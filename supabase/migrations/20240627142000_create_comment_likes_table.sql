-- Migration: Create comment_likes table
-- Created: 2024-06-27
-- Description: Add support for liking comments

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all comment likes" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "Users can like comments" ON public.comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike their comment likes" ON public.comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);

-- Grant permissions
GRANT ALL ON public.comment_likes TO authenticated;
GRANT SELECT ON public.comment_likes TO anon;

-- Add comment for documentation
COMMENT ON TABLE public.comment_likes IS 'Stores likes for comments, similar to post likes';
COMMENT ON COLUMN public.comment_likes.comment_id IS 'Reference to the comment being liked';
COMMENT ON COLUMN public.comment_likes.user_id IS 'Reference to the user who liked the comment'; 