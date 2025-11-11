import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // Get the origin from environment or request
  const origin = process.env.NEXTAUTH_URL || 
                 process.env.NEXT_PUBLIC_SITE_URL || 
                 requestUrl.origin

  if (code) {
    // Create a server-side client for the callback
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to chat page
  return NextResponse.redirect(new URL('/chat', origin))
}

