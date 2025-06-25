import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// OAuth Authentication - Proper implementation
export const auth = {
  // OAuth Sign In with Google
  signInWithGoogle: async (redirectTo = null) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    return { data, error }
  },

  // OAuth Sign In with GitHub
  signInWithGitHub: async (redirectTo = null) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        scopes: 'user:email'
      }
    })
    return { data, error }
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Get current user
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Store OAuth tokens for API access
  storeOAuthTokens: () => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.provider_token) {
        window.localStorage.setItem('oauth_provider_token', session.provider_token)
      }

      if (session && session.provider_refresh_token) {
        window.localStorage.setItem('oauth_provider_refresh_token', session.provider_refresh_token)
      }

      if (event === 'SIGNED_OUT') {
        window.localStorage.removeItem('oauth_provider_token')
        window.localStorage.removeItem('oauth_provider_refresh_token')
      }
    })
  }
}

// Profile helpers
export const profiles = {
  get: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  update: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  create: async (profile) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single()
    return { data, error }
  }
}

// Posts helpers
export const posts = {
  getFeed: async (limit = 20, offset = 0) => {
    // Temporarily get posts without foreign key join until constraint is fixed
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Posts query error:', error);
      return { data: [], error };
    }

    // Manually get author data for each post
    if (data && data.length > 0) {
      const postsWithAuthors = await Promise.all(
        data.map(async (post) => {
          if (post.author_id) {
            const { data: author } = await supabase
              .from('profiles')
              .select('id, name, avatar_url, headline')
              .eq('id', post.author_id)
              .single();
            
            return { ...post, author };
          }
          return { ...post, author: null };
        })
      );
      
      return { data: postsWithAuthors, error: null };
    }

    return { data: data || [], error: null };
  },

  getByUser: async (userId, limit = 20, offset = 0) => {
    // Get posts by specific user
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('User posts query error:', error);
      return { data: [], error };
    }

    // Manually get author data for each post
    if (data && data.length > 0) {
      const postsWithAuthors = await Promise.all(
        data.map(async (post) => {
          if (post.author_id) {
            const { data: author } = await supabase
              .from('profiles')
              .select('id, name, avatar_url, headline')
              .eq('id', post.author_id)
              .single();
            
            return { ...post, author };
          }
          return { ...post, author: null };
        })
      );
      
      return { data: postsWithAuthors, error: null };
    }

    return { data: data || [], error: null };
  },

  update: async (postId, userId, updates) => {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .eq('author_id', userId) // Ensure user can only update their own posts
      .select('*')
      .single()

    if (error) {
      return { data: null, error }
    }

    // Manually get author data
    if (data && data.author_id) {
      const { data: author } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, headline')
        .eq('id', data.author_id)
        .single();
      
      return { data: { ...data, author }, error: null };
    }

    return { data: { ...data, author: null }, error: null };
  },

  delete: async (postId, userId) => {
    const { data, error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('author_id', userId) // Ensure user can only delete their own posts
    
    return { data, error };
  },

  create: async (post) => {
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select('*')
      .single()

    if (error) {
      return { data: null, error }
    }

    // Manually get author data
    if (data && data.author_id) {
      const { data: author } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, headline')
        .eq('id', data.author_id)
        .single();
      
      return { data: { ...data, author }, error: null };
    }

    return { data: { ...data, author: null }, error: null };
  },

  like: async (postId, userId) => {
    try {
      // Ensure auth user matches supplied userId
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user || user.id !== userId) {
        return { data: null, error: authError || { message: 'User not authenticated' } }
      }

      // Direct insert
      const { data, error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: userId })
        .select()

      return { data, error }
    } catch (err) {
      return { data: null, error: err }
    }
  },

  unlike: async (postId, userId) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user || user.id !== userId) {
        return { data: null, error: authError || { message: 'User not authenticated' } }
      }

      const { data, error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)

      return { data, error }
    } catch (err) {
      return { data: null, error: err }
    }
  },

  getLikes: async (postId, userId = null) => {
    let query = supabase
      .from('likes')
      .select('user_id')
      .eq('post_id', postId)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query
    return { data, error }
  },

  save: async (postId, userId) => {
    const { data, error } = await supabase
      .from('saved_posts')
      .insert({
        post_id: postId,
        user_id: userId
      })
      .select()
      .single()
    return { data, error }
  },

  unsave: async (postId, userId) => {
    const { data, error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
    return { data, error }
  },

  getSaved: async (userId, limit = 20) => {
    // Get saved posts
    const { data: savedData, error: savedError } = await supabase
      .from('saved_posts')
      .select('*, post_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (savedError) {
      return { data: [], error: savedError }
    }

    // Manually get post and author data for each saved post
    if (savedData && savedData.length > 0) {
      const savedWithPosts = await Promise.all(
        savedData.map(async (saved) => {
          if (saved.post_id) {
            // Get post data
            const { data: post } = await supabase
              .from('posts')
              .select('*')
              .eq('id', saved.post_id)
              .single();

            if (post && post.author_id) {
              // Get author data
              const { data: author } = await supabase
                .from('profiles')
                .select('id, name, avatar_url, headline')
                .eq('id', post.author_id)
                .single();
              
              return { 
                ...saved, 
                post: { 
                  ...post, 
                  author 
                } 
              };
            }
            return { ...saved, post };
          }
          return { ...saved, post: null };
        })
      );
      
      return { data: savedWithPosts, error: null };
    }

    return { data: savedData || [], error: null };
  }
}

