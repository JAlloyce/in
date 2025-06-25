-- Fix for column name errors and schema consistency
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. Fix Companies Table Schema
-- =====================================================

-- Drop and recreate companies table with correct column names
DROP TABLE IF EXISTS public.company_followers CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;

CREATE TABLE public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  website TEXT,
  logo_url TEXT,
  location TEXT,
  company_size TEXT,
  founded_year INTEGER,
  follower_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. Create Company Followers Table
-- =====================================================

CREATE TABLE public.company_followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- =====================================================
-- 3. Enable RLS on Companies Tables
-- =====================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_followers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Users can update their own companies" ON public.companies;
DROP POLICY IF EXISTS "Company followers are viewable by everyone" ON public.company_followers;
DROP POLICY IF EXISTS "Users can follow companies" ON public.company_followers;
DROP POLICY IF EXISTS "Users can unfollow companies" ON public.company_followers;

-- Create policies for companies
CREATE POLICY "Companies are viewable by everyone" ON public.companies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create companies" ON public.companies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own companies" ON public.companies
  FOR UPDATE USING (auth.uid() = created_by);

-- Create policies for company followers
CREATE POLICY "Company followers are viewable by everyone" ON public.company_followers
  FOR SELECT USING (true);

CREATE POLICY "Users can follow companies" ON public.company_followers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow companies" ON public.company_followers
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 4. Create Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_companies_created_by ON public.companies(created_by);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON public.companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_name ON public.companies(name);
CREATE INDEX IF NOT EXISTS idx_company_followers_company_id ON public.company_followers(company_id);
CREATE INDEX IF NOT EXISTS idx_company_followers_user_id ON public.company_followers(user_id);

-- =====================================================
-- 5. Create Function to Update Follower Count
-- =====================================================

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
    SET follower_count = follower_count - 1 
    WHERE id = OLD.company_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. Create Triggers
-- =====================================================

DROP TRIGGER IF EXISTS company_follower_count_trigger ON public.company_followers;

CREATE TRIGGER company_follower_count_trigger
  AFTER INSERT OR DELETE ON public.company_followers
  FOR EACH ROW
  EXECUTE FUNCTION update_company_follower_count();

-- =====================================================
-- 7. Insert Sample Companies Data
-- =====================================================

INSERT INTO public.companies (name, description, industry, website, logo_url, location, company_size, founded_year) VALUES
('TechCorp', 'Leading technology solutions provider', 'Technology', 'https://techcorp.com', 'https://via.placeholder.com/100', 'San Francisco, CA', '1000-5000', 2010),
('InnovateLabs', 'Innovation and research company', 'Research & Development', 'https://innovatelabs.com', 'https://via.placeholder.com/100', 'New York, NY', '500-1000', 2015),
('GreenEnergy Inc', 'Sustainable energy solutions', 'Energy', 'https://greenenergy.com', 'https://via.placeholder.com/100', 'Austin, TX', '100-500', 2018),
('DataFlow Systems', 'Big data analytics platform', 'Data Analytics', 'https://dataflow.com', 'https://via.placeholder.com/100', 'Seattle, WA', '50-100', 2020),
('CloudFirst', 'Cloud infrastructure services', 'Cloud Computing', 'https://cloudfirst.com', 'https://via.placeholder.com/100', 'Boston, MA', '200-500', 2017);

-- =====================================================
-- 8. Grant Permissions
-- =====================================================

GRANT ALL ON public.companies TO authenticated;
GRANT ALL ON public.company_followers TO authenticated;
GRANT SELECT ON public.companies TO anon;
GRANT SELECT ON public.company_followers TO anon;

-- =====================================================
-- 9. Update existing tables that might have wrong column names
-- =====================================================

-- Fix any other tables that might have owner_id instead of created_by
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Check if any tables have owner_id column and rename to created_by
    FOR r IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'owner_id' 
          AND table_schema = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I RENAME COLUMN owner_id TO created_by', r.table_name);
    END LOOP;
END $$;

-- =====================================================
-- 10. Verify the schema
-- =====================================================

-- Check companies table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'companies' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check company_followers table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'company_followers' 
  AND table_schema = 'public'
ORDER BY ordinal_position;