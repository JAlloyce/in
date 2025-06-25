export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          headline: string | null
          about: string | null
          location: string | null
          website: string | null
          avatar_url: string | null
          banner_url: string | null
          connections_count: number
          is_verified: boolean
          is_premium: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          headline?: string | null
          about?: string | null
          location?: string | null
          website?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          connections_count?: number
          is_verified?: boolean
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          headline?: string | null
          about?: string | null
          location?: string | null
          website?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          connections_count?: number
          is_verified?: boolean
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          content: string
          media_urls: string[]
          post_type: 'user' | 'community' | 'page'
          source_id: string | null
          likes_count: number
          comments_count: number
          shares_count: number
          views_count: number
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          content: string
          media_urls?: string[]
          post_type?: 'user' | 'community' | 'page'
          source_id?: string | null
          likes_count?: number
          comments_count?: number
          shares_count?: number
          views_count?: number
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          content?: string
          media_urls?: string[]
          post_type?: 'user' | 'community' | 'page'
          source_id?: string | null
          likes_count?: number
          comments_count?: number
          shares_count?: number
          views_count?: number
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          title: string
          company_id: string | null
          posted_by: string | null
          description: string
          requirements: string | null
          salary_min: number | null
          salary_max: number | null
          location: string | null
          job_type: 'full-time' | 'part-time' | 'contract' | 'internship'
          experience_level: string | null
          remote_work: boolean
          status: string
          applications_count: number
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          company_id?: string | null
          posted_by?: string | null
          description: string
          requirements?: string | null
          salary_min?: number | null
          salary_max?: number | null
          location?: string | null
          job_type?: 'full-time' | 'part-time' | 'contract' | 'internship'
          experience_level?: string | null
          remote_work?: boolean
          status?: string
          applications_count?: number
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          company_id?: string | null
          posted_by?: string | null
          description?: string
          requirements?: string | null
          salary_min?: number | null
          salary_max?: number | null
          location?: string | null
          job_type?: 'full-time' | 'part-time' | 'contract' | 'internship'
          experience_level?: string | null
          remote_work?: boolean
          status?: string
          applications_count?: number
          views_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      connections: {
        Row: {
          id: string
          requester_id: string
          receiver_id: string
          status: 'pending' | 'accepted' | 'declined'
          message: string | null
          created_at: string
          accepted_at: string | null
        }
        Insert: {
          id?: string
          requester_id: string
          receiver_id: string
          status?: 'pending' | 'accepted' | 'declined'
          message?: string | null
          created_at?: string
          accepted_at?: string | null
        }
        Update: {
          id?: string
          requester_id?: string
          receiver_id?: string
          status?: 'pending' | 'accepted' | 'declined'
          message?: string | null
          created_at?: string
          accepted_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string | null
          content: string | null
          media_url: string | null
          message_type: string
          read_by: string[]
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id?: string | null
          content?: string | null
          media_url?: string | null
          message_type?: string
          read_by?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string | null
          content?: string | null
          media_url?: string | null
          message_type?: string
          read_by?: string[]
          created_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          name: string
          description: string | null
          privacy: 'public' | 'private' | 'secret'
          cover_image_url: string | null
          rules: string | null
          admin_id: string | null
          member_count: number
          post_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          privacy?: 'public' | 'private' | 'secret'
          cover_image_url?: string | null
          rules?: string | null
          admin_id?: string | null
          member_count?: number
          post_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          privacy?: 'public' | 'private' | 'secret'
          cover_image_url?: string | null
          rules?: string | null
          admin_id?: string | null
          member_count?: number
          post_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          sender_id: string | null
          type: 'like' | 'comment' | 'connection' | 'message' | 'job_application' | 'community_invite'
          title: string | null
          content: string | null
          data: Json | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          sender_id?: string | null
          type: 'like' | 'comment' | 'connection' | 'message' | 'job_application' | 'community_invite'
          title?: string | null
          content?: string | null
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          sender_id?: string | null
          type?: 'like' | 'comment' | 'connection' | 'message' | 'job_application' | 'community_invite'
          title?: string | null
          content?: string | null
          data?: Json | null
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      post_type: 'user' | 'community' | 'page'
      connection_status: 'pending' | 'accepted' | 'declined'
      job_type: 'full-time' | 'part-time' | 'contract' | 'internship'
      application_status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
      community_privacy: 'public' | 'private' | 'secret'
      member_role: 'member' | 'moderator' | 'admin'
      notification_type: 'like' | 'comment' | 'connection' | 'message' | 'job_application' | 'community_invite'
      material_type: 'pdf' | 'doc' | 'image' | 'link' | 'video'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}