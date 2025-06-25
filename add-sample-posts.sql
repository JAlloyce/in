-- Add sample posts to your database for testing
-- Run this in your Supabase SQL Editor

-- First, get your user ID (you'll see this in the console output)
-- Replace the user ID below with your actual user ID from the auth debug component

DO $$
DECLARE
    user_uuid UUID;
    post_count INTEGER;
BEGIN
    -- Get your authenticated user ID (should be your OAuth user)
    SELECT id INTO user_uuid FROM public.profiles WHERE name LIKE '%Joab%' OR name LIKE '%Alloyce%' LIMIT 1;
    
    IF user_uuid IS NULL THEN
        -- If no specific user found, get the first user
        SELECT id INTO user_uuid FROM public.profiles LIMIT 1;
    END IF;
    
    IF user_uuid IS NOT NULL THEN
        -- Check if user already has posts
        SELECT COUNT(*) INTO post_count FROM public.posts WHERE author_id = user_uuid;
        
        IF post_count = 0 THEN
            -- Insert sample posts for testing
            INSERT INTO public.posts (content, author_id, created_at) VALUES
            ('🚀 Excited to share that our OAuth authentication integration with Google is now working perfectly! The LinkedIn Clone project is coming together nicely. #OAuth #React #Supabase', user_uuid, NOW() - INTERVAL '2 hours'),
            ('Just finished setting up the complete database schema for our LinkedIn Clone. All tables are properly connected with foreign key relationships. The power of Supabase! 💪 #Database #PostgreSQL #Development', user_uuid, NOW() - INTERVAL '1 day'),
            ('Working on some exciting new features for the LinkedIn Clone project. Real-time messaging and notifications are next on the roadmap. Stay tuned! 📱 #SoftwareDevelopment #RealTime', user_uuid, NOW() - INTERVAL '3 days'),
            ('Big shoutout to the amazing developer community! The support and resources available for React, Vite, and Tailwind CSS make building modern web apps such a joy. 🙏 #WebDevelopment #Community', user_uuid, NOW() - INTERVAL '1 week'),
            ('Just deployed the latest version of our LinkedIn Clone to production. OAuth authentication, real database integration, and a beautiful UI - all working seamlessly! 🎉 #Deployment #FullStack', user_uuid, NOW() - INTERVAL '2 weeks');
            
            RAISE NOTICE 'Added 5 sample posts for user %', user_uuid;
        ELSE
            RAISE NOTICE 'User % already has % posts, skipping sample post creation', user_uuid, post_count;
        END IF;
    ELSE
        RAISE NOTICE 'No users found in profiles table';
    END IF;
END $$;

-- Show the posts that were created
SELECT 
    p.content,
    pr.name as author_name,
    p.created_at
FROM public.posts p
JOIN public.profiles pr ON p.author_id = pr.id
ORDER BY p.created_at DESC;