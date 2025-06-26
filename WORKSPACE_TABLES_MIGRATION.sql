-- Workspace Tables Migration
-- This file creates all necessary tables for the LinkedIn Clone Workspace feature
-- Run this in your Supabase SQL editor to create the missing tables

-- ========================================
-- CREATE WORKSPACE ACTIVITIES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.workspace_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action VARCHAR(100) NOT NULL,
    topic_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CREATE WORKSPACE TASKS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.workspace_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    topic_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    type VARCHAR(50) DEFAULT 'study',
    due_date DATE,
    estimated_duration INTEGER, -- in minutes
    completed_at TIMESTAMP WITH TIME ZONE,
    ai_generated BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CREATE WORKSPACE TOPICS TABLE (if not exists)
-- ========================================

CREATE TABLE IF NOT EXISTS public.workspace_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    ai_generated BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CREATE WORKSPACE MATERIALS TABLE (if not exists)
-- ========================================

CREATE TABLE IF NOT EXISTS public.workspace_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    topic_id UUID REFERENCES public.workspace_topics(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'file', 'link', 'note', 'video', etc.
    content TEXT,
    file_path VARCHAR(500),
    file_size BIGINT,
    mime_type VARCHAR(100),
    ai_generated BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ========================================

-- Workspace Activities Indexes
CREATE INDEX IF NOT EXISTS idx_workspace_activities_user_id ON public.workspace_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_activities_created_at ON public.workspace_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_workspace_activities_action ON public.workspace_activities(action);
CREATE INDEX IF NOT EXISTS idx_workspace_activities_topic_id ON public.workspace_activities(topic_id);

-- Workspace Tasks Indexes
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_user_id ON public.workspace_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_topic_id ON public.workspace_tasks(topic_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_status ON public.workspace_tasks(status);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_priority ON public.workspace_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_due_date ON public.workspace_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_created_at ON public.workspace_tasks(created_at);

-- Workspace Topics Indexes
CREATE INDEX IF NOT EXISTS idx_workspace_topics_user_id ON public.workspace_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_topics_status ON public.workspace_topics(status);
CREATE INDEX IF NOT EXISTS idx_workspace_topics_created_at ON public.workspace_topics(created_at);

-- Workspace Materials Indexes
CREATE INDEX IF NOT EXISTS idx_workspace_materials_user_id ON public.workspace_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_materials_topic_id ON public.workspace_materials(topic_id);
CREATE INDEX IF NOT EXISTS idx_workspace_materials_type ON public.workspace_materials(type);
CREATE INDEX IF NOT EXISTS idx_workspace_materials_created_at ON public.workspace_materials(created_at);

-- ========================================
-- ENABLE ROW LEVEL SECURITY
-- ========================================

ALTER TABLE public.workspace_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_materials ENABLE ROW LEVEL SECURITY;

-- ========================================
-- CREATE RLS POLICIES FOR WORKSPACE_ACTIVITIES
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own activities" ON public.workspace_activities;
DROP POLICY IF EXISTS "Users can insert their own activities" ON public.workspace_activities;

-- Create policies
CREATE POLICY "Users can view their own activities" ON public.workspace_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" ON public.workspace_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- CREATE RLS POLICIES FOR WORKSPACE_TASKS
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.workspace_tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.workspace_tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.workspace_tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.workspace_tasks;

-- Create policies
CREATE POLICY "Users can view their own tasks" ON public.workspace_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON public.workspace_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON public.workspace_tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON public.workspace_tasks
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- CREATE RLS POLICIES FOR WORKSPACE_TOPICS
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own topics" ON public.workspace_topics;
DROP POLICY IF EXISTS "Users can insert their own topics" ON public.workspace_topics;
DROP POLICY IF EXISTS "Users can update their own topics" ON public.workspace_topics;
DROP POLICY IF EXISTS "Users can delete their own topics" ON public.workspace_topics;

-- Create policies
CREATE POLICY "Users can view their own topics" ON public.workspace_topics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own topics" ON public.workspace_topics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topics" ON public.workspace_topics
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own topics" ON public.workspace_topics
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- CREATE RLS POLICIES FOR WORKSPACE_MATERIALS
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own materials" ON public.workspace_materials;
DROP POLICY IF EXISTS "Users can insert their own materials" ON public.workspace_materials;
DROP POLICY IF EXISTS "Users can update their own materials" ON public.workspace_materials;
DROP POLICY IF EXISTS "Users can delete their own materials" ON public.workspace_materials;

-- Create policies
CREATE POLICY "Users can view their own materials" ON public.workspace_materials
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own materials" ON public.workspace_materials
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own materials" ON public.workspace_materials
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own materials" ON public.workspace_materials
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- CREATE TRIGGER FUNCTIONS FOR UPDATED_AT
-- ========================================

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at fields
DROP TRIGGER IF EXISTS update_workspace_tasks_updated_at ON public.workspace_tasks;
CREATE TRIGGER update_workspace_tasks_updated_at
    BEFORE UPDATE ON public.workspace_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workspace_topics_updated_at ON public.workspace_topics;
CREATE TRIGGER update_workspace_topics_updated_at
    BEFORE UPDATE ON public.workspace_topics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workspace_materials_updated_at ON public.workspace_materials;
CREATE TRIGGER update_workspace_materials_updated_at
    BEFORE UPDATE ON public.workspace_materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Uncomment these to verify the tables were created successfully:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'workspace_%';
-- SELECT tablename, hasindexes, hasrules, hastriggers FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'workspace_%'; 