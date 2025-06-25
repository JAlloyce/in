# Supabase Deployment Guide for LinkedIn Clone

## Your Supabase Project

Your Supabase project has been configured with the following:
- **Project URL**: https://nuntsizvwfmjzucuubcd.supabase.co
- **Project ID**: nuntsizvwfmjzucuubcd

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Your `.env` file has been created with your Supabase credentials. **Never commit this file to version control!**

### 3. Connect to Your Supabase Project
```bash
# Login to Supabase CLI
npx supabase login

# Link to your project
npx supabase link --project-ref nuntsizvwfmjzucuubcd
```

### 4. Deploy Database Schema
```bash
# Push the database migrations to your Supabase project
npx supabase db push
```

### 5. Deploy Storage Buckets
```bash
# The storage setup will be applied automatically with db push
# Verify buckets in your Supabase dashboard
```

### 6. Deploy Edge Functions
```bash
# Deploy all Edge Functions
npx supabase functions deploy

# Or deploy individually:
npx supabase functions deploy get-feed
npx supabase functions deploy create-post
npx supabase functions deploy toggle-like
npx supabase functions deploy search-jobs
npx supabase functions deploy job-recommendations
npx supabase functions deploy send-message
npx supabase functions deploy get-notifications
npx supabase functions deploy upload-file
```

### 7. Set Edge Function Secrets
```bash
# Set the Perplexity API key for AI features
npx supabase secrets set PERPLEXITY_API_KEY=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
```

### 8. Configure OAuth (Optional)
To enable Google and GitHub login:

1. **Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://nuntsizvwfmjzucuubcd.supabase.co/auth/v1/callback`
   - Update `.env` with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

2. **GitHub OAuth**:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create a new OAuth App
   - Set Authorization callback URL: `https://nuntsizvwfmjzucuubcd.supabase.co/auth/v1/callback`
   - Update `.env` with `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

3. **Update Supabase Dashboard**:
   - Go to Authentication > Providers in your Supabase dashboard
   - Enable and configure Google and GitHub providers

### 9. Run the Application
```bash
# Start the development server
npm run dev
```

Your app will be available at http://localhost:5173

## Verify Deployment

### Check Database Tables
```sql
-- Run in Supabase SQL Editor to verify tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Test Edge Functions
```bash
# Get your anon key from .env
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51bnRzaXp2d2Ztanp1Y3V1YmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MzA3MTMsImV4cCI6MjA2NjQwNjcxM30.AskIiop9Z8sNL_K9THYgskWWFPmXi7XoqljiYgJodWU"

# Test get-feed function
curl https://nuntsizvwfmjzucuubcd.supabase.co/functions/v1/get-feed \
  -H "Authorization: Bearer $ANON_KEY" \
  -H "apikey: $ANON_KEY"
```

### Check Storage Buckets
Visit your Supabase dashboard > Storage to verify these buckets exist:
- avatars
- banners
- post-media
- resumes
- message-attachments
- workspace-files
- company-logos
- community-covers

## Production Checklist

- [ ] Database schema deployed
- [ ] RLS policies active
- [ ] Storage buckets created
- [ ] Edge Functions deployed
- [ ] Perplexity API key set
- [ ] OAuth providers configured (optional)
- [ ] Environment variables secured
- [ ] Frontend deployed

## Troubleshooting

### Edge Functions Not Working
```bash
# Check function logs
npx supabase functions logs FUNCTION_NAME
```

### Database Connection Issues
```bash
# Test database connection
npx supabase db remote status
```

### Auth Issues
- Verify site URL in Supabase dashboard matches your deployment URL
- Check redirect URLs are properly configured
- Ensure RLS policies are correctly set

## Security Notes

1. **Never expose** the service role key in frontend code
2. **Always use** the anon key in the frontend
3. **Keep** your `.env` file out of version control
4. **Enable** RLS on all tables
5. **Review** security policies regularly

## Next Steps

1. Create some test users
2. Post some content
3. Test job search and AI recommendations
4. Set up real OAuth apps for production
5. Deploy frontend to Vercel/Netlify

Your LinkedIn clone is now connected to Supabase and ready for development!