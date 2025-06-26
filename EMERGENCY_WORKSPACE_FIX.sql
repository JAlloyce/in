-- EMERGENCY WORKSPACE FIX
-- This handles tables with wrong structure

DROP TABLE IF EXISTS workspace_activities CASCADE;
DROP TABLE IF EXISTS workspace_tasks CASCADE;
DROP TABLE IF EXISTS workspace_materials CASCADE;
DROP TABLE IF EXISTS workspace_topics CASCADE;

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

CREATE TABLE workspace_materials (
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

CREATE TABLE workspace_tasks (
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

CREATE TABLE workspace_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES workspace_topics(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE workspace_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_topics_policy" ON workspace_topics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "workspace_materials_policy" ON workspace_materials FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "workspace_tasks_policy" ON workspace_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "workspace_activities_policy" ON workspace_activities FOR ALL USING (auth.uid() = user_id);

-- Step 9: Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workspace_topics_updated_at
    BEFORE UPDATE ON workspace_topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_materials_updated_at
    BEFORE UPDATE ON workspace_materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_tasks_updated_at
    BEFORE UPDATE ON workspace_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 10: Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Verification queries (run these after to confirm everything worked)
-- SELECT 'workspace_topics' as table_name, count(*) as row_count FROM workspace_topics
-- UNION ALL
-- SELECT 'workspace_materials', count(*) FROM workspace_materials  
-- UNION ALL
-- SELECT 'workspace_tasks', count(*) FROM workspace_tasks
-- UNION ALL
-- SELECT 'workspace_activities', count(*) FROM workspace_activities; 