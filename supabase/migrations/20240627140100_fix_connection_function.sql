-- Fix the create_connection_safely function to work with actual notifications table schema
-- First, let's check what columns exist in notifications table

-- Create a safer version of the function that adapts to the actual schema
CREATE OR REPLACE FUNCTION create_connection_safely(req_id UUID, rec_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  existing_connection UUID;
  requester_name TEXT;
  has_content_column BOOLEAN := FALSE;
  has_title_column BOOLEAN := FALSE;
BEGIN
  -- Check if connection already exists
  SELECT id INTO existing_connection
  FROM connections 
  WHERE (requester_id = req_id AND receiver_id = rec_id) 
     OR (requester_id = rec_id AND receiver_id = req_id);
  
  IF existing_connection IS NOT NULL THEN
    RETURN json_build_object('error', 'Connection already exists', 'code', '23505');
  END IF;
  
  -- Insert connection without triggering notification issues
  INSERT INTO connections (requester_id, receiver_id, status, created_at)
  VALUES (req_id, rec_id, 'pending', NOW());
  
  -- Get requester name
  SELECT name INTO requester_name FROM profiles WHERE id = req_id;
  
  -- Check what columns exist in notifications table
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'content'
    AND table_schema = 'public'
  ) INTO has_content_column;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'title'
    AND table_schema = 'public'
  ) INTO has_title_column;
  
  -- Create notification with available columns only
  IF has_content_column AND has_title_column THEN
    -- Full schema with title and content
    INSERT INTO notifications (recipient_id, sender_id, type, title, content, data, read, created_at)
    VALUES (
      rec_id,
      req_id,
      'connection',
      'New Connection Request',
      COALESCE(requester_name, 'Someone') || ' wants to connect with you',
      json_build_object('connection_request', true),
      false,
      NOW()
    );
  ELSIF has_title_column THEN
    -- Schema with title but no content
    INSERT INTO notifications (recipient_id, sender_id, type, title, data, read, created_at)
    VALUES (
      rec_id,
      req_id,
      'connection',
      'New Connection Request from ' || COALESCE(requester_name, 'Someone'),
      json_build_object('connection_request', true, 'message', COALESCE(requester_name, 'Someone') || ' wants to connect with you'),
      false,
      NOW()
    );
  ELSE
    -- Minimal schema - just basic required fields
    INSERT INTO notifications (recipient_id, sender_id, type, data, read, created_at)
    VALUES (
      rec_id,
      req_id,
      'connection',
      json_build_object('connection_request', true, 'title', 'New Connection Request', 'message', COALESCE(requester_name, 'Someone') || ' wants to connect with you'),
      false,
      NOW()
    );
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Connection request created');
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM, 'code', SQLSTATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 