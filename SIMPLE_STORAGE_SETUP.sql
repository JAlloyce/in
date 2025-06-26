-- SIMPLE WORKSPACE STORAGE SETUP
-- This creates just the storage bucket (policies will be handled via Supabase dashboard)

-- Create the workspace-files bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('workspace-files', 'workspace-files', true)
ON CONFLICT (id) DO NOTHING;

-- That's it! The storage policies need to be created via the Supabase Dashboard
-- Go to Storage > workspace-files > Configuration > Policies to set them up manually 