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
      regulations: {
        Row: {
          id: string
          title: string
          chapter: string
          content: string
          version: string
          effective_date: string
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          title: string
          chapter: string
          content: string
          version: string
          effective_date: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          title?: string
          chapter?: string
          content?: string
          version?: string
          effective_date?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
    }
  }
}