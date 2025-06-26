-- Add company follows functionality
-- This migration adds the ability for users to follow companies/pages

-- Create company_follows table
CREATE TABLE company_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- Add follower_count to companies table
ALTER TABLE companies ADD COLUMN follower_count INTEGER DEFAULT 0;

-- Create index for performance
CREATE INDEX idx_company_follows_user ON company_follows(user_id);
CREATE INDEX idx_company_follows_company ON company_follows(company_id);

-- Function to update company follower count
CREATE OR REPLACE FUNCTION update_company_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE companies 
    SET follower_count = follower_count + 1 
    WHERE id = NEW.company_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE companies 
    SET follower_count = GREATEST(follower_count - 1, 0) 
    WHERE id = OLD.company_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update follower counts
CREATE TRIGGER update_company_follower_count_trigger
  AFTER INSERT OR DELETE ON company_follows
  FOR EACH ROW EXECUTE FUNCTION update_company_follower_count(); 