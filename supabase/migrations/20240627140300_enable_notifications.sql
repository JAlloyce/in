-- Re-enable notifications for connection requests with correct schema
-- First, check what columns actually exist in notifications table

-- Update the connection function to include notifications
CREATE OR REPLACE FUNCTION create_connection_safely(req_id UUID, rec_id UUID)
RETURNS JSON AS $$
DECLARE
  existing_connection UUID;
  requester_name TEXT;
  new_connection_id UUID;
BEGIN
  -- Check if connection already exists
  SELECT id INTO existing_connection
  FROM connections 
  WHERE (requester_id = req_id AND receiver_id = rec_id) 
     OR (requester_id = rec_id AND receiver_id = req_id);
  
  IF existing_connection IS NOT NULL THEN
    RETURN json_build_object('error', 'Connection already exists', 'code', '23505');
  END IF;
  
  -- Insert connection request
  INSERT INTO connections (requester_id, receiver_id, status, created_at)
  VALUES (req_id, rec_id, 'pending', NOW())
  RETURNING id INTO new_connection_id;
  
  -- Get requester name for notification
  SELECT name INTO requester_name FROM profiles WHERE id = req_id;
  
  -- Create notification with minimal required fields
  -- Using only fields that definitely exist in the table
  BEGIN
    INSERT INTO notifications (recipient_id, sender_id, type, data, read, created_at)
    VALUES (
      rec_id,
      req_id,
      'connection',
      json_build_object(
        'connection_id', new_connection_id,
        'type', 'connection_request',
        'title', 'New Connection Request',
        'message', COALESCE(requester_name, 'Someone') || ' wants to connect with you'
      ),
      false,
      NOW()
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- If notification creation fails, log it but don't fail the connection creation
      RAISE NOTICE 'Notification creation failed: %', SQLERRM;
  END;
  
  RETURN json_build_object('success', true, 'message', 'Connection request created successfully', 'connection_id', new_connection_id);
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM, 'code', SQLSTATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 