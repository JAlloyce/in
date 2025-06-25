-- ================================
-- ROW LEVEL SECURITY POLICIES
-- ================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_materials ENABLE ROW LEVEL SECURITY;

-- ================================
-- HELPER FUNCTIONS
-- ================================

-- Function to check if users are connected
CREATE OR REPLACE FUNCTION are_users_connected(user1 UUID, user2 UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM connections 
    WHERE ((requester_id = user1 AND receiver_id = user2) OR 
           (requester_id = user2 AND receiver_id = user1))
    AND status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is in conversation
CREATE OR REPLACE FUNCTION user_in_conversation(conversation_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = conversation_id 
    AND user_id = ANY(participants)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check community membership
CREATE OR REPLACE FUNCTION is_community_member(community_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM community_members 
    WHERE community_id = community_id 
    AND user_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- PROFILES POLICIES
-- ================================

-- Profiles: Anyone can view public profiles, users can view connected profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (handled by trigger)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ================================
-- PROFESSIONAL DATA POLICIES
-- ================================

-- Experiences: Users can manage their own, others can view if connected
CREATE POLICY "Users can view experiences" ON experiences
  FOR SELECT USING (
    profile_id = auth.uid() OR 
    are_users_connected(auth.uid(), profile_id)
  );

CREATE POLICY "Users can manage own experiences" ON experiences
  FOR ALL USING (profile_id = auth.uid());

-- Education: Same as experiences
CREATE POLICY "Users can view education" ON education
  FOR SELECT USING (
    profile_id = auth.uid() OR 
    are_users_connected(auth.uid(), profile_id)
  );

CREATE POLICY "Users can manage own education" ON education
  FOR ALL USING (profile_id = auth.uid());

-- Skills: Same as experiences
CREATE POLICY "Users can view skills" ON skills
  FOR SELECT USING (
    profile_id = auth.uid() OR 
    are_users_connected(auth.uid(), profile_id)
  );

CREATE POLICY "Users can manage own skills" ON skills
  FOR ALL USING (profile_id = auth.uid());

-- ================================
-- COMPANIES & JOBS POLICIES
-- ================================

-- Companies: Public read, authenticated users can create
CREATE POLICY "Companies are publicly viewable" ON companies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create companies" ON companies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Company creators can update" ON companies
  FOR UPDATE USING (true); -- TODO: Add company admin logic

-- Jobs: Public read, company admins can manage
CREATE POLICY "Jobs are publicly viewable" ON jobs
  FOR SELECT USING (status = 'active');

CREATE POLICY "Job posters can manage jobs" ON jobs
  FOR ALL USING (posted_by = auth.uid());

-- Job Applications: Only applicant and job poster can view
CREATE POLICY "Job applications privacy" ON job_applications
  FOR SELECT USING (
    applicant_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE id = job_id AND posted_by = auth.uid()
    )
  );

CREATE POLICY "Users can apply for jobs" ON job_applications
  FOR INSERT WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "Applicants can update own applications" ON job_applications
  FOR UPDATE USING (applicant_id = auth.uid());

-- ================================
-- POSTS & SOCIAL FEATURES POLICIES
-- ================================

-- Posts: Users can see posts from connections and public posts
CREATE POLICY "Posts visibility" ON posts
  FOR SELECT USING (
    author_id = auth.uid() OR
    are_users_connected(auth.uid(), author_id) OR
    post_type = 'community' AND EXISTS (
      SELECT 1 FROM community_members cm
      JOIN communities c ON c.id = cm.community_id
      WHERE c.id = source_id 
      AND cm.user_id = auth.uid()
      AND c.privacy = 'public'
    )
  );

-- Users can create their own posts
CREATE POLICY "Users can create posts" ON posts
  FOR INSERT WITH CHECK (author_id = auth.uid());

-- Users can update/delete their own posts
CREATE POLICY "Users can manage own posts" ON posts
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (author_id = auth.uid());

-- Likes: Users can like posts they can see
CREATE POLICY "Users can like visible posts" ON likes
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE id = post_id AND (
        author_id = auth.uid() OR
        are_users_connected(auth.uid(), author_id)
      )
    )
  );

-- Users can view likes on posts they can see
CREATE POLICY "Users can view likes on visible posts" ON likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE id = post_id AND (
        author_id = auth.uid() OR
        are_users_connected(auth.uid(), author_id)
      )
    )
  );

-- Users can remove their own likes
CREATE POLICY "Users can remove own likes" ON likes
  FOR DELETE USING (user_id = auth.uid());

-- Comments: Similar to likes
CREATE POLICY "Users can comment on visible posts" ON comments
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE id = post_id AND (
        author_id = auth.uid() OR
        are_users_connected(auth.uid(), posts.author_id)
      )
    )
  );

CREATE POLICY "Users can view comments on visible posts" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE id = post_id AND (
        author_id = auth.uid() OR
        are_users_connected(auth.uid(), posts.author_id)
      )
    )
  );

CREATE POLICY "Users can manage own comments" ON comments
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (author_id = auth.uid());

-- Shares: Similar to likes and comments
CREATE POLICY "Users can share visible posts" ON shares
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE id = post_id AND (
        author_id = auth.uid() OR
        are_users_connected(auth.uid(), author_id)
      )
    )
  );

