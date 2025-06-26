# Workspace Setup Guide

## The Problem

You're experiencing cascading schema errors because the database schema doesn't match what the application expects. This is a common issue when database migrations aren't applied correctly or completely.

## The Solution

Follow these steps to permanently fix the workspace feature:

### Step 1: Apply the Complete Schema

Copy and paste this SQL into your **Supabase SQL Editor**:

```sql
-- COMPLETE WORKSPACE SCHEMA FIX
-- This will create all required tables and columns

-- Create workspace_topics table with all columns
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

-- Add missing columns to existing workspace_topics
ALTER TABLE workspace_topics ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE workspace_topics ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE workspace_topics ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE workspace_topics ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE workspace_topics ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create workspace_materials table
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

-- Add missing columns to existing workspace_materials
ALTER TABLE workspace_materials ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;
ALTER TABLE workspace_materials ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE workspace_materials ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE workspace_materials ADD COLUMN IF NOT EXISTS material_type TEXT DEFAULT 'document';

-- Create workspace_tasks table
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

-- Add missing columns to existing workspace_tasks
ALTER TABLE workspace_tasks ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;
ALTER TABLE workspace_tasks ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE workspace_tasks ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE workspace_tasks ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'study';
ALTER TABLE workspace_tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE workspace_tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';

-- Create workspace_activities table
CREATE TABLE IF NOT EXISTS workspace_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES workspace_topics(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE workspace_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_activities ENABLE ROW LEVEL SECURITY;

-- Create security policies
DROP POLICY IF EXISTS "workspace_topics_policy" ON workspace_topics;
CREATE POLICY "workspace_topics_policy" ON workspace_topics FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "workspace_materials_policy" ON workspace_materials;
CREATE POLICY "workspace_materials_policy" ON workspace_materials FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "workspace_tasks_policy" ON workspace_tasks;
CREATE POLICY "workspace_tasks_policy" ON workspace_tasks FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "workspace_activities_policy" ON workspace_activities;
CREATE POLICY "workspace_activities_policy" ON workspace_activities FOR ALL USING (auth.uid() = user_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
```

### Step 2: Use the Resilient Service (Optional)

I've created a new `src/services/workspace-resilient.js` that handles schema inconsistencies gracefully. You can switch to it by updating your imports:

```javascript
// In your components, change:
import workspaceService from '../services/workspace';

// To:
import workspaceService from '../services/workspace-resilient';
```

### Step 3: Verify Everything Works

After applying the SQL:
1. Refresh your application
2. Try creating a new topic
3. The errors should be gone!

## Why This Happened

This type of error cascade occurs because:

1. **Incomplete Migrations**: Database tables were created but some columns were missing
2. **Schema Cache Issues**: Supabase sometimes caches old schema information
3. **No Validation**: The app assumes certain columns exist without checking

## Future Prevention

To prevent this in the future:

1. **Always validate schema** before deploying new features
2. **Use graceful degradation** - the app should work even with missing columns
3. **Test migrations thoroughly** in a development environment first
4. **Use schema versioning** to track what's been applied

## Architecture Improvements Made

The new resilient service includes:

- **Progressive field reduction**: Tries full schema first, then falls back to minimal fields
- **Schema mapping**: Knows which fields are required vs optional
- **Graceful degradation**: Fills in missing fields with defaults for UI consistency
- **Better error handling**: Distinguishes between schema errors and data errors
- **Future-proof design**: Can handle new schema changes without breaking

This approach makes your workspace feature much more robust and maintainable going forward. 