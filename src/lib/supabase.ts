import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    VITE_SUPABASE_URL: supabaseUrl ? 'Set' : 'Missing',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Set' : 'Missing'
  })
  throw new Error(`Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment environment.`)
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

// Type definitions
export interface Profile {
  id: string
  email: string
  name: string
  headline?: string
  about?: string
  location?: string
  website?: string
  avatar_url?: string
  banner_url?: string
  connections_count: number
  is_verified: boolean
  is_premium: boolean
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  author_id: string
  content: string
  media_urls: string[]
  post_type: 'user' | 'community' | 'page'
  source_id?: string
  likes_count: number
  comments_count: number
  shares_count: number
  views_count: number
  created_at: string
  updated_at: string
  author?: Profile
  user_liked?: boolean
  recent_comments?: Comment[]
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  likes_count: number
  created_at: string
  updated_at: string
  author?: Profile
}

export interface Job {
  id: string
  title: string
  company_id: string
  posted_by: string
  description: string
  requirements?: string
  salary_min?: number
  salary_max?: number
  location?: string
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship'
  experience_level?: string
  remote_work: boolean
  status: 'active' | 'closed' | 'draft'
  applications_count: number
  views_count: number
  created_at: string
  updated_at: string
  company?: Company
  user_applied?: boolean
  application_status?: string
}

export interface Company {
  id: string
  name: string
  description?: string
  website?: string
  logo_url?: string
  banner_url?: string
  size?: string
  industry?: string
  location?: string
  verified: boolean
  created_at: string
  updated_at: string
}

export interface Connection {
  id: string
  requester_id: string
  receiver_id: string
  status: 'pending' | 'accepted' | 'declined'
  message?: string
  created_at: string
  accepted_at?: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content?: string
  media_url?: string
  message_type: 'text' | 'image' | 'file' | 'voice'
  read_by: string[]
  created_at: string
  sender?: Profile
}

export interface Conversation {
  id: string
  participants: string[]
  last_message_at: string
  created_at: string
}

export interface Community {
  id: string
  name: string
  description?: string
  privacy: 'public' | 'private' | 'secret'
  cover_image_url?: string
  rules?: string
  admin_id: string
  member_count: number
  post_count: number
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  recipient_id: string
  sender_id?: string
  type: 'like' | 'comment' | 'connection' | 'message' | 'job_application' | 'community_invite'
  title?: string
  content?: string
  data?: any
  read: boolean
  created_at: string
  sender?: Profile
}

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}

export const signUpWithEmail = async (email: string, password: string, name: string) => {
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
export const callEdgeFunction = async (functionName: string, data?: any, method: string = 'POST') => {
  const { data: result, error } = await supabase.functions.invoke(functionName, {
    body: data,
    method
  })
  
  if (error) throw error
  return result
}

// Storage helpers
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file)
  
  if (error) throw error
  return data
}

export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}

// Real-time helpers
export const subscribeToTable = (
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
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

export const subscribeToUserNotifications = (
  userId: string,
  callback: (payload: any) => void
) => {
  return subscribeToTable(
    'notifications',
    callback,
    `recipient_id=eq.${userId}`
  )
}

export const subscribeToConversation = (
  conversationId: string,
  callback: (payload: any) => void
) => {
  return subscribeToTable(
    'messages',
    callback,
    `conversation_id=eq.${conversationId}`
  )
}