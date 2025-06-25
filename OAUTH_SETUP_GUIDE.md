# 🔐 OAuth Setup Guide - Fix "provider is not enabled" Error

## ❌ Current Error
```
GET https://nuntsizvwfmjzucuubcd.supabase.co/auth/v1/authorize?provider=google&redirect_to=http%3A%2F%2Flocalhost%3A3000%2F&access_type=offline&prompt=consent 400 (Bad Request)

{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```

## ✅ Solution: Enable OAuth Providers

### Step 1: Configure Google Cloud Console

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select existing one
3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Configure OAuth consent screen if prompted
   - Set application type to **"Web application"**

5. **Configure OAuth Settings:**

   **✅ Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://nuntsizvwfmjzucuubcd.supabase.co
   ```

   **✅ Authorized redirect URIs:**
   ```
   http://localhost:3000/auth/callback
   https://nuntsizvwfmjzucuubcd.supabase.co/auth/v1/callback
   ```

6. **Save and copy:**
   - Client ID (starts with numbers, ends with `.apps.googleusercontent.com`)
   - Client Secret (random string)

### Step 2: Enable Google OAuth in Supabase Dashboard

1. **Go to your Supabase project dashboard:**
   - URL: https://supabase.com/dashboard/project/nuntsizvwfmjzucuubcd

2. **Navigate to Authentication:**
   - Click "Authentication" in left sidebar
   - Click "Providers" tab

3. **Enable Google OAuth:**
   - Find "Google" in the list
   - **Toggle the "Enable" switch to ON** ⭐ *This is the key step!*
   - Paste your Google **Client ID**
   - Paste your Google **Client Secret**
   - Click **"Save"**

### Step 3: Configure Redirect URLs in Supabase

1. **In Supabase Dashboard:**
   - Go to "Authentication" → "URL Configuration"
   
2. **Add Redirect URLs:**
   ```
   http://localhost:3000/auth/callback
   https://your-production-domain.com/auth/callback
   ```

3. **Set Site URL:**
   ```
   http://localhost:3000
   ```

### Step 4: Environment Variables

Make sure your `.env` file has:
```env
VITE_SUPABASE_URL=https://nuntsizvwfmjzucuubcd.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-from-supabase-dashboard
```

### Step 5: Test the Setup

1. **Restart your development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

2. **Try OAuth login:**
   - Click the Google login button
   - Should redirect to Google's consent screen
   - After approval, should redirect back to your app

## 🔧 Files Updated

### ✅ OAuth Implementation Files:
- `src/lib/supabase.js` - OAuth methods
- `src/components/auth/LoginForm.jsx` - OAuth login UI
- `src/pages/AuthCallback.jsx` - Handle OAuth redirects
- `src/App.jsx` - Added `/auth/callback` route

### ✅ OAuth Flow:
1. User clicks "Continue with Google"
2. Redirects to Google OAuth consent screen
3. User approves access
4. Google redirects to `/auth/callback`
5. `AuthCallback.jsx` processes the session
6. User is redirected to home page

## 🚨 Common Issues & Solutions

### Issue 1: "provider is not enabled"
**Solution:** Make sure Google OAuth is enabled in Supabase dashboard

### Issue 2: "redirect_uri_mismatch"
**Solution:** Ensure redirect URIs match exactly in both Google Cloud Console and Supabase

### Issue 3: OAuth consent screen warnings
**Solution:** In Google Cloud Console, configure consent screen with your app details

### Issue 4: "Invalid client" error
**Solution:** Double-check Client ID and Secret are correct in Supabase

## 🎯 Next Steps

After completing these steps:

1. **Test Google OAuth** - Should work without errors
2. **Configure GitHub OAuth** (optional):
   - Similar process in GitHub Developer Settings
   - Enable GitHub provider in Supabase
3. **Add production domains** when deploying

## ✅ Verification Checklist

- [ ] Google Cloud Console project created
- [ ] OAuth client ID created with correct redirect URIs
- [ ] Google provider enabled in Supabase dashboard
- [ ] Client ID and Secret added to Supabase
- [ ] Redirect URLs configured in Supabase
- [ ] Environment variables set correctly
- [ ] Development server restarted
- [ ] OAuth login button tested

Once all items are checked, OAuth authentication should work perfectly! 🎉