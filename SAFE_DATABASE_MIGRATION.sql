-- Safe Database Migration for Comment Replies and Likes
-- This script can be run multiple times safely

-- 1. Add parent_id column to comments table for threaded replies
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;

-- 2. Create comment_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- 3. Enable RLS on comment_likes
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist (prevents conflicts)
DROP POLICY IF EXISTS "Users can view all comment likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Users can like comments" ON public.comment_likes;
DROP POLICY IF EXISTS "Users can unlike their comment likes" ON public.comment_likes;

-- 5. Create fresh RLS policies
CREATE POLICY "Users can view all comment likes" ON public.comment_likes 
  FOR SELECT USING (true);

CREATE POLICY "Users can like comments" ON public.comment_likes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their comment likes" ON public.comment_likes 
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Create indexes for performance (safe with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);

-- 7. Grant necessary permissions
GRANT ALL ON public.comment_likes TO authenticated;
GRANT SELECT ON public.comment_likes TO anon;

-- 8. Add documentation comments
COMMENT ON COLUMN public.comments.parent_id IS 'Reference to parent comment for threaded replies. NULL for top-level comments';
COMMENT ON TABLE public.comment_likes IS 'Stores likes for comments, similar to post likes';
COMMENT ON COLUMN public.comment_likes.comment_id IS 'Reference to the comment being liked';
COMMENT ON COLUMN public.comment_likes.user_id IS 'Reference to the user who liked the comment';

-- Migration completed successfully! 

-- SAFE DATABASE MIGRATION: Clean up Companies and Optimize Schema
-- This migration is safe to run and will fix data integrity issues

-- Step 1: Clean up companies with placeholder/test data
DELETE FROM company_followers WHERE company_id IN (
  SELECT id FROM companies WHERE 
    logo_url = 'https://via.placeholder.com/100' OR
    name ILIKE '%test%' OR 
    name ILIKE '%sample%' OR
    name ILIKE '%demo%' OR
    name ILIKE '%placeholder%' OR
    description ILIKE '%placeholder%' OR
    description ILIKE '%sample%' OR
    description ILIKE '%test%' OR
    description ILIKE '%demo%'
);

-- Step 2: Remove placeholder companies
DELETE FROM companies WHERE 
  logo_url = 'https://via.placeholder.com/100' OR
  name ILIKE '%test%' OR 
  name ILIKE '%sample%' OR
  name ILIKE '%demo%' OR
  name ILIKE '%placeholder%' OR
  description ILIKE '%placeholder%' OR
  description ILIKE '%sample%' OR
  description ILIKE '%test%' OR
  description ILIKE '%demo%' OR
  name = '' OR
  description = '' OR
  name IS NULL OR
  description IS NULL;

-- Step 3: Update companies table to remove default placeholder URL
ALTER TABLE companies ALTER COLUMN logo_url DROP DEFAULT;

-- Step 4: Update any existing companies that have placeholder URLs
UPDATE companies SET logo_url = NULL WHERE logo_url = 'https://via.placeholder.com/100';

-- Step 5: Add constraints to prevent invalid data
ALTER TABLE companies ADD CONSTRAINT IF NOT EXISTS companies_name_not_empty 
  CHECK (length(trim(name)) > 0);

ALTER TABLE companies ADD CONSTRAINT IF NOT EXISTS companies_description_not_empty 
  CHECK (length(trim(description)) > 0);

-- Step 6: Ensure follower counts are correct
UPDATE companies SET follower_count = COALESCE((
  SELECT COUNT(*) FROM company_followers WHERE company_id = companies.id
), 0);

-- Step 7: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_search 
  ON companies USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(industry, '')));

CREATE INDEX IF NOT EXISTS idx_company_followers_user_id ON company_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_company_followers_company_id ON company_followers(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_verified ON companies(verified);

-- Step 8: Create trigger function to automatically update follower count
CREATE OR REPLACE FUNCTION update_company_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE companies SET follower_count = follower_count + 1 WHERE id = NEW.company_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE companies SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.company_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_update_company_follower_count ON company_followers;
CREATE TRIGGER trigger_update_company_follower_count
  AFTER INSERT OR DELETE ON company_followers
  FOR EACH ROW EXECUTE FUNCTION update_company_follower_count();

-- Step 10: Add some sample companies if the table is empty
INSERT INTO companies (name, description, industry, location, website, verified, follower_count, created_by)
SELECT 
  'TechCorp Solutions',
  'Leading provider of innovative technology solutions for businesses worldwide. We specialize in cloud computing, AI, and digital transformation services.',
  'technology',
  'San Francisco, CA',
  'https://techcorp.example.com',
  true,
  0,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM companies LIMIT 1);

INSERT INTO companies (name, description, industry, location, website, verified, follower_count, created_by)
SELECT 
  'Green Energy Inc',
  'Sustainable energy solutions for a better future. We develop and install solar, wind, and renewable energy systems for residential and commercial clients.',
  'energy',
  'Austin, TX',
  'https://greenenergy.example.com',
  false,
  0,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'Green Energy Inc');

INSERT INTO companies (name, description, industry, location, website, verified, follower_count, created_by)
SELECT 
  'HealthFirst Medical',
  'Comprehensive healthcare services with a focus on patient-centered care. We provide medical services, preventive care, and health education programs.',
  'healthcare',
  'Boston, MA',
  'https://healthfirst.example.com',
  true,
  0,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'HealthFirst Medical');

-- Step 11: Final verification - show results
-- This query shows the current state of companies
SELECT 
  COUNT(*) as total_companies,
  COUNT(CASE WHEN verified = true THEN 1 END) as verified_companies,
  COUNT(CASE WHEN logo_url IS NOT NULL THEN 1 END) as companies_with_logo
FROM companies;

-- Show companies by industry
SELECT 
  industry,
  COUNT(*) as company_count,
  AVG(follower_count) as avg_followers
FROM companies 
GROUP BY industry 
ORDER BY company_count DESC;

COMMIT; 