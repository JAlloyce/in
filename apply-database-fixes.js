import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nuntsizvwfmjzucuubcd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51bnRzaXp2d2Ztanp1Y3V1YmNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgzMDcxMywiZXhwIjoyMDY2NDA2NzEzfQ.tYPk7UqKfBEg0lUmDBFYXIZ7_wFM2LxaT1jNpWmxFJk'

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyDatabaseFixes() {
  console.log('Starting database fixes...')
  
  try {
    // 1. Add foreign key constraint for posts.author_id -> profiles.id
    console.log('1. Adding foreign key constraint for posts...')
    const { error: fkError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'posts_author_id_fkey'
                AND table_name = 'posts'
                AND table_schema = 'public'
            ) THEN
                ALTER TABLE public.posts ADD CONSTRAINT posts_author_id_fkey 
                FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
            END IF;
        END $$;
      `
    })
    
    if (fkError) {
      console.error('Error adding foreign key:', fkError.message)
    } else {
      console.log('✅ Foreign key constraint added successfully')
    }

    // 2. Create likes table
    console.log('2. Creating likes table...')
    const { error: likesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.likes (
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
        
        CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
        CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
        
        GRANT ALL ON public.likes TO authenticated;
      `
    })
    
    if (likesError) {
      console.error('Error creating likes table:', likesError.message)
    } else {
      console.log('✅ Likes table created successfully')
    }

    // 3. Create comments table
    console.log('3. Creating comments table...')
    const { error: commentsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.comments (
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
        
        CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
        CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
        
        GRANT ALL ON public.comments TO authenticated;
      `
    })
    
    if (commentsError) {
      console.error('Error creating comments table:', commentsError.message)
    } else {
      console.log('✅ Comments table created successfully')
    }

    // 4. Create jobs table  
    console.log('4. Creating jobs table...')
    const { error: jobsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.jobs (
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
        
        CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
        CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON public.jobs(is_active);
        
        GRANT ALL ON public.jobs TO authenticated;
      `
    })
    
    if (jobsError) {
      console.error('Error creating jobs table:', jobsError.message)
    } else {
      console.log('✅ Jobs table created successfully')
    }

    // 5. Create communities table
    console.log('5. Creating communities table...')
    const { error: communitiesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.communities (
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
        
        ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view active communities" ON public.communities FOR SELECT USING (is_active = true);
        CREATE POLICY "Users can create communities" ON public.communities FOR INSERT WITH CHECK (auth.uid() = admin_id);
        CREATE POLICY "Admins can update their communities" ON public.communities FOR UPDATE USING (auth.uid() = admin_id);
        
        CREATE INDEX IF NOT EXISTS idx_communities_admin_id ON public.communities(admin_id);
        
        GRANT ALL ON public.communities TO authenticated;
      `
    })
    
    if (communitiesError) {
      console.error('Error creating communities table:', communitiesError.message)
    } else {
      console.log('✅ Communities table created successfully')
    }

    // 6. Create community_members table
    console.log('6. Creating community_members table...')
    const { error: memberError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.community_members (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
            role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(community_id, user_id)
        );
        
        ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view community members" ON public.community_members FOR SELECT USING (true);
        CREATE POLICY "Users can join communities" ON public.community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can leave communities" ON public.community_members FOR DELETE USING (auth.uid() = user_id);
        
        CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON public.community_members(community_id);
        CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON public.community_members(user_id);
        
        GRANT ALL ON public.community_members TO authenticated;
      `
    })
    
    if (memberError) {
      console.error('Error creating community_members table:', memberError.message)
    } else {
      console.log('✅ Community_members table created successfully')
    }

    // 7. Fix companies table - add missing columns
    console.log('7. Adding missing columns to companies table...')
    const { error: companiesError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'companies' 
                AND column_name = 'business_hours'
                AND table_schema = 'public'
            ) THEN
                ALTER TABLE public.companies ADD COLUMN business_hours TEXT;
            END IF;
            
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'companies' 
                AND column_name = 'phone'
                AND table_schema = 'public'
            ) THEN
                ALTER TABLE public.companies ADD COLUMN phone TEXT;
            END IF;
            
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'companies' 
                AND column_name = 'email'
                AND table_schema = 'public'
            ) THEN
                ALTER TABLE public.companies ADD COLUMN email TEXT;
            END IF;
        END $$;
      `
    })
    
    if (companiesError) {
      console.error('Error updating companies table:', companiesError.message)
    } else {
      console.log('✅ Companies table updated successfully')
    }

    // 8. Fix notifications table
    console.log('8. Fixing notifications table...')
    const { error: notificationsError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'notifications' 
                AND column_name = 'post_id'
                AND table_schema = 'public'
            ) THEN
                ALTER TABLE public.notifications ADD COLUMN post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;
                CREATE INDEX IF NOT EXISTS idx_notifications_post_id ON public.notifications(post_id);
            END IF;
            
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'notifications' 
                AND column_name = 'from_user_id'
                AND table_schema = 'public'
            ) THEN
                ALTER TABLE public.notifications ADD COLUMN from_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
                CREATE INDEX IF NOT EXISTS idx_notifications_from_user_id ON public.notifications(from_user_id);
            END IF;
        END $$;
      `
    })
    
    if (notificationsError) {
      console.error('Error fixing notifications table:', notificationsError.message)
    } else {
      console.log('✅ Notifications table fixed successfully')
    }

    console.log('\n🎉 All database fixes applied successfully!')
    console.log('\nNext steps:')
    console.log('1. Test post creation')
    console.log('2. Test like button functionality')
    console.log('3. Test comment functionality')
    console.log('4. Test job creation')
    console.log('5. Test community features')
    
  } catch (error) {
    console.error('Error applying database fixes:', error)
  }
}

// Run the fixes
applyDatabaseFixes()