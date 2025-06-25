-- ================================
-- STORAGE BUCKETS SETUP
-- ================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('banners', 'banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('post-media', 'post-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']),
  ('resumes', 'resumes', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('company-logos', 'company-logos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('community-covers', 'community-covers', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('workspace-files', 'workspace-files', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']),
  ('message-attachments', 'message-attachments', false, 26214400, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'video/mp4', 'audio/mpeg', 'audio/wav'])
ON CONFLICT (id) DO NOTHING;

-- ================================
-- STORAGE POLICIES
-- ================================

-- Avatars: Public read, users can upload/update their own
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Banner images: Similar to avatars
CREATE POLICY "Banner images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'banners');

CREATE POLICY "Users can upload their own banner" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'banners' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own banner" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'banners' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own banner" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'banners' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Post media: Public read, users can upload for their posts
CREATE POLICY "Post media is publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-media');

CREATE POLICY "Users can upload post media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-media' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their post media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'post-media' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Resumes: Private, only accessible by uploader and relevant job posters
CREATE POLICY "Users can access their own resumes" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resumes' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Job posters can access applicant resumes" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resumes' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM job_applications ja
      JOIN jobs j ON j.id = ja.job_id
      WHERE ja.resume_url = 'resumes/' || name
      AND j.posted_by = auth.uid()
    )
  );

CREATE POLICY "Users can upload their own resumes" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resumes' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own resumes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'resumes' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Company logos: Public read, company admins can manage
CREATE POLICY "Company logos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'company-logos');

CREATE POLICY "Authenticated users can upload company logos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'company-logos' AND
    auth.role() = 'authenticated'
  );

-- Community covers: Public read for public communities
CREATE POLICY "Community covers are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'community-covers');

CREATE POLICY "Community admins can upload covers" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'community-covers' AND
    auth.role() = 'authenticated'
  );

-- Workspace files: Private to users
CREATE POLICY "Users can access their workspace files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'workspace-files' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload workspace files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'workspace-files' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their workspace files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'workspace-files' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Message attachments: Only accessible by conversation participants
CREATE POLICY "Conversation participants can access message attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'message-attachments' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.media_url = 'message-attachments/' || name
      AND auth.uid() = ANY(c.participants)
    )
  );

CREATE POLICY "Users can upload message attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'message-attachments' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ================================
-- HELPER FUNCTIONS FOR FILE MANAGEMENT
-- ================================

-- Function to generate secure file path
CREATE OR REPLACE FUNCTION generate_file_path(
  user_id UUID,
  bucket_name TEXT,
  file_extension TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN user_id::text || '/' || extract(epoch from now())::bigint || '_' || gen_random_uuid()::text || '.' || file_extension;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up orphaned files
CREATE OR REPLACE FUNCTION cleanup_orphaned_files()
RETURNS void AS $$
BEGIN
  -- Clean up post media not referenced in posts
  DELETE FROM storage.objects 
  WHERE bucket_id = 'post-media' 
  AND created_at < NOW() - INTERVAL '24 hours'
  AND NOT EXISTS (
    SELECT 1 FROM posts p 
    WHERE 'post-media/' || name = ANY(p.media_urls)
  );
  
  -- Clean up message attachments older than 30 days with no references
  DELETE FROM storage.objects 
  WHERE bucket_id = 'message-attachments' 
  AND created_at < NOW() - INTERVAL '30 days'
  AND NOT EXISTS (
    SELECT 1 FROM messages m 
    WHERE m.media_url = 'message-attachments/' || name
  );
  
  -- Clean up workspace files not referenced
  DELETE FROM storage.objects 
  WHERE bucket_id = 'workspace-files' 
  AND created_at < NOW() - INTERVAL '7 days'
  AND NOT EXISTS (
    SELECT 1 FROM workspace_materials wm 
    WHERE wm.url = 'workspace-files/' || name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get file size and type validation
CREATE OR REPLACE FUNCTION validate_file_upload(
  bucket_name TEXT,
  file_size BIGINT,
  mime_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  bucket_config storage.buckets%ROWTYPE;
BEGIN
  SELECT * INTO bucket_config FROM storage.buckets WHERE id = bucket_name;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check file size
  IF file_size > bucket_config.file_size_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Check mime type if restrictions exist
  IF bucket_config.allowed_mime_types IS NOT NULL AND 
     NOT (mime_type = ANY(bucket_config.allowed_mime_types)) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;