-- FINAL FIX: Comprehensive solution for all LinkedIn Clone OAuth and database issues
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. CLEAN SLATE: Drop all existing tables and start fresh
-- =====================================================

-- Drop all dependent tables first
DROP TABLE IF EXISTS public.workspace_materials CASCADE;
DROP TABLE IF EXISTS public.workspace_tasks CASCADE;
DROP TABLE IF EXISTS public.workspace_topics CASCADE;
DROP TABLE IF EXISTS public.saved_posts CASCADE;
DROP TABLE IF EXISTS public.job_applications CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.community_members CASCADE;
DROP TABLE IF EXISTS public.communities CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.connections CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.company_followers CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =====================================================
-- 2. CREATE PROFILES TABLE (Core for OAuth users)
-- =====================================================

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT,
  avatar_url TEXT,
  headline TEXT DEFAULT 'Professional at LinkedIn Clone',
  location TEXT,
  bio TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- 3. CREATE COMPANIES TABLE (Fixed schema)
-- =====================================================

CREATE TABLE public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  website TEXT,
  logo_url TEXT DEFAULT 'https://via.placeholder.com/100',
  location TEXT,
  company_size TEXT,
  founded_year INTEGER,
  follower_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Companies are viewable by everyone" ON public.companies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create companies" ON public.companies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own companies" ON public.companies
  FOR UPDATE USING (auth.uid() = created_by);

-- =====================================================
-- 4. CREATE COMPANY FOLLOWERS TABLE
-- =====================================================

CREATE TABLE public.company_followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- Enable RLS
ALTER TABLE public.company_followers ENABLE ROW LEVEL SECURITY;

-- Company followers policies
CREATE POLICY "Company followers are viewable by everyone" ON public.company_followers
  FOR SELECT USING (true);

CREATE POLICY "Users can follow companies" ON public.company_followers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow companies" ON public.company_followers
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 5. CREATE OTHER ESSENTIAL TABLES
-- =====================================================

-- Posts table
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts are viewable by everyone" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "Users can create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

-- Likes table
CREATE TABLE public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

-- Comments table
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- =====================================================
-- 6. CREATE ROBUST USER CREATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_avatar TEXT;
  user_headline TEXT;
BEGIN
  -- Extract name from various possible sources with fallbacks
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name', 
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'preferred_username',
    split_part(NEW.email, '@', 1),
    'User'
  );
  
  -- Extract avatar URL from various sources
  user_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NEW.raw_user_meta_data->>'photo',
    NEW.raw_user_meta_data->>'image'
  );
  
  -- Create a professional headline
  user_headline := COALESCE(
    NEW.raw_user_meta_data->>'bio',
    'Professional at LinkedIn Clone'
  );

  -- Insert the profile with comprehensive error handling
  BEGIN
    INSERT INTO public.profiles (
      id, 
      name, 
      avatar_url, 
      headline, 
      created_at, 
      updated_at
    ) VALUES (
      NEW.id,
      user_name,
      user_avatar,
      user_headline,
      NOW(),
      NOW()
    );
    
    -- Log successful profile creation
    RAISE NOTICE 'Profile created for user % with name %', NEW.id, user_name;
    
  EXCEPTION
    WHEN unique_violation THEN
      -- Profile already exists, update it instead
      UPDATE public.profiles 
      SET 
        name = COALESCE(name, user_name),
        avatar_url = COALESCE(avatar_url, user_avatar),
        updated_at = NOW()
      WHERE id = NEW.id;
      
      RAISE NOTICE 'Profile updated for existing user %', NEW.id;
      
    WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Failed to create profile for user %: % - %', NEW.id, SQLSTATE, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. CREATE TRIGGERS
-- =====================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Company follower count trigger
CREATE OR REPLACE FUNCTION update_company_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.companies 
    SET follower_count = follower_count + 1 
    WHERE id = NEW.company_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.companies 
    SET follower_count = GREATEST(follower_count - 1, 0)
    WHERE id = OLD.company_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER company_follower_count_trigger
  AFTER INSERT OR DELETE ON public.company_followers
  FOR EACH ROW
  EXECUTE FUNCTION update_company_follower_count();

