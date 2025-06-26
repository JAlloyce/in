-- ========================================
-- WORKSPACE TABLES MIGRATION
-- ========================================
-- This file creates all necessary tables for the LinkedIn Clone Workspace feature
-- Copy and paste this SQL into your Supabase SQL editor and run it

-- Create workspace_activities table
CREATE TABLE IF NOT EXISTS public.workspace_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action VARCHAR(100) NOT NULL,
    topic_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspace_tasks table
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
    estimated_duration INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    ai_generated BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workspace_topics table (if not exists)
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

-- Create workspace_materials table (if not exists)
CREATE TABLE IF NOT EXISTS public.workspace_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    topic_id UUID REFERENCES public.workspace_topics(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    content TEXT,
    file_path VARCHAR(500),
    file_size BIGINT,
    mime_type VARCHAR(100),
    ai_generated BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workspace_activities_user_id ON public.workspace_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_activities_created_at ON public.workspace_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_user_id ON public.workspace_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_topic_id ON public.workspace_tasks(topic_id);
CREATE INDEX IF NOT EXISTS idx_workspace_tasks_status ON public.workspace_tasks(status);
CREATE INDEX IF NOT EXISTS idx_workspace_topics_user_id ON public.workspace_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_materials_user_id ON public.workspace_materials(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_materials_topic_id ON public.workspace_materials(topic_id);

-- Enable RLS
ALTER TABLE public.workspace_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_materials ENABLE ROW LEVEL SECURITY;

-- RLS policies for workspace_activities
DROP POLICY IF EXISTS "Users can view their own activities" ON public.workspace_activities;
CREATE POLICY "Users can view their own activities" ON public.workspace_activities
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own activities" ON public.workspace_activities;
CREATE POLICY "Users can insert their own activities" ON public.workspace_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for workspace_tasks
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

-- RLS policies for workspace_topics
DROP POLICY IF EXISTS "Users can view their own topics" ON public.workspace_topics;
CREATE POLICY "Users can view their own topics" ON public.workspace_topics
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own topics" ON public.workspace_topics;
CREATE POLICY "Users can insert their own topics" ON public.workspace_topics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own topics" ON public.workspace_topics;
CREATE POLICY "Users can update their own topics" ON public.workspace_topics
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own topics" ON public.workspace_topics;
CREATE POLICY "Users can delete their own topics" ON public.workspace_topics
    FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for workspace_materials
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

-- Create updated_at trigger function
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