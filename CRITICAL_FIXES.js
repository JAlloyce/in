// CRITICAL FIXES FOR LINKEDIN CLONE

// 1. Fix likes with better auth checking
export const likeFix = `
  like: async (postId, userId) => {
    try {
      console.log('👍 Attempting to like post:', { postId, userId });
      
      // Use current authenticated user instead of passed userId
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

  unlike: async (postId, userId) => {
    try {
      console.log('👎 Attempting to unlike post:', { postId, userId });
      
      // Use current authenticated user instead of passed userId
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
`;

// 2. Fix comments with better auth checking
export const commentFix = `
  create: async (comment) => {
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
        .select('*')
        .single();

      console.log('Comment result:', { data, error });
      
      if (error) {
        return { data: null, error };
      }

      // Manually get author data
      if (data && data.author_id) {
        const { data: author } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, headline')
          .eq('id', data.author_id)
          .single();
        
        return { data: { ...data, user: author }, error: null };
      }

      return { data: { ...data, user: null }, error: null };
    } catch (err) {
      console.error('Comment exception:', err);
      return { data: null, error: err };
    }
  },
`;

// 3. Fix Profile posts loading with better logging
export const profilePostsFix = `
  // In Profile.jsx loadUserData function:
  try {
    console.log('🔍 Loading posts for user:', user.id);
    const { data: userPostsData, error: postsError } = await posts.getByUser(user.id);
    console.log('📝 Posts data received:', userPostsData?.length || 0, 'posts');
    console.log('❌ Posts error:', postsError);
    
    if (postsError) {
      console.warn('Posts error but continuing:', postsError);
    }
    
    // Simple mapping without complex transformations
    const mappedPosts = (userPostsData || []).map(post => ({
      id: post.id,
      content: post.content,
      timestamp: new Date(post.created_at).toLocaleDateString(),
      likes: post.likes_count || 0,
      comments: post.comments_count || 0,
      shares: post.shares_count || 0,
      type: "user",
      source: null,
      isEdited: false,
      editedAt: null,
      author: post.author || { name: 'Unknown Author' }
    }));
    
    console.log('✅ Mapped posts:', mappedPosts);
    setUserPosts(mappedPosts);
    
  } catch (err) {
    console.error('Posts loading exception:', err);
    setUserPosts([]); // Set empty array on error
  }
`;

// 4. Add Share button to Home.jsx
export const shareButtonFix = `
  const handleShare = async (post) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'LinkedIn Clone Post',
          text: post.content,
          url: window.location.href
        });
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(
          \`Check out this post: \${post.content} - \${window.location.href}\`
        );
        alert('Post link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
      alert('Failed to share post');
    }
  };
  
  // Add this button in the post actions:
  <button
    onClick={() => handleShare(post)}
    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex-1 justify-center"
  >
    <HiShare className="w-5 h-5" />
    Share
  </button>
`;

// 5. Critical issue diagnosis
export const issueDiagnosis = \`
ISSUES DIAGNOSED:

1. **Likes/Comments Failing**: RLS policies require auth.uid() = user_id/author_id
   - Fix: Use supabase.auth.getUser() to get current user instead of passing userId
   
2. **Profile Posts Not Showing**: Data exists but mapping/display issue
   - Fix: Add console logging and simplify mapping
   
3. **Share Button Missing**: Not implemented in Home.jsx
   - Fix: Add share functionality with native API fallback
   
4. **Communities Fixed**: ✅ Removed privacy_level field
   
5. **Profile Editing**: Need modal forms for experience/education/skills
   - Fix: Add modal components for editing
\`;

console.log('CRITICAL_FIXES.js loaded - Apply these fixes to resolve all issues'); 