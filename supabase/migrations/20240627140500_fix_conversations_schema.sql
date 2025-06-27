-- Fix conversations table schema to match RLS policy expectations
-- The RLS policies in messages table expect participant_1_id and participant_2_id columns

-- First, add the new columns
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS participant_1_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS participant_2_id UUID REFERENCES auth.users(id);

-- Migrate existing data from participants array to individual columns
-- This assumes conversations have exactly 2 participants
UPDATE conversations 
SET 
  participant_1_id = participants[1],
  participant_2_id = participants[2]
WHERE participants IS NOT NULL AND array_length(participants, 1) >= 2;

-- Add constraints to ensure data integrity
ALTER TABLE conversations 
ADD CONSTRAINT conversations_participants_different 
CHECK (participant_1_id != participant_2_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS conversations_participant_1_idx ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS conversations_participant_2_idx ON conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS conversations_participants_composite ON conversations(participant_1_id, participant_2_id);

-- Keep the participants array column for backward compatibility but make it optional
ALTER TABLE conversations ALTER COLUMN participants DROP NOT NULL;

-- Add a function to keep participants array in sync with individual columns
CREATE OR REPLACE FUNCTION sync_conversation_participants()
RETURNS TRIGGER AS $$
BEGIN
  -- Update participants array when individual columns change
  IF NEW.participant_1_id IS NOT NULL AND NEW.participant_2_id IS NOT NULL THEN
    NEW.participants = ARRAY[NEW.participant_1_id, NEW.participant_2_id];
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to keep data in sync
DROP TRIGGER IF EXISTS sync_conversation_participants_trigger ON conversations;
CREATE TRIGGER sync_conversation_participants_trigger
  BEFORE INSERT OR UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION sync_conversation_participants();

-- Update existing conversations to populate the participants array
UPDATE conversations 
SET participants = ARRAY[participant_1_id, participant_2_id]
WHERE participant_1_id IS NOT NULL AND participant_2_id IS NOT NULL AND participants IS NULL; 