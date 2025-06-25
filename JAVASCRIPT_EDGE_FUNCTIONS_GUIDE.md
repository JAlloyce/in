# JavaScript Edge Functions - Your LinkedIn Clone Backend

## Overview

Your backend consists of **Supabase Edge Functions** written in **JavaScript** (converted from TypeScript). These are serverless functions that run on Supabase's global edge network, providing your API endpoints.

## What Are Edge Functions?

Edge Functions are your backend API endpoints that:
- Run serverless on Supabase's global edge network
- Handle authentication, business logic, and database operations
- Scale automatically based on demand
- Are written in JavaScript using the Deno runtime
- Integrate seamlessly with Supabase services (Auth, Database, Storage, Realtime)

## Your Edge Functions (Backend API)

### 1. **get-feed** - News Feed API
```javascript
// Endpoint: /functions/v1/get-feed
// Method: GET
// Query params: ?page=1&limit=20&type=all
```
Retrieves personalized news feed with posts from connections and communities.

### 2. **create-post** - Post Creation API
```javascript
// Endpoint: /functions/v1/create-post
// Method: POST
// Body: { content, media_urls, post_type, source_id }
```
Creates new posts with AI-powered content analysis and notifications.

### 3. **toggle-like** - Like/Unlike API
```javascript
// Endpoint: /functions/v1/toggle-like
// Method: POST
// Body: { post_id }
```
Handles post likes with real-time count updates and notifications.

### 4. **search-jobs** - Job Search API
```javascript
// Endpoint: /functions/v1/search-jobs
// Method: GET
// Query: ?query=developer&location=remote&job_type=full-time
```
Advanced job search with filtering and application tracking.

### 5. **job-recommendations** - AI Job Matching API
```javascript
// Endpoint: /functions/v1/job-recommendations
// Method: GET
// Query: ?limit=10
```
AI-powered job recommendations using Perplexity API.

### 6. **send-message** - Messaging API
```javascript
// Endpoint: /functions/v1/send-message
// Method: POST
// Body: { recipient_id, content, media_url }
```
Real-time messaging with conversation management.

### 7. **get-notifications** - Notifications API
```javascript
// Endpoint: /functions/v1/get-notifications
// Method: GET
// Query: ?page=1&unread_only=true
```
Fetches user notifications with unread counts.

### 8. **upload-file** - File Upload API
```javascript
// Endpoint: /functions/v1/upload-file
// Method: POST
// Body: FormData { file, bucket, path }
```
Secure file uploads to Supabase Storage buckets.

## Architecture

```
Frontend (React)
    ↓
Supabase Client (src/lib/supabase.js)
    ↓
Edge Functions (Your Backend)
    ├── Authentication Layer
    ├── Business Logic
    ├── Database Operations (RLS)
    ├── AI Integration
    └── Storage Management
    ↓
PostgreSQL Database + Storage
```

## Key Features

### 1. **Authentication**
- JWT token validation on every request
- User context available in all functions
- Row Level Security for data protection

### 2. **Real-time Updates**
- Automatic notifications on user actions
- Live message delivery
- Feed updates via subscriptions

### 3. **AI Integration**
- Job recommendations based on user profile
- Post content analysis
- Resume parsing and insights

### 4. **Scalability**
- Runs on global edge network
- Auto-scales with traffic
- No server management needed

## Frontend Integration

The frontend uses the Supabase client to call Edge Functions:

```javascript
// Example: Creating a post
import { createPost } from './lib/supabase.js'

const newPost = await createPost(
  "Excited to share my new project!",
  ["image-url.jpg"],
  "user",
  null
)

// Example: Getting job recommendations
import { getJobRecommendations } from './lib/supabase.js'

const recommendations = await getJobRecommendations(10)
```

## Local Development

1. **Start Supabase locally:**
```bash
supabase start
```

2. **Deploy functions locally:**
```bash
supabase functions serve
```

3. **Test Edge Functions:**
```bash
# Test get-feed
curl http://localhost:54321/functions/v1/get-feed \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test create-post
curl http://localhost:54321/functions/v1/create-post \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello world!"}'
```

## Production Deployment

1. **Deploy all Edge Functions:**
```bash
supabase functions deploy
```

2. **Set environment variables:**
```bash
supabase secrets set PERPLEXITY_API_KEY=your_key
```

3. **Monitor functions:**
```bash
supabase functions list
supabase functions logs FUNCTION_NAME
```

## Benefits of Edge Functions as Backend

✅ **No Server Management** - Supabase handles infrastructure  
✅ **Global Performance** - Functions run close to users  
✅ **Automatic Scaling** - Handles traffic spikes seamlessly  
✅ **Integrated Security** - Built-in auth and RLS  
✅ **Cost Effective** - Pay only for execution time  
✅ **Real-time Ready** - Works with Supabase Realtime  
✅ **Type Safety** - Even in JavaScript with JSDoc comments  

## File Structure

```
supabase/functions/
├── _shared/                 # Shared utilities
│   ├── auth.js             # Authentication helpers
│   ├── ai.js               # AI integration
│   └── cors.js             # CORS configuration
├── get-feed/               # Feed endpoint
│   └── index.js
├── create-post/            # Post creation
│   └── index.js
├── toggle-like/            # Like functionality
│   └── index.js
├── search-jobs/            # Job search
│   └── index.js
├── job-recommendations/    # AI job matching
│   └── index.js
├── send-message/           # Messaging
│   └── index.js
├── get-notifications/      # Notifications
│   └── index.js
└── upload-file/            # File uploads
    └── index.js
```

## Next Steps

1. Review the Edge Functions in `supabase/functions/`
2. Set up your environment variables
3. Deploy the database schema
4. Test Edge Functions locally
5. Deploy to production

Your Edge Functions serve as a complete, scalable backend for your LinkedIn clone!