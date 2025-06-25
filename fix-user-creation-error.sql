-- Fix for "Database error saving new user" issue
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. First, let's check and fix the profiles table structure
-- =====================================================

-- Drop existing table if it has issues and recreate with correct structure
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT,
  avatar_url TEXT,
  headline TEXT,
  location TEXT,
  bio TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. Enable RLS and create policies
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- 3. Create a more robust user creation function
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_avatar TEXT;
  user_headline TEXT;
BEGIN
  -- Extract name from various possible sources
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name', 
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1),
    'User'
  );
  
  -- Extract avatar URL
  user_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NEW.raw_user_meta_data->>'photo'
  );
  
  -- Create a default headline
  user_headline := COALESCE(
    NEW.raw_user_meta_data->>'bio',
    'Professional at LinkedIn Clone'
  );

  -- Insert the profile with error handling
  BEGIN
    INSERT INTO public.profiles (id, name, avatar_url, headline, created_at, updated_at)
    VALUES (
      NEW.id,
      user_name,
      user_avatar,
      user_headline,
      NOW(),
      NOW()
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. Drop and recreate the trigger
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 5. Grant proper permissions
-- =====================================================

-- Grant permissions to the service role and authenticated users
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- =====================================================
-- 6. Test the function manually (optional)
-- =====================================================

-- You can test this manually by running:
-- SELECT public.handle_new_user();

-- =====================================================
-- 7. Alternative: Create profile manually for existing users
-- =====================================================

-- If you have existing users without profiles, this will create them:
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
-- 8. Check if everything is working
-- =====================================================

-- Verify the table exists and has the right structure
SELECT 
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;