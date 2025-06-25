# DEBUG ALL ISSUES

## 1. Test Posts Loading for Profile

Let me test the exact query that Profile.jsx is using:

```sql
-- Test posts.getByUser for the logged-in user
SELECT p.id, p.content, p.author_id, p.created_at, p.likes_count, p.comments_count
FROM posts p
WHERE p.author_id = (
  SELECT auth.uid()  -- Get current user ID
)
ORDER BY p.created_at DESC;
```

## 2. Test Comments System

```sql
-- Test comments insertion
INSERT INTO comments (content, post_id, author_id) 
VALUES ('Test comment', 'b322c557-15f8-47cb-b3f7-72f83a3dd058', '950c554c-a3e2-47bd-88f3-9cbc3da7b80c');

-- Test comments retrieval
SELECT c.id, c.content, c.author_id, c.post_id, c.created_at
FROM comments c
WHERE c.post_id = 'b322c557-15f8-47cb-b3f7-72f83a3dd058';
```

## 3. Test Likes System

```sql
-- Test likes insertion
INSERT INTO likes (post_id, user_id) 
VALUES ('b322c557-15f8-47cb-b3f7-72f83a3dd058', '950c554c-a3e2-47bd-88f3-9cbc3da7b80c');

-- Test likes retrieval
SELECT l.id, l.post_id, l.user_id, l.created_at
FROM likes l
WHERE l.post_id = 'b322c557-15f8-47cb-b3f7-72f83a3dd058';
```

## 4. Check Share Button Implementation

Need to check if Home.jsx has a share button implementation.

## 5. Issues Summary

1. **Profile Posts Not Showing**: Posts exist in DB but not displaying in profile
2. **Comments Failing**: 400 errors on comment creation  
3. **Likes Failing**: 400 errors on like creation
4. **Communities Fixed**: Removed privacy_level field
5. **Profile Sections**: Need editing functionality for experience/education/skills
6. **Share Button**: Need to implement if missing

## Frontend Code Issues to Check

1. **Profile.jsx**: posts.getByUser() might not be called correctly
2. **CommentInput.jsx**: Fixed author_id but still 400 errors
3. **Home.jsx**: Likes system still causing 400 errors
4. **SettingsModal**: Should be accessible from sidebar

## Database Schema Verification Needed

1. Check if RLS policies are blocking operations
2. Verify column names match frontend expectations
3. Check if foreign key constraints exist 