import { createSupabaseClient } from './supabase'
import type { User } from '@supabase/supabase-js'

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

  // Check if user has Pro subscription (via Whop or database)
  // For now, we'll check a user_metadata field or a separate table
  // You can integrate with Whop API here to verify subscription status
  
  // Placeholder: Check user metadata for plan
  const userMetadata = user.user_metadata
  const isPro = userMetadata?.plan === 'pro' || userMetadata?.subscription_status === 'active'

  // Get today's message count
  const today = new Date().toISOString().split('T')[0]
  const { data: messages } = await supabase
    .from('user_messages')
    .select('id')
    .eq('user_id', user.id)
    .gte('created_at', today)

  const messagesUsed = messages?.length || 0

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