CREATE POLICY "Users can view shares on visible posts" ON shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE id = post_id AND (
        author_id = auth.uid() OR
        are_users_connected(auth.uid(), posts.author_id)
      )
    )
  );

CREATE POLICY "Users can remove own shares" ON shares
  FOR DELETE USING (user_id = auth.uid());

-- ================================
-- CONNECTIONS POLICIES
-- ================================

-- Users can view connections involving them
CREATE POLICY "Users can view own connections" ON connections
  FOR SELECT USING (
    requester_id = auth.uid() OR receiver_id = auth.uid()
  );

-- Users can create connection requests
CREATE POLICY "Users can send connection requests" ON connections
  FOR INSERT WITH CHECK (requester_id = auth.uid());

-- Users can update connections they're involved in
CREATE POLICY "Users can update own connections" ON connections
  FOR UPDATE USING (
    requester_id = auth.uid() OR receiver_id = auth.uid()
  );

-- Users can delete connections they're involved in
CREATE POLICY "Users can delete own connections" ON connections
  FOR DELETE USING (
    requester_id = auth.uid() OR receiver_id = auth.uid()
  );

-- ================================
-- MESSAGING POLICIES
-- ================================

-- Users can only see conversations they're part of
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = ANY(participants));

-- Users can create conversations
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = ANY(participants));

-- Users can view messages in their conversations
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    user_in_conversation(conversation_id, auth.uid())
  );

-- Users can send messages to their conversations
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    user_in_conversation(conversation_id, auth.uid())
  );

-- ================================
-- COMMUNITIES POLICIES
-- ================================

-- Public communities are viewable by everyone
CREATE POLICY "Public communities viewable" ON communities
  FOR SELECT USING (
    privacy = 'public' OR
    is_community_member(id, auth.uid()) OR
    admin_id = auth.uid()
  );

-- Authenticated users can create communities
CREATE POLICY "Users can create communities" ON communities
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND admin_id = auth.uid()
  );

-- Community admins can update
CREATE POLICY "Community admins can update" ON communities
  FOR UPDATE USING (admin_id = auth.uid());

-- Community members visibility
CREATE POLICY "Community members visibility" ON community_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = community_id
      AND (c.privacy = 'public' OR is_community_member(c.id, auth.uid()))
    )
  );

-- Users can join/leave communities
CREATE POLICY "Users can join communities" ON community_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave communities" ON community_members
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM communities 
      WHERE id = community_id AND admin_id = auth.uid()
    )
  );

-- ================================
-- NOTIFICATIONS POLICIES
-- ================================

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (recipient_id = auth.uid());

-- System can create notifications (handled by functions)
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (recipient_id = auth.uid());

-- Notification preferences: Users manage their own
CREATE POLICY "Users can manage own notification preferences" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- ================================
-- WORKSPACE POLICIES
-- ================================

-- Users can manage their own workspace content
CREATE POLICY "Users can manage own workspace topics" ON workspace_topics
  FOR ALL USING (user_id = auth.uid());

-- Public topics are viewable if marked public
CREATE POLICY "Public workspace topics viewable" ON workspace_topics
  FOR SELECT USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can manage own workspace tasks" ON workspace_tasks
  FOR ALL USING (user_id = auth.uid());

-- Workspace materials follow topic permissions
CREATE POLICY "Users can manage workspace materials" ON workspace_materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workspace_topics 
      WHERE id = topic_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view workspace materials" ON workspace_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_topics 
      WHERE id = topic_id AND (user_id = auth.uid() OR is_public = true)
    )
  );

-- ================================
-- ADDITIONAL SECURITY FUNCTIONS
-- ================================

-- Function to check if user can access post (used in API)
CREATE OR REPLACE FUNCTION can_user_access_post(post_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  post_record posts%ROWTYPE;
BEGIN
  SELECT * INTO post_record FROM posts WHERE id = post_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Post author can always access
  IF post_record.author_id = user_id THEN
    RETURN TRUE;
  END IF;
  
  -- Check if users are connected
  IF are_users_connected(user_id, post_record.author_id) THEN
    RETURN TRUE;
  END IF;
  
  -- Check community posts
  IF post_record.post_type = 'community' THEN
    RETURN is_community_member(post_record.source_id, user_id);
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user feed (performance optimized)
CREATE OR REPLACE FUNCTION get_user_feed(user_id UUID, page_limit INTEGER DEFAULT 20, page_offset INTEGER DEFAULT 0)
RETURNS TABLE (
  post_id UUID,
  author_id UUID,
  author_name TEXT,
  author_avatar TEXT,
  content TEXT,
  media_urls TEXT[],
  post_type post_type,
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER,
  created_at TIMESTAMPTZ,
  user_liked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.author_id,
    pr.name,
    pr.avatar_url,
    p.content,
    p.media_urls,
    p.post_type,
    p.likes_count,
    p.comments_count,
    p.shares_count,
    p.created_at,
    EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = user_id) as user_liked
  FROM posts p
  JOIN profiles pr ON pr.id = p.author_id
  WHERE (
    p.author_id = user_id OR
    are_users_connected(user_id, p.author_id) OR
    (p.post_type = 'community' AND is_community_member(p.source_id, user_id))
  )
  ORDER BY p.created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;