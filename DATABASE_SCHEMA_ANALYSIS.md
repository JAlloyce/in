# 🔍 DATABASE SCHEMA ANALYSIS & MISMATCHES

## Current Database Schema Analysis

After analyzing your full database schema, here are the **CRITICAL MISMATCHES** between your database and app requirements:

## 🚨 CRITICAL FOREIGN KEY MISMATCHES

### 1. **Comments Table** 
❌ **MISMATCH**: `author_id` references `auth.users(id)`  
✅ **SHOULD BE**: `author_id` references `profiles(id)`  
🔧 **IMPACT**: Comments won't work with your React app that expects profile data

### 2. **Posts Table**
❌ **MISMATCH**: `author_id` references `auth.users(id)`  
✅ **SHOULD BE**: `author_id` references `profiles(id)`  
🔧 **IMPACT**: Post creation fails - "Could not find relationship between posts and profiles"

### 3. **Likes Table**
❌ **MISMATCH**: `user_id` references `auth.users(id)`  
✅ **SHOULD BE**: `user_id` references `profiles(id)`  
🔧 **IMPACT**: Like functionality broken

### 4. **Notifications Table**
❌ **MISMATCH**: `recipient_id` and `sender_id` reference `auth.users(id)`  
✅ **SHOULD BE**: Should reference `profiles(id)`  
🔧 **IMPACT**: Notifications system broken

### 5. **Company Tables**
❌ **MISMATCH**: `created_by` references `auth.users(id)`  
✅ **SHOULD BE**: Should reference `profiles(id)`  

## 🔧 MISSING COLUMNS THAT YOUR APP EXPECTS

### Profiles Table Missing:
- `email` column (your app expects this)
- `full_name` column (your login expects this)

### Notifications Table Issues:
- Has `recipient_id` but your error logs expect `user_id`
- Missing `updated_at` column (trigger expects this)

## 📊 WHAT'S CORRECT IN YOUR SCHEMA

✅ **Profiles**: Correctly references `auth.users(id)`  
✅ **Foreign Keys**: Most community/job tables correctly reference `profiles(id)`  
✅ **Saved Posts**: Correctly references `profiles(id)`  
✅ **Connections**: Correctly references `profiles(id)`  

## 🎯 ROOT CAUSE OF YOUR ERRORS

Your React app is built to work with `profiles` table for user data, but several core tables (posts, comments, likes, notifications) are still referencing `auth.users` directly. This creates the relationship errors you're seeing.

## 🚀 RECOMMENDED FIX STRATEGY

### Phase 1: Fix Foreign Key References
```sql
-- Fix Posts table
ALTER TABLE posts DROP CONSTRAINT posts_author_id_fkey;
ALTER TABLE posts ADD CONSTRAINT posts_author_id_fkey 
    FOREIGN KEY (author_id) REFERENCES profiles(id);

-- Fix Comments table  
ALTER TABLE comments DROP CONSTRAINT comments_author_id_fkey;
ALTER TABLE comments ADD CONSTRAINT comments_author_id_fkey 
    FOREIGN KEY (author_id) REFERENCES profiles(id);

-- Fix Likes table
ALTER TABLE likes DROP CONSTRAINT likes_user_id_fkey;
ALTER TABLE likes ADD CONSTRAINT likes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id);
```

### Phase 2: Fix Notifications Table
```sql
-- Add user_id column and migrate data from recipient_id
ALTER TABLE notifications ADD COLUMN user_id UUID;
UPDATE notifications SET user_id = recipient_id;
ALTER TABLE notifications ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id);
```

### Phase 3: Add Missing Profile Columns
```sql
-- Add missing columns to profiles
ALTER TABLE profiles ADD COLUMN email TEXT;
ALTER TABLE profiles ADD COLUMN full_name TEXT;

-- Update from auth.users data
UPDATE profiles SET 
    email = (SELECT email FROM auth.users WHERE auth.users.id = profiles.id),
    full_name = COALESCE(name, 'User');
```

## 🔥 IMMEDIATE ACTION NEEDED

Your app architecture expects all user relationships to go through the `profiles` table, but your database has mixed references between `auth.users` and `profiles`. This is the source of all your relationship errors.

The fix requires updating foreign key constraints to point to `profiles(id)` instead of `auth.users(id)` for consistency with your React application.