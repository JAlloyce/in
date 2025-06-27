-- Fix notifications table schema
-- The error suggests there's a user_id column that shouldn't exist
-- Ensure the table has the correct structure

-- First, check if the table exists and has the wrong structure
DO $$
BEGIN
    -- If user_id column exists, drop it and add correct columns
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        -- Drop the incorrect column
        ALTER TABLE notifications DROP COLUMN IF EXISTS user_id;
        
        -- Add correct columns if they don't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'notifications' 
            AND column_name = 'recipient_id'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE notifications ADD COLUMN recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'notifications' 
            AND column_name = 'sender_id'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE notifications ADD COLUMN sender_id UUID REFERENCES profiles(id);
        END IF;
        
        RAISE NOTICE 'Fixed notifications table schema by removing user_id and ensuring recipient_id/sender_id exist';
    END IF;
END $$;

-- Ensure the table structure is correct
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,
  title TEXT,
  content TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, read) WHERE read = FALSE;

-- Create or replace the notification function
CREATE OR REPLACE FUNCTION create_notification(
  recipient_id UUID,
  sender_id UUID,
  notification_type TEXT,
  title TEXT,
  content TEXT,
  data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (recipient_id, sender_id, type, title, content, data)
  VALUES (recipient_id, sender_id, notification_type, title, content, data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create a trigger to automatically create connection request notifications
CREATE OR REPLACE FUNCTION notify_connection_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification for new pending connection requests
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    -- Get the requester's name
    DECLARE
      requester_name TEXT;
    BEGIN
      SELECT name INTO requester_name 
      FROM profiles 
      WHERE id = NEW.requester_id;
      
      -- Create notification for the receiver
      PERFORM create_notification(
        NEW.receiver_id,
        NEW.requester_id,
        'connection',
        'New Connection Request',
        requester_name || ' wants to connect with you',
        jsonb_build_object('connection_id', NEW.id, 'type', 'connection_request')
      );
    END;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger
DROP TRIGGER IF EXISTS notify_connection_request_trigger ON connections;
CREATE TRIGGER notify_connection_request_trigger
  AFTER INSERT ON connections
  FOR EACH ROW EXECUTE FUNCTION notify_connection_request(); 