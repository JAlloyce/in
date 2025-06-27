-- Create a safe connection creation function that bypasses notification triggers
CREATE OR REPLACE FUNCTION create_connection_safely(req_id UUID, rec_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  existing_connection UUID;
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
  
  -- Manually create notification with correct schema
  INSERT INTO notifications (recipient_id, sender_id, type, title, content, data, read, created_at)
  SELECT 
    rec_id,
    req_id,
    'connection',
    'New Connection Request',
    p.name || ' wants to connect with you',
    json_build_object('connection_request', true),
    false,
    NOW()
  FROM profiles p 
  WHERE p.id = req_id;
  
  RETURN json_build_object('success', true, 'message', 'Connection request created');
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM, 'code', SQLSTATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 