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
  }
})

export const auth = supabase.auth
export const storage = supabase.storage
export const realtime = supabase.realtime


export const posts = {
  async getFeed(limit = 20) {
    try {
      // Get the current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles(*),
          likes_count,
          comments_count,
          shares_count
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      const { data: posts, error } = await query;
      
      if (error) {
        return { data: null, error };
      }

      if (!posts) {
        return { data: [], error: null };
      }

      // If user is authenticated, check which posts they've liked
      if (user) {
        const { data: userLikes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id);

        const likedPostIds = new Set(userLikes?.map(like => like.post_id) || []);

        const postsWithLikeStatus = posts.map(post => ({
          ...post,
          user_liked: likedPostIds.has(post.id)
        }));

        return { data: postsWithLikeStatus, error: null };
      }

      // For non-authenticated users, set user_liked to false
      const postsWithLikeStatus = posts.map(post => ({
        ...post,
        user_liked: false
      }));

      return { data: postsWithLikeStatus, error: null };
    } catch (err) {
      console.error('Get feed exception:', err);
      return { data: null, error: err };
    }
  },
  async create(postData) {
    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single()
    return { data, error }
  },
  async getByUser(userId, limit) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit || 50)
    return { data, error }
  },
  async getSaved(userId) {
    const { data, error } = await supabase
      .from('saved_posts')
      .select('*, post:posts(*, author:profiles(*))')
      .eq('user_id', userId)
    return { data, error }
  },
  async like(postId) {
    try {
      console.log('👍 Attempting to like post:', { postId });
      
      // Use current authenticated user for security
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }
      
      const { data, error } = await supabase
        .from('likes')
        .insert({ post_id: postId, user_id: user.id })
        .select();
        
      console.log('Like result:', { data, error });
      return { data, error };
    } catch (err) {
      console.error('Like exception:', err);
      return { data: null, error: err };
    }
  },
  async unlike(postId) {
    try {
      console.log('👎 Attempting to unlike post:', { postId });
      
      // Use current authenticated user for security
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }
      
      const { data, error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
        
      console.log('Unlike result:', { data, error });
      return { data, error };
    } catch (err) {
      console.error('Unlike exception:', err);
      return { data: null, error: err };
    }
  },
  async update(postId, userId, updates) {
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', postId)
      .eq('author_id', userId)
      .select()
      .single()
    return { data, error }
  },
  async delete(postId, userId) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('author_id', userId)
    return { error }
  },
  async unsave(postId, userId) {
    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
    return { error }
  }
}


export const jobs = {
  async search(filters = {}) {
    let query = supabase
      .from('jobs')
      .select('*, company:companies(*)')
      .eq('is_active', true)
    
    if (filters.title) {
      query = query.ilike('title', `%${filters.title}%`)
    }
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`)
    }
    if (filters.job_type) {
      query = query.eq('job_type', filters.job_type)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    return { data, error }
  },
  async apply(jobId, userId, resumeUrl) {
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

export const comments = {
  async create(comment) {
    try {
      console.log('💬 Creating comment:', comment);
      
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }
      
      // Ensure author_id matches authenticated user
      const commentData = {
        ...comment,
        author_id: user.id
      };
      
      const { data, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select(`
          *,
          profiles!comments_author_id_fkey (
            id,
            name,
            avatar_url,
            headline
          )
        `)
        .single();

      console.log('Comment result:', { data, error });
      
      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Comment exception:', err);
      return { data: null, error: err };
    }
  },
  
  async getByPost(postId) {
    try {
      // First, get all comments for the post
      const { data: allComments, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_author_id_fkey (
            id,
            name,
            avatar_url,
            headline
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (error) {
        return { data: null, error };
      }

      if (!allComments) {
        return { data: [], error: null };
      }

      // Organize comments into threaded structure
      const topLevelComments = [];
      const repliesMap = new Map();

      // First pass: separate top-level comments and replies
      allComments.forEach(comment => {
        if (!comment.parent_id) {
          // Top-level comment
          topLevelComments.push({
            ...comment,
            replies: []
          });
        } else {
          // Reply to another comment
          if (!repliesMap.has(comment.parent_id)) {
            repliesMap.set(comment.parent_id, []);
          }
          repliesMap.get(comment.parent_id).push(comment);
        }
      });

      // Second pass: attach replies to their parent comments
      const organizeReplies = (comments) => {
        return comments.map(comment => {
          const replies = repliesMap.get(comment.id) || [];
          return {
            ...comment,
            replies: organizeReplies(replies) // Recursive for nested replies
          };
        });
      };

      const organizedComments = organizeReplies(topLevelComments);
      
      return { data: organizedComments, error: null };
    } catch (err) {
      console.error('Error fetching comments:', err);
      return { data: null, error: err };
    }
  },

  async update(commentId, updates) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const { data, error } = await supabase
        .from('comments')
        .update(updates)
        .eq('id', commentId)
        .eq('author_id', user.id)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      console.error('Error updating comment:', err);
      return { data: null, error: err };
    }
  },

  async delete(commentId) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return { error: { message: 'User not authenticated' } };
      }

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', user.id);

      return { error };
    } catch (err) {
      console.error('Error deleting comment:', err);
      return { error: err };
    }
  }
}

export const profiles = supabase.from('profiles')
export const companies = supabase.from('companies')
export const connections = supabase.from('connections')
export const messages = supabase.from('messages')
export const conversations = supabase.from('conversations')
export const notifications = supabase.from('notifications')
export const communities = supabase.from('communities')
export const experiences = supabase.from('experiences')
export const education = supabase.from('education')
export const skills = supabase.from('skills')

export default supabase
