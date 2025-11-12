'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import Intro from '@/components/Intro'
import type { User } from '@supabase/supabase-js'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    let mounted = true
    let subscription: { unsubscribe: () => void } | null = null

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (!mounted) return
        
        if (error) {
          console.error('Error getting session:', error)
          setError('Failed to load session')
          setLoading(false)
          return
        }
        
        setUser(session?.user ?? null)
        if (session?.user) {
          // Small delay to ensure session is fully established
          setTimeout(() => {
            if (mounted) {
              router.push('/chat')
            }
          }, 100)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        if (mounted) {
          setError('An error occurred')
          setLoading(false)
        }
      }
    }
    
    getSession()

    try {
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return
        console.log('Auth state changed on home page:', _event, !!session?.user)
        setUser(session?.user ?? null)
        if (session?.user) {
          // Don't redirect immediately - let the session establish
          setTimeout(() => {
            if (mounted) {
              router.push('/chat')
            }
          }, 100)
        } else {
          setLoading(false)
        }
      })
      subscription = authSubscription
    } catch (error) {
      console.error('Error setting up auth listener:', error)
      setLoading(false)
    }

    return () => {
      mounted = false
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center overflow-hidden">
        <div className="w-8 h-8 border-2 border-[#888] border-t-[#d4c4a0] rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center overflow-hidden px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[var(--accent-primary)] text-black rounded-lg font-semibold"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to /chat
  }

  return (
    <div className="overflow-x-hidden">
      <Intro />
    </div>
  )
}
