-- Fix for missing metadata column in workspace_topics table
-- This addresses the PGRST204 error: "Could not find the 'metadata' column"

-- Add metadata column to workspace_topics table
ALTER TABLE workspace_topics 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Update the metadata column to have a proper default value for existing records
UPDATE workspace_topics 
SET metadata = '{}' 
WHERE metadata IS NULL;

-- Refresh the schema cache to ensure the new column is recognized
NOTIFY pgrst, 'reload schema'; 