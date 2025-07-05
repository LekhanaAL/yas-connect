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
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string
          avatar_url: string | null
          location: Json | null
          last_seen: string | null
          status: string | null
          lesson_number: number | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name: string
          avatar_url?: string | null
          location?: Json | null
          last_seen?: string | null
          status?: string | null
          lesson_number?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          location?: Json | null
          last_seen?: string | null
          status?: string | null
          lesson_number?: number | null
        }
      }
      stories: {
        Row: {
          id: string
          created_at: string
          user_id: string
          media_url: string
          type: 'image' | 'video'
          expires_at: string
          views: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          media_url: string
          type: 'image' | 'video'
          expires_at: string
          views?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          media_url?: string
          type?: 'image' | 'video'
          expires_at?: string
          views?: string[]
        }
      }
      friend_requests: {
        Row: {
          id: string
          created_at: string
          from_user_id: string
          to_user_id: string
          status: 'pending' | 'accepted' | 'rejected'
        }
        Insert: {
          id?: string
          created_at?: string
          from_user_id: string
          to_user_id: string
          status: 'pending' | 'accepted' | 'rejected'
        }
        Update: {
          id?: string
          created_at?: string
          from_user_id?: string
          to_user_id?: string
          status?: 'pending' | 'accepted' | 'rejected'
        }
      }
      messages: {
        Row: {
          id: string
          created_at: string
          from_user_id: string
          to_user_id: string
          content: string
          type: 'text' | 'media'
          read: boolean
          expires_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          from_user_id: string
          to_user_id: string
          content: string
          type: 'text' | 'media'
          read?: boolean
          expires_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          from_user_id?: string
          to_user_id?: string
          content?: string
          type?: 'text' | 'media'
          read?: boolean
          expires_at?: string | null
        }
      }
      locations: {
        Row: {
          user_id: string;
          latitude: number;
          longitude: number;
          city: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          latitude: number;
          longitude: number;
          city?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          latitude?: number;
          longitude?: number;
          city?: string | null;
          updated_at?: string;
        };
      };
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 