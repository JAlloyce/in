-- COMPLETE WORKSPACE SCHEMA MIGRATION
-- This file contains the complete, definitive schema for all workspace tables
-- Run this to ensure your database matches exactly what the application expects

-- =======================
-- WORKSPACE TOPICS TABLE
-- =======================

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS workspace_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    progress INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workspace_topics' 
                   AND column_name = 'status') THEN
        ALTER TABLE workspace_topics ADD COLUMN status TEXT DEFAULT 'active';
    END IF;

    -- Add progress column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workspace_topics' 
                   AND column_name = 'progress') THEN
        ALTER TABLE workspace_topics ADD COLUMN progress INTEGER DEFAULT 0;
    END IF;

    -- Add metadata column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workspace_topics' 
                   AND column_name = 'metadata') THEN
        ALTER TABLE workspace_topics ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;

    -- Add timestamps if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workspace_topics' 
                   AND column_name = 'created_at') THEN
        ALTER TABLE workspace_topics ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workspace_topics' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE workspace_topics ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- =======================
-- WORKSPACE MATERIALS TABLE
-- =======================

CREATE TABLE IF NOT EXISTS workspace_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    topic_id UUID NOT NULL REFERENCES workspace_topics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    material_type TEXT NOT NULL DEFAULT 'document',
    content TEXT,
    url TEXT,
    file_path TEXT,
    completed BOOLEAN DEFAULT FALSE,
    ai_generated BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to materials table
DO $$ 
BEGIN
    -- Add completed column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workspace_materials' 
                   AND column_name = 'completed') THEN
        ALTER TABLE workspace_materials ADD COLUMN completed BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add ai_generated column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workspace_materials' 
                   AND column_name = 'ai_generated') THEN
        ALTER TABLE workspace_materials ADD COLUMN ai_generated BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add metadata column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workspace_materials' 
                   AND column_name = 'metadata') THEN
        ALTER TABLE workspace_materials ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;

    -- Add type column with proper constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workspace_materials' 
                   AND column_name = 'material_type') THEN
        ALTER TABLE workspace_materials ADD COLUMN material_type TEXT NOT NULL DEFAULT 'document' 
        CHECK (material_type IN ('document', 'video', 'article', 'file', 'link'));
    END IF;
END $$;

-- =======================
-- WORKSPACE TASKS TABLE
-- =======================

CREATE TABLE IF NOT EXISTS workspace_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES workspace_topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'study',
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER, -- in minutes
    completed BOOLEAN DEFAULT FALSE,
    ai_generated BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to tasks table
DO $$ 
BEGIN
    -- Add completed column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workspace_tasks' 
                   AND column_name = 'completed') THEN
        ALTER TABLE workspace_tasks ADD COLUMN completed BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add ai_generated column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workspace_tasks' 
                   AND column_name = 'ai_generated') THEN
        ALTER TABLE workspace_tasks ADD COLUMN ai_generated BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add metadata column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'workspace_tasks' 
                   AND column_name = 'metadata') THEN
        ALTER TABLE workspace_tasks ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- =======================
-- WORKSPACE ACTIVITIES TABLE
-- =======================

CREATE TABLE IF NOT EXISTS workspace_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES workspace_topics(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =======================
-- INDEXES FOR PERFORMANCE
-- =======================

CREATE INDEX IF NOT EXISTS idx_workspace_topics_user_id ON workspace_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_topics_status ON workspace_topics(status);
CREATE INDEX IF NOT EXISTS idx_workspace_materials_topic_id ON workspace_materials(topic_id);
CREATE INDEX IF NOT EXISTS idx_workspace_materials_user_id ON workspace_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_user_id ON workspace_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_topic_id ON workspace_tasks(topic_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_status ON workspace_tasks(status);
CREATE INDEX IF NOT EXISTS idx_workspace_activities_user_id ON workspace_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_activities_created_at ON workspace_activities(created_at);

-- =======================
-- ROW LEVEL SECURITY
-- =======================

-- Enable RLS on all tables
ALTER TABLE workspace_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspace_topics
DROP POLICY IF EXISTS "Users can view their own topics" ON workspace_topics;
CREATE POLICY "Users can view their own topics" ON workspace_topics
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own topics" ON workspace_topics;
CREATE POLICY "Users can insert their own topics" ON workspace_topics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own topics" ON workspace_topics;
CREATE POLICY "Users can update their own topics" ON workspace_topics
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own topics" ON workspace_topics;
CREATE POLICY "Users can delete their own topics" ON workspace_topics
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for workspace_materials
DROP POLICY IF EXISTS "Users can view their own materials" ON workspace_materials;
CREATE POLICY "Users can view their own materials" ON workspace_materials
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own materials" ON workspace_materials;
CREATE POLICY "Users can insert their own materials" ON workspace_materials
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own materials" ON workspace_materials;
CREATE POLICY "Users can update their own materials" ON workspace_materials
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own materials" ON workspace_materials;
CREATE POLICY "Users can delete their own materials" ON workspace_materials
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for workspace_tasks
DROP POLICY IF EXISTS "Users can view their own tasks" ON workspace_tasks;
CREATE POLICY "Users can view their own tasks" ON workspace_tasks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tasks" ON workspace_tasks;
CREATE POLICY "Users can insert their own tasks" ON workspace_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tasks" ON workspace_tasks;
CREATE POLICY "Users can update their own tasks" ON workspace_tasks
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tasks" ON workspace_tasks;
CREATE POLICY "Users can delete their own tasks" ON workspace_tasks
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for workspace_activities
DROP POLICY IF EXISTS "Users can view their own activities" ON workspace_activities;
CREATE POLICY "Users can view their own activities" ON workspace_activities
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own activities" ON workspace_activities;
CREATE POLICY "Users can insert their own activities" ON workspace_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =======================
-- UPDATE TRIGGERS
-- =======================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
DROP TRIGGER IF EXISTS update_workspace_topics_updated_at ON workspace_topics;
CREATE TRIGGER update_workspace_topics_updated_at
    BEFORE UPDATE ON workspace_topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workspace_materials_updated_at ON workspace_materials;
CREATE TRIGGER update_workspace_materials_updated_at
    BEFORE UPDATE ON workspace_materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workspace_tasks_updated_at ON workspace_tasks;
CREATE TRIGGER update_workspace_tasks_updated_at
    BEFORE UPDATE ON workspace_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =======================
-- COMPLETED
-- =======================

-- Refresh the schema cache to ensure all changes are recognized
NOTIFY pgrst, 'reload schema'; 