/**
 * WORKSPACE SETUP AND VALIDATION SCRIPT
 * Run this to ensure your workspace database schema is properly configured
 */

console.log('🚀 Workspace Setup Tool');
console.log('=======================');
console.log('This script helps validate and fix your workspace database schema.');
console.log('');

const SQL_FIX = `
-- COMPLETE WORKSPACE SCHEMA FIX
-- Copy and paste this into your Supabase SQL editor

-- Create tables with all required columns
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

-- Add missing columns safely (won't error if they already exist)
ALTER TABLE workspace_topics ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE workspace_topics ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE workspace_topics ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE workspace_topics ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE workspace_topics ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE workspace_materials ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;
ALTER TABLE workspace_materials ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE workspace_materials ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE workspace_materials ADD COLUMN IF NOT EXISTS material_type TEXT DEFAULT 'document';

ALTER TABLE workspace_tasks ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;
ALTER TABLE workspace_tasks ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE workspace_tasks ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE workspace_tasks ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'study';
ALTER TABLE workspace_tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE workspace_tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';

-- Enable Row Level Security
ALTER TABLE workspace_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_activities ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workspace_topics_policy') THEN
        CREATE POLICY workspace_topics_policy ON workspace_topics FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workspace_materials_policy') THEN
        CREATE POLICY workspace_materials_policy ON workspace_materials FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workspace_tasks_policy') THEN
        CREATE POLICY workspace_tasks_policy ON workspace_tasks FOR ALL USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'workspace_activities_policy') THEN
        CREATE POLICY workspace_activities_policy ON workspace_activities FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
`;

console.log('📋 INSTRUCTIONS:');
console.log('================');
console.log('1. Copy the SQL below this message');
console.log('2. Go to your Supabase Dashboard > SQL Editor');
console.log('3. Paste and run the SQL');
console.log('4. This will fix all schema issues');
console.log('');
console.log('SQL TO RUN:');
console.log('===========');
console.log(SQL_FIX);

export default SQL_FIX; 