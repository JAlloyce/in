# 🛠️ Workspace Database Setup Instructions

## ❌ Current Issue
The workspace feature is failing because the required database tables don't exist in your Supabase database. You're seeing this error:

```
relation "public.workspace_activities" does not exist
```

## ✅ Solution
You need to create the missing database tables in your Supabase database.

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `nuntsizvwfmjzucuubcd`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Migration
1. Copy the entire contents of `DATABASE_WORKSPACE_MIGRATION.sql` (in this project root)
2. Paste it into the SQL editor
3. Click **Run** to execute the migration

### Step 3: Verify Tables Were Created
After running the migration, run this verification query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'workspace_%'
ORDER BY table_name;
```

You should see:
- `workspace_activities`
- `workspace_materials` 
- `workspace_tasks`
- `workspace_topics`

## 🔧 What the Migration Does

### Creates 4 Tables:
1. **`workspace_activities`** - Tracks user activities for analytics
2. **`workspace_tasks`** - Stores all workspace tasks and assignments  
3. **`workspace_topics`** - Main learning topics/subjects
4. **`workspace_materials`** - Files, notes, and study materials

### Sets Up Security:
- ✅ Row Level Security (RLS) policies
- ✅ User-specific data access
- ✅ Proper foreign key relationships
- ✅ Database indexes for performance

### Enables Features:
- ✅ Activity tracking and analytics dashboard
- ✅ Task management with database persistence
- ✅ File uploads and OCR integration
- ✅ AI-generated content storage
- ✅ Cross-session data persistence

## 🚀 After Setup
Once you run the migration:

1. **Refresh your application** - The workspace should load without errors
2. **Test features:**
   - Upload PDF files ✅
   - Generate AI learning plans ✅  
   - Create and manage tasks ✅
   - View activity analytics ✅
   - Data persists across browser sessions ✅

## 🆘 Troubleshooting

### If you still see errors:
1. **Check RLS policies** - Make sure you're logged in with a valid user
2. **Verify table creation** - Run the verification query above
3. **Clear browser cache** - Hard refresh the application
4. **Check console** - Look for any remaining error messages

### Alternative: Manual Table Creation
If the full migration fails, you can create tables one by one:

```sql
-- Just the activities table first
CREATE TABLE public.workspace_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action VARCHAR(100) NOT NULL,
    topic_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.workspace_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activities" ON public.workspace_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" ON public.workspace_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 💡 Code Changes Made
I've already updated the workspace service (`src/services/workspace.js`) to:
- ✅ Handle missing tables gracefully  
- ✅ Show warnings instead of crashing
- ✅ Return empty data when tables don't exist
- ✅ Continue working with reduced functionality

The application will work with limited functionality even before you run the migration, but you'll get the full experience after creating the tables.

---
**Next Steps:** Run the migration, then test your workspace features! 🎉 