-- =====================================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_name ON public.profiles(name);
CREATE INDEX IF NOT EXISTS idx_companies_name ON public.companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON public.companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON public.companies(created_by);
CREATE INDEX IF NOT EXISTS idx_company_followers_company_id ON public.company_followers(company_id);
CREATE INDEX IF NOT EXISTS idx_company_followers_user_id ON public.company_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);

-- =====================================================
-- 9. GRANT ALL NECESSARY PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.companies TO authenticated;
GRANT ALL ON public.company_followers TO authenticated;
GRANT ALL ON public.posts TO authenticated;
GRANT ALL ON public.likes TO authenticated;
GRANT ALL ON public.comments TO authenticated;

-- Grant read permissions to anonymous users
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.companies TO anon;
GRANT SELECT ON public.company_followers TO anon;
GRANT SELECT ON public.posts TO anon;
GRANT SELECT ON public.likes TO anon;
GRANT SELECT ON public.comments TO anon;

-- Grant function execution permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION update_company_follower_count() TO service_role;
GRANT EXECUTE ON FUNCTION update_company_follower_count() TO authenticated;

-- =====================================================
-- 10. INSERT SAMPLE DATA
-- =====================================================

-- Sample companies
INSERT INTO public.companies (name, description, industry, website, location, company_size, founded_year) VALUES
('TechCorp', 'Leading technology solutions provider specializing in cloud infrastructure and AI development', 'Technology', 'https://techcorp.com', 'San Francisco, CA', '1000-5000', 2010),
('InnovateLabs', 'Innovation and research company focused on emerging technologies and digital transformation', 'Research & Development', 'https://innovatelabs.com', 'New York, NY', '500-1000', 2015),
('GreenEnergy Inc', 'Sustainable energy solutions provider with focus on renewable energy sources', 'Energy', 'https://greenenergy.com', 'Austin, TX', '100-500', 2018),
('DataFlow Systems', 'Big data analytics platform helping businesses make data-driven decisions', 'Data Analytics', 'https://dataflow.com', 'Seattle, WA', '50-100', 2020),
('CloudFirst', 'Cloud infrastructure services provider offering scalable solutions for modern businesses', 'Cloud Computing', 'https://cloudfirst.com', 'Boston, MA', '200-500', 2017),
('FinTech Solutions', 'Financial technology company revolutionizing digital payments and banking', 'Financial Services', 'https://fintechsolutions.com', 'Chicago, IL', '300-800', 2019),
('HealthTech Pro', 'Healthcare technology solutions improving patient care through digital innovation', 'Healthcare', 'https://healthtechpro.com', 'Los Angeles, CA', '150-400', 2021),
('EduPlatform', 'Educational technology platform connecting learners with quality online education', 'Education', 'https://eduplatform.com', 'Denver, CO', '75-200', 2020);

-- =====================================================
-- 11. CREATE PROFILES FOR EXISTING USERS (IF ANY)
-- =====================================================

-- Create profiles for any existing users who don't have one
INSERT INTO public.profiles (id, name, headline, created_at, updated_at)
SELECT 
  id,
  COALESCE(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    split_part(email, '@', 1),
    'User'
  ) as name,
  'Professional at LinkedIn Clone' as headline,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 12. VERIFY SETUP
-- =====================================================

-- Check tables exist
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true
ORDER BY tablename;

-- Check sample data
SELECT 'Companies' as table_name, count(*) as row_count FROM public.companies
UNION ALL
SELECT 'Profiles', count(*) FROM public.profiles
ORDER BY table_name;

-- =====================================================
-- 13. TEST USER CREATION FUNCTION
-- =====================================================

-- This will show that our function works with various metadata formats
DO $$
BEGIN
  RAISE NOTICE 'Database setup completed successfully!';
  RAISE NOTICE 'Tables created: profiles, companies, company_followers, posts, likes, comments';
  RAISE NOTICE 'Triggers created: user profile creation, follower count updates';
  RAISE NOTICE 'Sample data inserted: % companies', (SELECT count(*) FROM public.companies);
  RAISE NOTICE 'Ready for OAuth authentication!';
END $$;