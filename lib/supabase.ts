import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Singleton pattern to avoid multiple client instances
let supabaseClient: SupabaseClient | null = null

// Client-side Supabase client (singleton)
export const createSupabaseClient = (): SupabaseClient => {
  // Return existing instance if already created
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '❌ Supabase environment variables are not set. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.'
    )
    // Return a mock client that won't crash but won't work either
    // This allows the app to load without errors during development
    supabaseClient = createClient(
      'https://placeholder.supabase.co',
      'placeholder-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )
    return supabaseClient
  }

  // Create the real client instance
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })

  console.log('✅ Created Supabase client singleton')
  return supabaseClient
}

