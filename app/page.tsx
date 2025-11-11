'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import Intro from '@/components/Intro'
import type { User } from '@supabase/supabase-js'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }
        setUser(session?.user ?? null)
        if (session?.user) {
          // Small delay to ensure session is fully established
          setTimeout(() => {
            router.push('/chat')
          }, 100)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }
    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed on home page:', _event, !!session?.user)
      setUser(session?.user ?? null)
      if (session?.user) {
        // Don't redirect immediately - let the session establish
        setTimeout(() => {
          router.push('/chat')
        }, 100)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#888] border-t-[#d4c4a0] rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    return null // Will redirect to /chat
  }

  return <Intro />
}
