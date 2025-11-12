import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Manual sync endpoint to sync premium status from Whop
// This can be called if the webhook didn't fire or if there's a sync issue
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
    const whopApiKey = process.env.WHOP_API_KEY

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

    // Find user by email (case-insensitive)
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
        { error: `User with email ${email} not found. Please make sure you've signed up first.` },
        { status: 404 }
      )
    }

    // Try to check Whop API if API key is available
    let whopSubscription = null
    if (whopApiKey) {
      try {
        // Check Whop API for active subscriptions
        const whopResponse = await fetch('https://api.whop.com/api/v2/memberships', {
          headers: {
            'Authorization': `Bearer ${whopApiKey}`,
            'Content-Type': 'application/json',
          },
        })

        if (whopResponse.ok) {
          const whopData = await whopResponse.json()
          // Find membership for this email
          whopSubscription = whopData.data?.find((m: {
            user?: { email?: string }
            customer?: { email?: string }
            plan?: { id?: string }
            plan_id?: string
            id?: string
            subscription_id?: string
          }) => 
            m.user?.email?.toLowerCase() === email.toLowerCase() ||
            m.customer?.email?.toLowerCase() === email.toLowerCase()
          )
        }
      } catch (error) {
        console.warn('Could not check Whop API:', error)
        // Continue without Whop API check
      }
    }

    // Determine plan type
    // If we found a Whop subscription, use that info
    // Otherwise, check if user already has premium metadata
    let planType = 'pro_lifetime' // Default to lifetime
    let subscriptionId = null
    let planId = null

    if (whopSubscription) {
      planId = whopSubscription.plan?.id || whopSubscription.plan_id
      subscriptionId = whopSubscription.id || whopSubscription.subscription_id
      
      // Determine if it's lifetime or monthly based on plan ID
      const monthlyPlanId = 'plan_vhBLiFWs6AJNx'
      const lifetimePlanId = 'plan_nAv9o4mMRgV37'
      planType = (planId === lifetimePlanId || planId?.includes('lifetime')) ? 'pro_lifetime' : 'pro'
    } else {
      // If no Whop API check, assume lifetime for manual sync
      // You can also check existing metadata to see if there's a plan_type
      const existingPlanType = user.user_metadata?.plan_type
      if (existingPlanType === 'pro' || existingPlanType === 'pro_lifetime') {
        planType = existingPlanType
      }
    }

    // Update user metadata
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          plan: 'pro',
          plan_type: planType,
          subscription_status: 'active',
          subscription_id: subscriptionId || user.user_metadata?.subscription_id,
          whop_plan_id: planId || user.user_metadata?.whop_plan_id,
          upgraded_at: new Date().toISOString(),
          synced_at: new Date().toISOString(), // Track when we synced
        },
      }
    )

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update user metadata: ${updateError.message}` },
        { status: 500 }
      )
    }

    // Update user_plans table - Use RPC or direct SQL for more reliable updates
    let userPlansUpdated = false
    try {
      // First try the standard upsert
      const { data: upsertData, error: upsertError } = await supabaseAdmin
        .from('user_plans')
        .upsert({
          user_id: user.id,
          plan_type: planType,
          subscription_status: 'active',
          subscription_id: subscriptionId || user.user_metadata?.subscription_id,
          whop_plan_id: planId || user.user_metadata?.whop_plan_id,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })
        .select()

      if (upsertError) {
        console.error('❌ Error updating user_plans table:', upsertError)
        
        // Try alternative: Delete and insert
        try {
          await supabaseAdmin.from('user_plans').delete().eq('user_id', user.id)
          const { data: insertData, error: insertError } = await supabaseAdmin
            .from('user_plans')
            .insert({
              user_id: user.id,
              plan_type: planType,
              subscription_status: 'active',
              subscription_id: subscriptionId || user.user_metadata?.subscription_id,
              whop_plan_id: planId || user.user_metadata?.whop_plan_id,
              updated_at: new Date().toISOString(),
            })
            .select()
          
          if (insertError) {
            console.error('❌ Error inserting into user_plans:', insertError)
          } else {
            console.log('✅ Inserted into user_plans table:', insertData)
            userPlansUpdated = true
          }
        } catch (deleteError) {
          console.error('❌ Error with delete/insert approach:', deleteError)
        }
      } else {
        console.log('✅ Updated user_plans table:', upsertData)
        userPlansUpdated = true
      }
    } catch (error) {
      console.error('❌ user_plans table error:', error)
    }

    // The admin API update should be sufficient - it updates raw_user_meta_data in auth.users
    // No need for direct SQL as the admin API handles this

    // Verify the update worked by checking both
    const { data: verifyPlanData, error: verifyError } = await supabaseAdmin
      .from('user_plans')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (verifyError && verifyError.code !== 'PGRST116') {
      console.warn('⚠️ Could not verify user_plans update:', verifyError)
    }

    if (!userPlansUpdated && !verifyPlanData) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update user_plans table. Metadata was updated but database sync failed.',
        metadata_updated: true,
        user_plans_updated: false,
        user: {
          id: updatedUser.user.id,
          email: updatedUser.user.email,
          plan_type: updatedUser.user.user_metadata?.plan_type,
          subscription_status: updatedUser.user.user_metadata?.subscription_status,
        },
        troubleshooting: 'Check if user_plans table exists and RLS policies are correct.',
      }, { status: 500 })
    }

    // Get final verification of both metadata and database
    const finalUser = await supabaseAdmin.auth.admin.getUserById(user.id)
    const { data: finalPlanData } = await supabaseAdmin
      .from('user_plans')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    return NextResponse.json({
      success: true,
      message: `User ${email} synced to ${planType} plan`,
      whop_subscription_found: !!whopSubscription,
      metadata_updated: true,
      user_plans_updated: userPlansUpdated || !!finalPlanData,
      user: {
        id: finalUser.data?.user?.id || updatedUser.user.id,
        email: finalUser.data?.user?.email || updatedUser.user.email,
        plan_type: finalUser.data?.user?.user_metadata?.plan_type || updatedUser.user.user_metadata?.plan_type,
        subscription_status: finalUser.data?.user?.user_metadata?.subscription_status || updatedUser.user.user_metadata?.subscription_status,
      },
      database_verification: {
        user_metadata: {
          plan: finalUser.data?.user?.user_metadata?.plan,
          plan_type: finalUser.data?.user?.user_metadata?.plan_type,
          subscription_status: finalUser.data?.user?.user_metadata?.subscription_status,
        },
        user_plans_table: finalPlanData ? {
          plan_type: finalPlanData.plan_type,
          subscription_status: finalPlanData.subscription_status,
        } : null,
      },
      note: 'User must log out and log back in for changes to take effect in the app.',
    })
  } catch (error) {
    console.error('Error syncing user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

