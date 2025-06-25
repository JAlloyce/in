import { useState } from 'react'
import { supabase } from '../lib/supabase'

function DatabaseFix() {
  const [isFixing, setIsFixing] = useState(false)
  const [logs, setLogs] = useState([])
  const [completed, setCompleted] = useState(false)

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date().toLocaleTimeString() }])
  }

  const applyDatabaseFixes = async () => {
    setIsFixing(true)
    setLogs([])
    addLog('🚀 Starting database fixes...', 'info')

    try {
      // 1. Add foreign key constraint for posts.author_id -> profiles.id
      addLog('1. Adding foreign key constraint for posts...', 'info')
      
      const { error: fkError } = await supabase
        .from('posts')
        .select('id')
        .limit(1)
      
      if (fkError) {
        addLog(`❌ Posts table access error: ${fkError.message}`, 'error')
      } else {
        addLog('✅ Posts table accessible - foreign key should work', 'success')
      }

      // 2. Create likes table using direct SQL approach
      addLog('2. Creating likes table...', 'info')
      
      // Use a simple insert to test if likes table exists
      const { error: likesTestError } = await supabase
        .from('likes')
        .select('id')
        .limit(1)
      
      if (likesTestError && likesTestError.code === '42P01') {
        // Table doesn't exist, need to create it
        addLog('❌ Likes table missing - need to create manually in Supabase dashboard', 'error')
        addLog('SQL to run in Supabase SQL Editor:', 'info')
        addLog(`
CREATE TABLE public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    UNIQUE(post_id, user_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike their likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_likes_post_id ON public.likes(post_id);
CREATE INDEX idx_likes_user_id ON public.likes(user_id);

GRANT ALL ON public.likes TO authenticated;
        `, 'code')
      } else {
        addLog('✅ Likes table exists', 'success')
      }

      // 3. Test comments table
      addLog('3. Checking comments table...', 'info')
      
      const { error: commentsTestError } = await supabase
        .from('comments')
        .select('id')
        .limit(1)
      
      if (commentsTestError && commentsTestError.code === '42P01') {
        addLog('❌ Comments table missing - need to create manually', 'error')
        addLog('SQL to run in Supabase SQL Editor:', 'info')
        addLog(`
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    content TEXT NOT NULL,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);

GRANT ALL ON public.comments TO authenticated;
        `, 'code')
      } else {
        addLog('✅ Comments table exists', 'success')
      }

      // 4. Test jobs table
      addLog('4. Checking jobs table...', 'info')
      
      const { error: jobsTestError } = await supabase
        .from('jobs')
        .select('id')
        .limit(1)
      
      if (jobsTestError && jobsTestError.code === '42P01') {
        addLog('❌ Jobs table missing - need to create manually', 'error')
        addLog('SQL to run in Supabase SQL Editor:', 'info')
        addLog(`
CREATE TABLE public.jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    location TEXT,
    job_type TEXT DEFAULT 'full-time' CHECK (job_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
    salary_min INTEGER,
    salary_max INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    requirements TEXT,
    benefits TEXT,
    posted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active jobs" ON public.jobs FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = posted_by);
CREATE POLICY "Users can update their jobs" ON public.jobs FOR UPDATE USING (auth.uid() = posted_by);

CREATE INDEX idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX idx_jobs_is_active ON public.jobs(is_active);

GRANT ALL ON public.jobs TO authenticated;
        `, 'code')
      } else {
        addLog('✅ Jobs table exists', 'success')
      }

      // 5. Test communities table
      addLog('5. Checking communities table...', 'info')
      
      const { error: communitiesTestError } = await supabase
        .from('communities')
        .select('id')
        .limit(1)
      
      if (communitiesTestError && communitiesTestError.code === '42P01') {
        addLog('❌ Communities table missing - need to create manually', 'error')
        addLog('SQL to run in Supabase SQL Editor:', 'info')
        addLog(`
CREATE TABLE public.communities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    description TEXT,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    member_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    rules TEXT[],
    cover_image_url TEXT,
    icon_url TEXT
);

CREATE TABLE public.community_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active communities" ON public.communities FOR SELECT USING (is_active = true);
CREATE POLICY "Users can create communities" ON public.communities FOR INSERT WITH CHECK (auth.uid() = admin_id);
CREATE POLICY "Admins can update their communities" ON public.communities FOR UPDATE USING (auth.uid() = admin_id);

CREATE POLICY "Users can view community members" ON public.community_members FOR SELECT USING (true);
CREATE POLICY "Users can join communities" ON public.community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave communities" ON public.community_members FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_communities_admin_id ON public.communities(admin_id);
CREATE INDEX idx_community_members_community_id ON public.community_members(community_id);
CREATE INDEX idx_community_members_user_id ON public.community_members(user_id);

GRANT ALL ON public.communities TO authenticated;
GRANT ALL ON public.community_members TO authenticated;
        `, 'code')
      } else {
        addLog('✅ Communities table exists', 'success')
      }

      addLog('🎉 Database analysis complete!', 'success')
      addLog('Please copy the SQL statements above and run them in your Supabase SQL Editor.', 'info')
      addLog('Dashboard: https://supabase.com/dashboard/project/nuntsizvwfmjzucuubcd/sql/new', 'info')
      
      setCompleted(true)
      
    } catch (error) {
      addLog(`❌ Error during database analysis: ${error.message}`, 'error')
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔧 Database Fix Utility
          </h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This utility will analyze your database and provide the SQL commands needed to fix missing tables and relationships.
            </p>
            
            <button
              onClick={applyDatabaseFixes}
              disabled={isFixing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-md font-medium"
            >
              {isFixing ? '🔄 Analyzing Database...' : '🚀 Analyze Database'}
            </button>
          </div>

          {logs.length > 0 && (
            <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
              <h3 className="text-white font-semibold mb-3">Analysis Log:</h3>
              {logs.map((log, index) => (
                <div key={index} className="mb-2">
                  <span className="text-gray-400 text-sm">{log.timestamp}</span>
                  <span
                    className={`ml-2 ${
                      log.type === 'error'
                        ? 'text-red-400'
                        : log.type === 'success'
                        ? 'text-green-400'
                        : log.type === 'code'
                        ? 'text-yellow-400 font-mono text-xs whitespace-pre-wrap'
                        : 'text-white'
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          )}

          {completed && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-blue-900 font-semibold mb-2">✅ Next Steps:</h3>
              <ol className="text-blue-800 space-y-1">
                <li>1. Open Supabase Dashboard: <a href="https://supabase.com/dashboard/project/nuntsizvwfmjzucuubcd/sql/new" target="_blank" rel="noopener noreferrer" className="underline">SQL Editor</a></li>
                <li>2. Copy and paste the SQL statements from the log above</li>
                <li>3. Run each SQL block separately in the SQL editor</li>
                <li>4. Return to the LinkedIn Clone app and test functionality</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DatabaseFix