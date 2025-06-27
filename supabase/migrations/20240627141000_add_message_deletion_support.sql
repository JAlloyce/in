-- Add support for message deletion
-- Migration: add_message_deletion_support
-- Created: 2024-06-27

-- Add is_deleted column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Create index for better performance when filtering deleted messages
CREATE INDEX IF NOT EXISTS idx_messages_is_deleted ON messages(is_deleted);

-- Add comment for documentation
COMMENT ON COLUMN messages.is_deleted IS 'Indicates if the message has been deleted by the sender';

-- Update RLS policies to handle deleted messages if needed
-- (Current policies should still work with the new column) 