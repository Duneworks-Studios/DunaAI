import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Special code activation endpoint
// Handles both pro upgrade and message limit reset
export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json()

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'User ID and code are required' },
        { status: 400 }
      )
    }

    // Special codes
    const PRO_UPGRADE_CODE = 'IzEgQWkgRHVuZXdvcmtzIDY3'
    const RESET_MESSAGE_LIMIT_CODE = 'RHVuZXdvcmtzIElzICMxIERldiBTZXJ2ZXI='

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

    // Get user
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (userError || !userData?.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = userData.user

    // Handle pro upgrade code
    if (code === PRO_UPGRADE_CODE) {
      // Update user metadata
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            ...user.user_metadata,
            plan: 'pro',
            plan_type: 'pro_lifetime',
            subscription_status: 'active',
            upgraded_at: new Date().toISOString(),
            code_activated: true,
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
        await supabaseAdmin
          .from('user_plans')
          .upsert({
            user_id: userId,
            plan_type: 'pro_lifetime',
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          })
      } catch (error) {
        console.error('Error updating user_plans table:', error)
        // Continue even if this fails
      }

      return NextResponse.json({
        success: true,
        action: 'pro_upgrade',
        message: 'User upgraded to Pro successfully',
        user: {
          id: updatedUser.user.id,
          email: updatedUser.user.email,
          plan_type: updatedUser.user.user_metadata?.plan_type,
        },
      })
    }

    // Handle message limit reset code
    if (code === RESET_MESSAGE_LIMIT_CODE) {
      const today = new Date().toISOString().split('T')[0]
      
      // Delete all messages for today from database
      try {
        const { error: deleteError } = await supabaseAdmin
          .from('user_messages')
          .delete()
          .eq('user_id', userId)
          .gte('created_at', `${today}T00:00:00.000Z`)
          .lt('created_at', `${today}T23:59:59.999Z`)

        if (deleteError) {
          // If table doesn't exist or error, that's okay - localStorage will be cleared client-side
          console.warn('Could not delete from user_messages table:', deleteError)
        } else {
          console.log('✅ Deleted messages from database for user:', userId)
        }
      } catch (error) {
        console.warn('Error resetting message limit in database:', error)
        // Continue - localStorage will be cleared client-side
      }

      // Note: localStorage will be cleared client-side when the user plan is reloaded
      // The client will check localStorage and clear it if needed

      return NextResponse.json({
        success: true,
        action: 'reset_message_limit',
        message: 'Daily message limit reset successfully',
        user: {
          id: user.id,
          email: user.email,
        },
        note: 'Please refresh the page to see the updated message count',
      })
    }

    // Invalid code
    return NextResponse.json(
      { error: 'Invalid code' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Code activation error:', error)
    return NextResponse.json(
      { error: 'Code activation failed' },
      { status: 500 }
    )
  }
}

