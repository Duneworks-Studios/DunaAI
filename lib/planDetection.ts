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
      .single()

    if (!planError && planData) {
      // Check for pro or pro_lifetime plan types
      isPro = (planData.plan_type === 'pro' || planData.plan_type === 'pro_lifetime') && 
              planData.subscription_status === 'active'
      
      if (isPro) {
        console.log('✅ Premium plan detected from user_plans table:', planData)
      }
    } else if (planError) {
      console.warn('Error checking user_plans:', planError)
    }
  } catch (error) {
    // Table might not exist, continue to check metadata
    console.warn('Error accessing user_plans table:', error)
  }

  // Fallback to user metadata
  if (!isPro) {
    const userMetadata = user.user_metadata
    isPro = userMetadata?.plan === 'pro' || 
            userMetadata?.subscription_status === 'active' ||
            userMetadata?.plan_type === 'pro' ||
            userMetadata?.plan_type === 'pro_lifetime'
    
    if (isPro) {
      console.log('✅ Premium plan detected from user_metadata:', userMetadata)
    } else {
      console.log('ℹ️ User metadata:', userMetadata)
      console.log('ℹ️ Checking plan_type:', userMetadata?.plan_type)
    }
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

