-- ===================================================================
-- DATABASE FIX MIGRATION (FOREIGN KEYS & MISSING COLUMNS)
-- ===================================================================
-- This script fixes the workspace tables by adding missing columns
-- and ensuring all foreign key relationships are correctly established.

-- Step 1: Add the missing 'completed' column to workspace_materials
ALTER TABLE public.workspace_materials
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Step 2: Add the missing 'topic_id' foreign key to workspace_tasks
-- First, drop the constraint if it exists, to prevent errors on re-run
ALTER TABLE public.workspace_tasks DROP CONSTRAINT IF EXISTS workspace_tasks_topic_id_fkey;

-- Add the foreign key constraint
ALTER TABLE public.workspace_tasks
ADD CONSTRAINT workspace_tasks_topic_id_fkey
FOREIGN KEY (topic_id) REFERENCES public.workspace_topics(id) ON DELETE CASCADE;

-- Step 3: Add the missing 'user_id' to workspace_materials (if it doesn't exist)
-- This is crucial for RLS policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'workspace_materials'
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.workspace_materials ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;


-- Step 4: Add the missing 'ai_generated' column to workspace_topics if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'workspace_topics'
        AND column_name = 'ai_generated'
    ) THEN
        ALTER TABLE public.workspace_topics ADD COLUMN ai_generated BOOLEAN DEFAULT FALSE;
    END IF;
END $$;


-- Grant permissions on the tables to the authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_activities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_topics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_materials TO authenticated;

-- Grant usage on the schema to the authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;

-- Re-apply RLS policies to ensure they are correct
-- These will be re-created idempotently

-- RLS for workspace_materials
DROP POLICY IF EXISTS "Users can view their own materials" ON public.workspace_materials;
CREATE POLICY "Users can view their own materials" ON public.workspace_materials
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own materials" ON public.workspace_materials;
CREATE POLICY "Users can insert their own materials" ON public.workspace_materials
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own materials" ON public.workspace_materials;
CREATE POLICY "Users can update their own materials" ON public.workspace_materials
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own materials" ON public.workspace_materials;
CREATE POLICY "Users can delete their own materials" ON public.workspace_materials
    FOR DELETE USING (auth.uid() = user_id);

-- RLS for workspace_tasks
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.workspace_tasks;
CREATE POLICY "Users can view their own tasks" ON public.workspace_tasks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.workspace_tasks;
CREATE POLICY "Users can insert their own tasks" ON public.workspace_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tasks" ON public.workspace_tasks;
CREATE POLICY "Users can update their own tasks" ON public.workspace_tasks
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.workspace_tasks;
CREATE POLICY "Users can delete their own tasks" ON public.workspace_tasks
    FOR DELETE USING (auth.uid() = user_id);


-- Final confirmation message
SELECT 'DATABASE_FIX_FOREIGN_KEYS migration applied successfully. The ''completed'' column has been added and other constraints are fixed.' as status; 