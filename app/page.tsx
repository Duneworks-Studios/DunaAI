'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import Intro from '@/components/Intro'
import type { User } from '@supabase/supabase-js'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = useMemo(() => createSupabaseClient(), [])

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
        setLoading(false)
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
        // Use functional update to avoid dependency on user state
        setUser(prevUser => {
          if (session?.user?.id !== prevUser?.id) {
            return session?.user ?? null
          }
          return prevUser
        })
        setLoading(prevLoading => {
          if (prevLoading) return false
          return prevLoading
        })
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
  }, [supabase]) // Supabase is memoized, so this is safe

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

  return (
    <div className="overflow-x-hidden">
      <Intro />
    </div>
  )
}
