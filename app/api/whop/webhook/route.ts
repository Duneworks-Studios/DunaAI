import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Verify Whop webhook signature
function verifyWhopSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  )
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.WHOP_WEBHOOK_SECRET
    
    if (!webhookSecret) {
      console.error('WHOP_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    const body = await request.text()
    const signature = request.headers.get('x-whop-signature') || ''

    // Verify webhook signature
    if (!verifyWhopSignature(body, signature, webhookSecret)) {
      console.error('Invalid webhook signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)
    console.log('Whop webhook received:', event.type, event.data)

    // Initialize Supabase admin client (server-side)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured for webhook')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Handle different event types
    // Whop webhook events: checkout.completed, subscription.created, subscription.cancelled, etc.
    if (event.type === 'checkout.completed' || event.type === 'subscription.created' || event.type === 'subscription.activated') {
      // Extract customer info from event data - handle multiple possible structures
      const customerEmail = 
        event.data?.customer?.email || 
        event.data?.customer_email || 
        event.data?.email ||
        event.data?.user?.email ||
        event.data?.membership?.user?.email ||
        event.data?.membership?.customer?.email
      
      // Extract plan ID from various possible locations
      const planId = 
        event.data?.plan?.id || 
        event.data?.plan_id ||
        event.data?.membership?.plan?.id ||
        event.data?.membership?.plan_id ||
        event.data?.subscription?.plan?.id ||
        event.data?.subscription?.plan_id
      
      // Extract subscription ID
      const subscriptionId = 
        event.data?.subscription?.id || 
        event.data?.subscription_id || 
        event.data?.id ||
        event.data?.membership?.id ||
        event.data?.membership?.subscription_id

      console.log('🔔 Whop Webhook Event:', {
        type: event.type,
        customerEmail,
        planId,
        subscriptionId,
        eventData: JSON.stringify(event.data, null, 2)
      })

      if (!customerEmail) {
        console.error('❌ No customer email in webhook data:', JSON.stringify(event.data, null, 2))
        return NextResponse.json(
          { error: 'Missing customer email', event_type: event.type },
          { status: 400 }
        )
      }

      if (!planId) {
        console.warn('⚠️ No plan ID in webhook data, will attempt to determine from existing data')
      }

      console.log('📦 Processing upgrade for:', customerEmail, 'Plan ID:', planId)

      // Find user by email - use more efficient query if possible
      let user = null
      try {
        // Try to get user by email directly (more efficient)
        const { data: userData, error: getUserError } = await supabase.auth.admin.getUserByEmail(customerEmail)
        
        if (!getUserError && userData?.user) {
          user = userData.user
          console.log('✅ Found user by email:', user.email, user.id)
        } else {
          // Fallback to listing all users (less efficient but more reliable)
          console.log('⚠️ Direct email lookup failed, trying listUsers...')
          const { data: users, error: userError } = await supabase.auth.admin.listUsers()
          
          if (userError) {
            console.error('❌ Error fetching users:', userError)
            return NextResponse.json(
              { error: 'Failed to find user' },
              { status: 500 }
            )
          }

          user = users.users.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase())
        }
      } catch (error) {
        console.error('❌ Error finding user:', error)
        return NextResponse.json(
          { error: 'Failed to find user' },
          { status: 500 }
        )
      }

      if (!user) {
        console.warn(`⚠️ User not found for email: ${customerEmail}. They may need to sign up first.`)
        // Don't fail - return success so Whop doesn't retry
        // The user can sync manually after signing up, or we can create a pending upgrade record
        return NextResponse.json({ 
          received: true,
          warning: `User not found for email: ${customerEmail}. They need to sign up first, then premium will be synced.`,
          email: customerEmail
        })
      }

      // Determine plan type based on plan_id
      const monthlyPlanId = 'plan_vhBLiFWs6AJNx'
      const lifetimePlanId = 'plan_nAv9o4mMRgV37'
      
      // Check if it's lifetime or monthly
      const isLifetime = 
        planId === lifetimePlanId || 
        planId?.includes('lifetime') ||
        planId?.toLowerCase().includes('lifetime') ||
        event.data?.plan?.name?.toLowerCase().includes('lifetime') ||
        event.data?.membership?.plan?.name?.toLowerCase().includes('lifetime')
      
      const planType = isLifetime ? 'pro_lifetime' : 'pro'
      
      console.log(`📋 Plan Type Detected: ${planType} (Plan ID: ${planId}, Is Lifetime: ${isLifetime})`)

      // Update user metadata
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        {
          user_metadata: {
            ...user.user_metadata,
            plan: 'pro',
            plan_type: planType,
            subscription_status: 'active',
            subscription_id: subscriptionId,
            whop_plan_id: planId,
            upgraded_at: new Date().toISOString(),
          },
        }
      )

      if (updateError) {
        console.error('Error updating user metadata:', updateError)
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        )
      }

      // Also update user_plans table - use robust update with fallback
      let userPlansUpdated = false
      try {
        const { data: upsertData, error: upsertError } = await supabase
          .from('user_plans')
          .upsert({
            user_id: user.id,
            plan_type: planType,
            subscription_status: 'active',
            subscription_id: subscriptionId,
            whop_plan_id: planId,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          })
          .select()
        
        if (upsertError) {
          console.warn('Error upserting user_plans:', upsertError)
          // Try delete and insert as fallback
          try {
            await supabase.from('user_plans').delete().eq('user_id', user.id)
            const { data: insertData, error: insertError } = await supabase
              .from('user_plans')
              .insert({
                user_id: user.id,
                plan_type: planType,
                subscription_status: 'active',
                subscription_id: subscriptionId,
                whop_plan_id: planId,
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
          console.log(`✅ Updated user_plans table with plan_type: ${planType}`, upsertData)
          userPlansUpdated = true
        }
      } catch (error) {
        console.error('❌ user_plans table error:', error)
      }
      
      // Verify the update
      if (!userPlansUpdated) {
        const { data: verifyPlan } = await supabase
          .from('user_plans')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
        
        if (verifyPlan) {
          userPlansUpdated = true
          console.log('✅ Verified user_plans table update:', verifyPlan)
        } else {
          console.warn('⚠️ Could not verify user_plans table update')
        }
      }

      // Final verification
      const { data: verifyUser } = await supabase.auth.admin.getUserById(user.id)
      const { data: verifyPlan } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      console.log(`✅ User ${user.email} upgraded to ${planType} plan`)
      console.log('📊 Verification:', {
        userId: user.id,
        userEmail: user.email,
        metadataPlanType: verifyUser?.user?.user_metadata?.plan_type,
        databasePlanType: verifyPlan?.plan_type,
        subscriptionStatus: verifyUser?.user?.user_metadata?.subscription_status,
        bothUpdated: verifyUser?.user?.user_metadata?.plan_type === planType && verifyPlan?.plan_type === planType
      })

      // Return success response with details
      return NextResponse.json({ 
        received: true,
        success: true,
        message: `User ${user.email} successfully upgraded to ${planType}`,
        user_id: user.id,
        user_email: user.email,
        plan_type: planType,
        plan_id: planId,
        subscription_id: subscriptionId,
        event_type: event.type,
        verified: verifyUser?.user?.user_metadata?.plan_type === planType && verifyPlan?.plan_type === planType
      })
    } else if (event.type === 'subscription.cancelled' || event.type === 'subscription.expired' || event.type === 'subscription.deactivated') {
      const customerEmail = event.data?.customer?.email || event.data?.customer_email || event.data?.email

      if (!customerEmail) {
        console.warn('No customer email in cancellation event')
        return NextResponse.json({ received: true })
      }

      const { data: users } = await supabase.auth.admin.listUsers()
      const user = users?.users.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase())

      if (user) {
        await supabase.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            plan: 'free',
            subscription_status: 'cancelled',
          },
        })

        try {
          await supabase.from('user_plans').update({
            plan_type: 'free',
            subscription_status: 'cancelled',
            updated_at: new Date().toISOString(),
          }).eq('user_id', user.id)
        } catch (error) {
          console.warn('user_plans table may not exist:', error)
        }

        console.log(`✅ User ${user.email} downgraded to Free plan`)
        
        return NextResponse.json({ 
          received: true,
          success: true,
          message: `User ${user.email} subscription cancelled`,
          user_id: user.id,
          user_email: user.email,
          event_type: event.type
        })
      } else {
        console.warn(`⚠️ User not found for cancellation email: ${customerEmail}`)
        return NextResponse.json({ 
          received: true,
          warning: `User not found for email: ${customerEmail}`,
          event_type: event.type
        })
      }
    }

    // Handle other event types
    console.log(`ℹ️ Unhandled event type: ${event.type}`)
    return NextResponse.json({ 
      received: true,
      message: 'Webhook received but event type not handled',
      event_type: event.type
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

