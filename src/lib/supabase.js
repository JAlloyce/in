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

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

export const signUpWithEmail = async (email, password, name) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name
      }
    }
  })
  if (error) throw error
  return data
}

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  if (error) throw error
  return data
}

export const signInWithGitHub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// API helpers
export const callEdgeFunction = async (functionName, data, method = 'POST') => {
  const { data: result, error } = await supabase.functions.invoke(functionName, {
    body: data,
    method
  })
  
  if (error) throw error
  return result
}

// Storage helpers
export const uploadFile = async (bucket, path, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file)
  
  if (error) throw error
  return data
}

export const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}

// Real-time helpers
export const subscribeToTable = (table, callback, filter) => {
  const channel = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter
      },
      callback
    )
    .subscribe()

  return channel
}

export const subscribeToUserNotifications = (userId, callback) => {
  return subscribeToTable(
    'notifications',
    callback,
    `recipient_id=eq.${userId}`
  )
}

export const subscribeToConversation = (conversationId, callback) => {
  return subscribeToTable(
    'messages',
    callback,
    `conversation_id=eq.${conversationId}`
  )
}

// API functions for easy frontend integration
export const getFeed = async (page = 1, limit = 20, type = 'all') => {
  return await callEdgeFunction('get-feed', null, 'GET')
}

export const createPost = async (content, mediaUrls = [], postType = 'user', sourceId = null) => {
  return await callEdgeFunction('create-post', {
    content,
    media_urls: mediaUrls,
    post_type: postType,
    source_id: sourceId
  })
}

export const toggleLike = async (postId) => {
  return await callEdgeFunction('toggle-like', {
    post_id: postId
  })
}

export const searchJobs = async (query, filters = {}) => {
  const params = new URLSearchParams({
    ...(query && { query }),
    ...filters
  })
  
  return await callEdgeFunction(`search-jobs?${params}`, null, 'GET')
}

export const getJobRecommendations = async (limit = 10) => {
  return await callEdgeFunction(`job-recommendations?limit=${limit}`, null, 'GET')
}

export const sendMessage = async (recipientId, content, conversationId = null, mediaUrl = null) => {
  return await callEdgeFunction('send-message', {
    recipient_id: recipientId,
    conversation_id: conversationId,
    content,
    media_url: mediaUrl
  })
}

export const getNotifications = async (page = 1, unreadOnly = false) => {
  const params = new URLSearchParams({
    page: page.toString(),
    ...(unreadOnly && { unread_only: 'true' })
  })
  
  return await callEdgeFunction(`get-notifications?${params}`, null, 'GET')
}

export const uploadFileToStorage = async (bucket, file, customPath = null) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucket', bucket)
  if (customPath) {
    formData.append('path', customPath)
  }
  
  return await callEdgeFunction('upload-file', formData)
}