// Comments helpers
export const comments = {
  getByPost: async (postId) => {
    // Get comments and manually join with profiles since foreign keys may not exist
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (commentsError) {
      return { data: [], error: commentsError }
    }

    // Manually get author data for each comment
    if (commentsData && commentsData.length > 0) {
      const commentsWithAuthors = await Promise.all(
        commentsData.map(async (comment) => {
          if (comment.author_id) {
            const { data: author } = await supabase
              .from('profiles')
              .select('id, name, avatar_url, headline')
              .eq('id', comment.author_id)
              .single();
            
            return { ...comment, user: author };
          }
          return { ...comment, user: null };
        })
      );
      
      return { data: commentsWithAuthors, error: null };
    }

    return { data: commentsData || [], error: null };
  },

  create: async (comment) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return { data: null, error: authError || { message: 'User not authenticated' } }
      }

      const commentData = {
        post_id: comment.post_id,
        content: comment.content,
        author_id: user.id
      }

      const { data, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select('*')
        .single()

      if (error) return { data: null, error }

      // fetch author
      const { data: author } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, headline')
        .eq('id', user.id)
        .single()

      return { data: { ...data, user: author }, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  },

  delete: async (commentId, userId) => {
    const { data, error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('author_id', userId) // Use author_id instead of user_id
    return { data, error }
  }
}

// Jobs helpers
export const jobs = {
  search: async (query = '', location = '', jobType = '', limit = 20) => {
    let queryBuilder = supabase
      .from('jobs')
      .select(`
        *,
        company:companies!jobs_company_id_fkey (
          id, 
          name, 
          logo_url
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    }
    if (location) {
      queryBuilder = queryBuilder.ilike('location', `%${location}%`)
    }
    if (jobType && jobType !== 'all') {
      queryBuilder = queryBuilder.eq('job_type', jobType)
    }

    const { data, error } = await queryBuilder
    return { data, error }
  },

  apply: async (jobId, userId, resumeUrl) => {
    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        job_id: jobId,
        applicant_id: userId,
        resume_url: resumeUrl,
        status: 'pending'
      })
      .select()
      .single()
    return { data, error }
  }
}

// Messages helpers
export const messages = {
  getConversations: async (userId) => {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_1:profiles!conversations_participant_1_id_fkey (
          id, name, avatar_url, headline
        ),
        participant_2:profiles!conversations_participant_2_id_fkey (
          id, name, avatar_url, headline
        )
      `)
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
      .order('updated_at', { ascending: false })
    return { data, error }
  },

  getMessages: async (conversationId) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey (
          id, name, avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
    return { data, error }
  },

  send: async (conversationId, senderId, content) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey (
          id, name, avatar_url
        )
      `)
      .single()
    return { data, error }
  }
}

// Notifications helpers
export const notifications = {
  get: async (userId, limit = 20) => {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:profiles!notifications_sender_id_fkey (
          id, name, avatar_url
        )
      `)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  markAsRead: async (notificationId) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
    return { data, error }
  }
}

