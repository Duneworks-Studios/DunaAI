import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin API route to upgrade user to premium
// This uses the service role key to update user metadata directly
export async function POST(request: NextRequest) {
  try {
    const { email, planType = 'pro_lifetime' } = await request.json()

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

    const user = users.users.find(u => u.email === email)

    if (!user) {
      return NextResponse.json(
        { error: `User with email ${email} not found` },
        { status: 404 }
      )
    }

    // Update user metadata using admin API
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          plan: 'pro',
          plan_type: planType,
          subscription_status: 'active',
          upgraded_at: new Date().toISOString(),
        },
      }
    )

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update user: ${updateError.message}` },
        { status: 500 }
      )
    }

    // Update user_plans table
    try {
      const { error: upsertError } = await supabaseAdmin
        .from('user_plans')
        .upsert({
          user_id: user.id,
          plan_type: planType,
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })

      if (upsertError) {
        console.warn('Error updating user_plans table:', upsertError)
        // Don't fail if this errors, the metadata update is more important
      }
    } catch (error) {
      console.warn('user_plans table may not exist:', error)
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} upgraded to ${planType}`,
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        plan_type: updatedUser.user.user_metadata?.plan_type,
        subscription_status: updatedUser.user.user_metadata?.subscription_status,
      },
    })
  } catch (error) {
    console.error('Error upgrading user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

