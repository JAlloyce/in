-- SAFE WORKSPACE FIX 
-- This attempts to preserve existing data while fixing the schema

-- Rename existing table to backup
ALTER TABLE IF EXISTS workspace_topics RENAME TO workspace_topics_backup;

-- Create new table with correct structure
CREATE TABLE workspace_topics (
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

-- If you had data in the old table and want to migrate it:
-- INSERT INTO workspace_topics (title, description, user_id)
-- SELECT title, description, 'YOUR_USER_ID_HERE'::UUID 
-- FROM workspace_topics_backup;

-- Create other tables
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
    estimated_duration INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    ai_generated BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspace_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES workspace_topics(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE workspace_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "workspace_topics_policy" ON workspace_topics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "workspace_materials_policy" ON workspace_materials FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "workspace_tasks_policy" ON workspace_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "workspace_activities_policy" ON workspace_activities FOR ALL USING (auth.uid() = user_id);

-- Optional: Drop backup table after confirming everything works
-- DROP TABLE workspace_topics_backup; 