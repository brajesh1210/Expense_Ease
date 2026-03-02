import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

// Basic client (for verifying tokens)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client with user's token (for database operations)
// This respects Row Level Security (RLS)
export const getAuthClient = (token) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  })
}