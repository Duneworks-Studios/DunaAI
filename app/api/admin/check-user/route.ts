import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Check user's current plan status
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Get service role key from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase credentials not configured' },
        { status: 500 }
      )
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Find user by email
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (userError) {
      return NextResponse.json(
        { error: `Failed to list users: ${userError.message}` },
        { status: 500 }
      )
    }

    const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      return NextResponse.json(
        { error: `User with email ${email} not found` },
        { status: 404 }
      )
    }

    // Check user metadata
    const userMetadata = user.user_metadata || {}
    const plan = userMetadata.plan
    const planType = userMetadata.plan_type
    const status = userMetadata.subscription_status

    // Check user_plans table
    const { data: planData, error: planError } = await supabaseAdmin
      .from('user_plans')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      metadata: {
        plan,
        plan_type: planType,
        subscription_status: status,
        full_metadata: userMetadata,
      },
      user_plans_table: {
        data: planData,
        error: planError?.message,
      },
      isPremium: (planType === 'pro' || planType === 'pro_lifetime') && status === 'active' ||
                 (planData?.plan_type === 'pro' || planData?.plan_type === 'pro_lifetime') && 
                 planData?.subscription_status === 'active',
    })
  } catch (error) {
    console.error('Error checking user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

