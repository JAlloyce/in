# LinkedIn Clone - Complete Backend Setup Guide

## 🚀 Overview

This guide will help you set up the complete backend for your LinkedIn clone using Supabase. The backend includes:

- **PostgreSQL Database** with comprehensive schema
- **Row Level Security (RLS)** for data privacy
- **Edge Functions** for API endpoints
- **Real-time subscriptions** for live features
- **File storage** with secure access
- **AI integration** with Perplexity API

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)
- Perplexity AI API key (for AI features)
- Google/GitHub OAuth apps (for social login)

## 🛠️ Setup Instructions

### 1. Supabase Project Setup

1. **Create a new Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and region
   - Set a strong database password

2. **Get your project credentials:**
   - Go to Settings → API
   - Copy the following:
     - Project URL
     - Anon public key
     - Service role key (keep this secure!)

### 2. Environment Configuration

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your credentials:**
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   
   # AI Configuration
   PERPLEXITY_API_KEY=your_perplexity_api_key
   
   # OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

### 3. Database Setup

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link your project:**
   ```bash
   supabase link --project-ref your-project-id
   ```

4. **Run database migrations:**
   ```bash
   supabase db push
   ```

   This will execute:
   - `20240101000000_initial_schema.sql` - Complete database schema
   - `20240101000001_row_level_security.sql` - Security policies
   - `20240101000002_storage_setup.sql` - File storage configuration

### 4. OAuth Setup

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local development)

#### GitHub OAuth:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `https://your-project.supabase.co/auth/v1/callback`

### 5. Edge Functions Deployment

1. **Deploy all Edge Functions:**
   ```bash
   supabase functions deploy get-feed
   supabase functions deploy create-post
   supabase functions deploy toggle-like
   supabase functions deploy search-jobs
   supabase functions deploy job-recommendations
   supabase functions deploy send-message
   supabase functions deploy get-notifications
   supabase functions deploy upload-file
   ```

2. **Set environment variables for Edge Functions:**
   ```bash
   supabase secrets set PERPLEXITY_API_KEY=your_perplexity_api_key
   ```

### 6. Storage Buckets Verification

Check that all storage buckets were created:

1. Go to Supabase Dashboard → Storage
2. Verify these buckets exist:
   - `avatars` (public)
   - `banners` (public)
   - `post-media` (public)
   - `resumes` (private)
   - `company-logos` (public)
   - `community-covers` (public)
   - `workspace-files` (private)
   - `message-attachments` (private)

### 7. Frontend Integration

1. **Install Supabase client:**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Update your React app to use the Supabase client:**
   - The client is already configured in `src/lib/supabase.ts`
   - Import and use the client in your components

### 8. Testing the Setup

1. **Start your React development server:**
   ```bash
   npm run dev
   ```

2. **Test key functionality:**
   - User registration/login
   - Profile creation
   - Post creation and viewing
   - Real-time notifications
   - File uploads

## 🔧 API Endpoints

### Authentication
- **POST** `/auth/signup` - User registration
- **POST** `/auth/signin` - User login
- **POST** `/auth/signout` - User logout
- **GET** `/auth/user` - Get current user

### Feed & Posts
- **GET** `/functions/v1/get-feed` - Get user's feed
- **POST** `/functions/v1/create-post` - Create new post
- **POST** `/functions/v1/toggle-like` - Like/unlike post

### Jobs
- **GET** `/functions/v1/search-jobs` - Search jobs with filters
- **GET** `/functions/v1/job-recommendations` - AI-powered job recommendations

### Messaging
- **POST** `/functions/v1/send-message` - Send message
- **GET** `/functions/v1/get-conversations` - Get user conversations

### Notifications
- **GET** `/functions/v1/get-notifications` - Get user notifications

### File Upload
- **POST** `/functions/v1/upload-file` - Upload files to storage

## 🔒 Security Features

### Row Level Security (RLS)
- Users can only access their own data
- Connections control post visibility
- Community membership controls access
- Job applications are private between applicant and employer

### File Upload Security
- File type validation
- File size limits per bucket
- Secure file paths with user isolation
- Private buckets for sensitive content

### API Security
- JWT token authentication
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- CORS configuration

## 🚀 Real-time Features

### Live Subscriptions
```javascript
// Listen to new notifications
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `recipient_id=eq.${userId}`
  }, (payload) => {
    // Handle new notification
  })
  .subscribe()

// Listen to new messages
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    // Handle new message
  })
  .subscribe()
```

## 🤖 AI Features

### Job Recommendations
- Analyzes user profile, skills, and experience
- Matches with available job opportunities
- Provides match scores and reasoning

### Resume Analysis
- Extracts skills and experience from uploaded resumes
- Provides improvement suggestions
- Determines experience level

### Post Insights
- Analyzes post content for sentiment and topics
- Predicts engagement potential
- Suggests improvements

## 📊 Performance Optimizations

### Database Indexes
- All frequently queried columns are indexed
- Full-text search indexes for job and post content
- Composite indexes for complex queries

### Caching Strategy
- Edge Function response caching
- CDN for static assets
- Real-time subscription optimization

### Query Optimization
- Efficient JOIN operations
- Pagination for large datasets
- Optimized feed algorithms

## 🔍 Monitoring & Analytics

### Logging
- Edge Function execution logs
- Database query performance
- Real-time subscription metrics

### Error Handling
- Graceful error responses
- Client-side error boundaries
- Automatic retry mechanisms

## 🚀 Deployment

### Production Deployment
1. **Configure production environment variables**
2. **Set up CI/CD pipeline for Edge Functions**
3. **Configure custom domain (optional)**
4. **Set up monitoring and alerts**
5. **Configure backup strategies**

### Scaling Considerations
- Supabase automatically scales based on usage
- Edge Functions scale globally
- Database connection pooling included
- CDN for global content delivery

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Perplexity AI API Documentation](https://docs.perplexity.ai/)
- [React + Supabase Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-react)

## 🆘 Troubleshooting

### Common Issues

1. **Migration errors:**
   - Check database connection
   - Verify migration file syntax
   - Check for naming conflicts

2. **Edge Function deployment fails:**
   - Verify Supabase CLI is logged in
   - Check function syntax and imports
   - Ensure environment variables are set

3. **Real-time not working:**
   - Check RLS policies
   - Verify subscription filters
   - Check network connectivity

4. **File upload errors:**
   - Verify bucket permissions
   - Check file size and type limits
   - Ensure storage policies are correct

### Getting Help
- Check Supabase Discord community
- Review GitHub issues
- Contact support through Supabase dashboard

---

## ✅ Verification Checklist

- [ ] Supabase project created and configured
- [ ] Database migrations applied successfully
- [ ] All Edge Functions deployed
- [ ] Storage buckets created with correct policies
- [ ] OAuth providers configured
- [ ] Environment variables set
- [ ] Real-time subscriptions working
- [ ] File uploads functional
- [ ] AI features responding correctly

Your LinkedIn clone backend is now fully functional and ready for production use! 🎉