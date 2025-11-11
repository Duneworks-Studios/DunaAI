import { createSupabaseClient } from './supabase'
import type { User } from '@supabase/supabase-js'

// Client-side message count helper (for localStorage fallback)
function getLocalMessageCount(userId: string): number {
  if (typeof window === 'undefined') return 0
  const today = new Date().toISOString().split('T')[0]
  const storageKey = `messages_${userId}_${today}`
  const stored = localStorage.getItem(storageKey)
  return stored ? parseInt(stored, 10) : 0
}

export type PlanType = 'free' | 'pro'

export interface UserPlan {
  type: PlanType
  messagesUsed: number
  messagesLimit: number
  isUnlimited: boolean
}

// Check user's plan status
export async function getUserPlan(user: User | null): Promise<UserPlan> {
  if (!user) {
    return {
      type: 'free',
      messagesUsed: 0,
      messagesLimit: 20,
      isUnlimited: false,
    }
  }

  const supabase = createSupabaseClient()

  // Check if user has Pro subscription
  // Priority: 1. Database table, 2. User metadata
  let isPro = false
  
  // First, check user_plans table if it exists
  try {
    const { data: planData, error: planError } = await supabase
      .from('user_plans')
      .select('plan_type, subscription_status')
      .eq('user_id', user.id)
      .maybeSingle() // Use maybeSingle() instead of single() to handle no rows gracefully

    if (!planError && planData) {
      // Check for pro or pro_lifetime plan types
      const planType = planData.plan_type
      const status = planData.subscription_status
      
      isPro = (planType === 'pro' || planType === 'pro_lifetime') && 
              status === 'active'
      
      console.log('📊 User plans table check:', { planType, status, isPro, planData })
      
      if (isPro) {
        console.log('✅ Premium plan detected from user_plans table:', planData)
      } else {
        console.log('ℹ️ User plans table shows:', planData, 'but not premium')
      }
    } else if (planError) {
      // Check if it's a "not found" error (which is OK) vs a real error
      if (planError.code !== 'PGRST116' && planError.message !== 'JSON object requested, multiple (or no) rows returned') {
        console.warn('⚠️ Error checking user_plans:', planError)
      } else {
        console.log('ℹ️ No plan found in user_plans table (user might be on free plan)')
      }
    }
  } catch (error) {
    // Table might not exist, continue to check metadata
    console.warn('⚠️ Error accessing user_plans table:', error)
  }

  // Fallback to user metadata (raw_user_meta_data in database)
  if (!isPro) {
    const userMetadata = user.user_metadata || {}
    const plan = userMetadata.plan
    const planType = userMetadata.plan_type
    const status = userMetadata.subscription_status
    
    isPro = plan === 'pro' || 
            status === 'active' ||
            planType === 'pro' ||
            planType === 'pro_lifetime'
    
    console.log('📊 User metadata check:', { plan, planType, status, isPro, fullMetadata: userMetadata })
    
    if (isPro) {
      console.log('✅ Premium plan detected from user_metadata:', userMetadata)
    } else {
      console.log('ℹ️ User metadata does not show premium:', userMetadata)
      console.log('ℹ️ Plan:', plan, 'Plan Type:', planType, 'Status:', status)
    }
  }
  
  // Final check - if still not pro, log for debugging
  if (!isPro) {
    console.log('❌ User is NOT detected as premium')
    console.log('User ID:', user.id)
    console.log('User Email:', user.email)
  } else {
    console.log('✅ User IS detected as premium')
  }

  // Get today's message count
  const today = new Date().toISOString().split('T')[0]
  let messagesUsed = 0
  
  try {
    const { data: messages, error, count } = await supabase
      .from('user_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today)

    if (error) {
      // Check if it's a table not found error
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        console.warn('⚠️ user_messages table not found. Using localStorage fallback.')
        // Fallback to localStorage for message counting (client-side only)
        messagesUsed = getLocalMessageCount(user.id)
      } else {
        console.warn('Error fetching message count:', error)
        // Try localStorage fallback
        messagesUsed = getLocalMessageCount(user.id)
      }
    } else {
      // Use count if available (from head: true), otherwise use array length
      messagesUsed = count !== null ? count : (messages?.length || 0)
    }
  } catch (error) {
    console.warn('Error in getUserPlan:', error)
    messagesUsed = 0
  }

  if (isPro) {
    return {
      type: 'pro',
      messagesUsed,
      messagesLimit: Infinity,
      isUnlimited: true,
    }
  }

  return {
    type: 'free',
    messagesUsed,
    messagesLimit: 20,
    isUnlimited: false,
  }
}

// Check if user can send a message
export async function canSendMessage(user: User | null): Promise<{ canSend: boolean; reason?: string }> {
  const plan = await getUserPlan(user)

  if (plan.isUnlimited) {
    return { canSend: true }
  }

  if (plan.messagesUsed >= plan.messagesLimit) {
    return {
      canSend: false,
      reason: 'You\'ve reached your daily limit. Upgrade to Duna Pro for unlimited access.',
    }
  }

  return { canSend: true }
}

