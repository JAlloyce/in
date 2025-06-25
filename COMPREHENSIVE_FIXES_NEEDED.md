# COMPREHENSIVE FIXES NEEDED

## Current Issues Analysis

Based on the errors reported:

1. ✅ **Profile.jsx followers_count error** - FIXED
2. ✅ **Communities privacy_level error** - FIXED  
3. ❌ **Likes system 400 errors** - NEEDS FIX
4. ❌ **Comments system 400 errors** - NEEDS FIX
5. ❌ **Profile posts not showing** - NEEDS FIX
6. ❌ **Share button not functional** - NEEDS FIX
7. ❌ **Profile sections not editable** - NEEDS FIX

## Root Cause: RLS Authentication Issues

The 400 errors are caused by RLS policies that require `auth.uid() = user_id/author_id` but the Supabase client calls may not have proper authentication context.

## SPECIFIC FIXES NEEDED

### 1. Fix Share Button in Home.jsx

**Location:** Line 381-387 in `src/pages/Home.jsx`

**Current code:**
```jsx
<Button 
  variant="ghost"
  size="md"
  leftIcon={<HiShare className="icon-system-sm" />}
  className="justify-center text-gray-600"
>
  Share
</Button>
```

**Add this handler before the FeedPost component:**
```jsx
const handleShare = async (post) => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: 'LinkedIn Clone Post',
        text: post.content,
        url: window.location.href
      });
    } else {
      const shareText = `Check out this post: "${post.content}" - ${window.location.href}`;
      await navigator.clipboard.writeText(shareText);
      alert('Post link copied to clipboard!');
    }
  } catch (err) {
    console.error('Share failed:', err);
    const shareText = `Check out this post: "${post.content}" - ${window.location.href}`;
    prompt('Copy this link to share:', shareText);
  }
};
```

**Update button to:**
```jsx
<Button 
  variant="ghost"
  size="md"
  leftIcon={<HiShare className="icon-system-sm" />}
  className="justify-center text-gray-600"
  onClick={() => handleShare(post)}
>
  Share
</Button>
```

### 2. Fix Likes System in src/lib/supabase.js

**Location:** Lines 261-277

**Replace with:**
```javascript
like: async (postId, userId) => {
  try {
    // Get current authenticated user to ensure RLS compliance
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }
    
    const { data, error } = await supabase
      .from('likes')
      .insert({ post_id: postId, user_id: user.id })
      .select();
      
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
},

unlike: async (postId, userId) => {
  try {
    // Get current authenticated user to ensure RLS compliance
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: { message: 'User not authenticated' } };
    }
    
    const { data, error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);
      
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
},
```

### 3. Fix Comments System in src/lib/supabase.js

**Location:** Lines 390-415

**Replace the create function with:**
```javascript
create: async (comment) => {
  try {
    // Get current authenticated user to ensure RLS compliance
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
    return { data: null, error: err };
  }
},
```

### 4. Fix Profile Posts Display in src/pages/Profile.jsx

**Location:** Around line 185 in the loadUserData function

**Add debug logging and better error handling:**
```javascript
// Load user posts with debug logging
console.log('🔍 Loading posts for user:', user.id);
const { data: userPostsData, error: postsError } = await posts.getByUser(user.id);
console.log('📝 Posts data:', userPostsData?.length || 0, 'posts found');
console.log('❌ Posts error:', postsError);

if (postsError) {
  console.warn('Posts error but continuing:', postsError);
}

// Simple mapping for posts display
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
  author: post.author || { name: profileData?.name || 'Unknown Author' }
}));

console.log('✅ Setting user posts:', mappedPosts);
setUserPosts(mappedPosts);
```

### 5. Fix Experience/Education Mapping in Profile.jsx

**Location:** Around lines 216-235

**Fix the data mapping:**
```javascript
experience: experiencesData?.map(exp => ({
  id: exp.id,
  role: exp.title, // Database uses 'title' not 'role'
  company: exp.company,
  duration: `${exp.start_date} - ${exp.end_date || 'Present'}`,
  location: exp.location,
  description: exp.description
})) || [],

education: educationData?.map(edu => ({
  id: edu.id,
  institution: edu.institution,
  degree: edu.degree,
  duration: `${edu.start_date} - ${edu.end_date || 'Present'}`,
  description: edu.description
})) || [],

skills: skillsData?.map(skill => ({
  name: skill.name,
  endorsements: skill.endorsements_count // Database uses 'endorsements_count'
})) || []
```

## TESTING CHECKLIST

After applying these fixes:

- [ ] ✅ Share button works (copies link or opens native share)
- [ ] ✅ Likes work without 400 errors
- [ ] ✅ Comments work without 400 errors  
- [ ] ✅ Profile shows user's posts
- [ ] ✅ Profile shows experiences/education/skills
- [ ] ✅ All console errors resolved
- [ ] ✅ Communities can be created
- [ ] ✅ Settings modal accessible

## PRIORITY ORDER

1. **Share Button** - Simple fix, immediate impact
2. **Likes/Comments RLS** - Fixes 400 errors
3. **Profile Posts** - Shows user content
4. **Profile Data Mapping** - Complete profile functionality

Apply these fixes in order to resolve all reported issues. 