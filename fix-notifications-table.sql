-- Fix notifications table missing columns

-- Check if notifications table exists and add missing columns
DO $$ 
BEGIN
    -- Create notifications table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'notifications' 
        AND table_schema = 'public'
    ) THEN
        CREATE TABLE public.notifications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
            type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'job_application', 'message')),
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
            from_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
        );
        
        -- Enable RLS
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
        
        -- Create indexes
        CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
        CREATE INDEX idx_notifications_type ON public.notifications(type);
        CREATE INDEX idx_notifications_post_id ON public.notifications(post_id);
        CREATE INDEX idx_notifications_from_user_id ON public.notifications(from_user_id);
        
        -- Create updated_at trigger
        CREATE TRIGGER handle_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
        
    ELSE
        -- Add missing columns to existing table
        
        -- Add post_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'notifications' 
            AND column_name = 'post_id'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.notifications ADD COLUMN post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;
            CREATE INDEX IF NOT EXISTS idx_notifications_post_id ON public.notifications(post_id);
        END IF;
        
        -- Add from_user_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'notifications' 
            AND column_name = 'from_user_id'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.notifications ADD COLUMN from_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
            CREATE INDEX IF NOT EXISTS idx_notifications_from_user_id ON public.notifications(from_user_id);
        END IF;
        
        -- Add type column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'notifications' 
            AND column_name = 'type'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.notifications ADD COLUMN type TEXT CHECK (type IN ('like', 'comment', 'follow', 'mention', 'job_application', 'message'));
            CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
        END IF;
        
        -- Add title column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'notifications' 
            AND column_name = 'title'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.notifications ADD COLUMN title TEXT;
        END IF;
        
        -- Add message column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'notifications' 
            AND column_name = 'message'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.notifications ADD COLUMN message TEXT;
        END IF;
        
        -- Add is_read column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'notifications' 
            AND column_name = 'is_read'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
        END IF;
        
    END IF;
END $$;

-- Grant permissions
GRANT ALL ON public.notifications TO authenticated;

COMMIT;