// Network/Connections helpers
export const connections = {
  getConnections: async (userId) => {
    const { data, error } = await supabase
      .from('connections')
      .select(`
        *,
        requester:profiles!connections_requester_id_fkey (id, name, avatar_url, headline),
        receiver:profiles!connections_receiver_id_fkey (id, name, avatar_url, headline)
      `)
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getSuggestions: async (userId, limit = 10) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, headline')
      .neq('id', userId)
      .limit(limit)
    return { data, error }
  },

  sendRequest: async (requesterId, receiverId) => {
    const { data, error } = await supabase
      .from('connections')
      .insert({
        requester_id: requesterId,
        receiver_id: receiverId,
        status: 'pending'
      })
      .select()
      .single()
    return { data, error }
  },

  acceptRequest: async (connectionId) => {
    const { data, error } = await supabase
      .from('connections')
      .update({ status: 'accepted' })
      .eq('id', connectionId)
      .select()
      .single()
    return { data, error }
  },

  removeConnection: async (connectionId) => {
    const { data, error } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId)
    return { data, error }
  }
}

// Communities helpers
export const communities = {
  getJoined: async (userId) => {
    const { data, error } = await supabase
      .from('community_members')
      .select(`
        *,
        community:communities!community_members_community_id_fkey (
          id, name, description, member_count, created_at
        )
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })
    return { data, error }
  },

  getSuggested: async (limit = 10) => {
    const { data, error } = await supabase
      .from('communities')
      .select('id, name, description, member_count')
      .eq('is_active', true)
      .order('member_count', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  create: async (community, userId) => {
    // Convert rules string to array if it's a string
    let rulesArray = []
    if (community.rules) {
      if (typeof community.rules === 'string') {
        // Split by newlines or semicolons and filter out empty strings
        rulesArray = community.rules
          .split(/[\n;]/)
          .map(rule => rule.trim())
          .filter(rule => rule.length > 0)
      } else if (Array.isArray(community.rules)) {
        rulesArray = community.rules
      }
    }

    const { data, error } = await supabase
      .from('communities')
      .insert({
        name: community.name,
        description: community.description,
        category: community.category,
        rules: rulesArray, // Send as proper array
        is_active: community.is_active || true,
        admin_id: userId
      })
      .select()
      .single()
    return { data, error }
  },

  join: async (communityId, userId) => {
    const { data, error } = await supabase
      .from('community_members')
      .insert({
        community_id: communityId,
        user_id: userId
      })
      .select()
      .single()
    return { data, error }
  }
}

// Companies/Pages helpers - NEW: Real database integration
export const companies = {
  getFollowed: async (userId) => {
    // Get companies that the user follows
    const { data, error } = await supabase
      .from('company_followers')
      .select(`
        *,
        company:companies!company_followers_company_id_fkey (
          id, name, industry, logo_url, follower_count, 
          description, website, location
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  getSuggested: async (limit = 10) => {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, industry, logo_url, follower_count, description')
      .order('follower_count', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  create: async (company, userId) => {
    const { data, error } = await supabase
      .from('companies')
      .insert({
        ...company,
        created_by: userId
      })
      .select()
      .single()
    return { data, error }
  },

  follow: async (companyId, userId) => {
    const { data, error } = await supabase
      .from('company_followers')
      .insert({
        company_id: companyId,
        user_id: userId
      })
      .select()
      .single()
    return { data, error }
  },

  unfollow: async (companyId, userId) => {
    const { data, error } = await supabase
      .from('company_followers')
      .delete()
      .eq('company_id', companyId)
      .eq('user_id', userId)
    return { data, error }
  },

  search: async (query = '', category = '', limit = 20) => {
    let queryBuilder = supabase
      .from('companies')
      .select('id, name, industry, logo_url, follower_count, description, website, location')
      .order('follower_count', { ascending: false })
      .limit(limit)

    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    }
    if (category && category !== 'all') {
      queryBuilder = queryBuilder.eq('industry', category)
    }

    const { data, error } = await queryBuilder
    return { data, error }
  }
}

// Workspace helpers  
export const workspace = {
  getTopics: async (userId) => {
    const { data, error } = await supabase
      .from('workspace_topics')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    return { data, error }
  },

  createTopic: async (topic, userId) => {
    const { data, error } = await supabase
      .from('workspace_topics')
      .insert({
        ...topic,
        user_id: userId
      })
      .select()
      .single()
    return { data, error }
  },

  getTasks: async (userId) => {
    const { data, error } = await supabase
      .from('workspace_tasks')
      .select(`
        *,
        topic:workspace_topics!workspace_tasks_topic_id_fkey (
          id, title
        )
      `)
      .eq('user_id', userId)
      .order('due_date', { ascending: true })
    return { data, error }
  },

  createTask: async (task, userId) => {
    const { data, error } = await supabase
      .from('workspace_tasks')
      .insert({
        ...task,
        user_id: userId
      })
      .select()
      .single()
    return { data, error }
  },

  updateTask: async (taskId, updates) => {
    const { data, error } = await supabase
      .from('workspace_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single()
    return { data, error }
  },

  getMaterials: async (topicId) => {
    const { data, error } = await supabase
      .from('workspace_materials')
      .select('*')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createMaterial: async (material) => {
    const { data, error } = await supabase
      .from('workspace_materials')
      .insert(material)
      .select()
      .single()
    return { data, error }
  }
}

// Real-time subscriptions with error handling
export const realtime = {
  subscribeToUserNotifications: (userId, callback) => {
    try {
      return supabase
        .channel('user-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${userId}`
          },
          callback
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Subscribed to notifications')
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('⚠️ Notification subscription error')
          }
        })
    } catch (error) {
      console.warn('⚠️ Realtime notifications disabled:', error.message)
      return { unsubscribe: () => {} }
    }
  },

  subscribeToConversation: (conversationId, callback) => {
    try {
      return supabase
        .channel(`conversation-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          callback
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Subscribed to conversation')
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('⚠️ Conversation subscription error')
          }
        })
    } catch (error) {
      console.warn('⚠️ Realtime messaging disabled:', error.message)
      return { unsubscribe: () => {} }
    }
  },

  subscribeToFeed: (callback) => {
    try {
      return supabase
        .channel('feed-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'posts'
          },
          callback
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Subscribed to feed updates')
          } else if (status === 'CHANNEL_ERROR') {
            console.warn('⚠️ Feed subscription error')
          }
        })
    } catch (error) {
      console.warn('⚠️ Realtime feed disabled:', error.message)
      return { unsubscribe: () => {} }
    }
  }
}

// Storage helpers
export const storage = {
  uploadFile: async (bucket, path, file) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })
    return { data, error }
  },

  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return data.publicUrl
  },

  deleteFile: async (bucket, path) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path])
    return { data, error }
  }
}

// Experience helpers
export const experiences = {
  getByUser: async (userId) => {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('profile_id', userId)
      .order('start_date', { ascending: false })
    return { data, error }
  },

  create: async (experience) => {
    const { data, error } = await supabase
      .from('experiences')
      .insert(experience)
      .select('*')
      .single()
    return { data, error }
  },

  update: async (experienceId, userId, updates) => {
    const { data, error } = await supabase
      .from('experiences')
      .update(updates)
      .eq('id', experienceId)
      .eq('profile_id', userId)
      .select('*')
      .single()
    return { data, error }
  },

  delete: async (experienceId, userId) => {
    const { data, error } = await supabase
      .from('experiences')
      .delete()
      .eq('id', experienceId)
      .eq('profile_id', userId)
    return { data, error }
  }
}

// Education helpers
export const education = {
  getByUser: async (userId) => {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .eq('profile_id', userId)
      .order('start_date', { ascending: false })
    return { data, error }
  },

  create: async (educationItem) => {
    const { data, error } = await supabase
      .from('education')
      .insert(educationItem)
      .select('*')
      .single()
    return { data, error }
  },

  update: async (educationId, userId, updates) => {
    const { data, error } = await supabase
      .from('education')
      .update(updates)
      .eq('id', educationId)
      .eq('profile_id', userId)
      .select('*')
      .single()
    return { data, error }
  },

  delete: async (educationId, userId) => {
    const { data, error } = await supabase
      .from('education')
      .delete()
      .eq('id', educationId)
      .eq('profile_id', userId)
    return { data, error }
  }
}

// Skills helpers
export const skills = {
  getByUser: async (userId) => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('profile_id', userId)
      .order('endorsements_count', { ascending: false })
    return { data, error }
  },

  create: async (skill) => {
    const { data, error } = await supabase
      .from('skills')
      .insert(skill)
      .select('*')
      .single()
    return { data, error }
  },

  update: async (skillId, userId, updates) => {
    const { data, error } = await supabase
      .from('skills')
      .update(updates)
      .eq('id', skillId)
      .eq('profile_id', userId)
      .select('*')
      .single()
    return { data, error }
  },

  delete: async (skillId, userId) => {
    const { data, error } = await supabase
      .from('skills')
      .delete()
      .eq('id', skillId)
      .eq('profile_id', userId)
    return { data, error }
  }
}

// Initialize OAuth token storage
auth.storeOAuthTokens()

export default supabase