-- Create a simple connection function that skips notifications to test core functionality
CREATE OR REPLACE FUNCTION create_connection_safely(req_id UUID, rec_id UUID)
RETURNS JSON AS $$
DECLARE
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
  
  -- Insert connection request
  INSERT INTO connections (requester_id, receiver_id, status, created_at)
  VALUES (req_id, rec_id, 'pending', NOW());
  
  -- Skip notification creation for now to test core functionality
  -- We'll add notifications back once the connection creation works
  
  RETURN json_build_object('success', true, 'message', 'Connection request created successfully');
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM, 'code', SQLSTATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 