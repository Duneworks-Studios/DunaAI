'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Hero() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleGetStarted = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    if (user) {
      router.push('/chat')
    } else {
      router.push('/auth/signup')
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[var(--accent-primary)] opacity-[0.03] blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[var(--accent-secondary)] opacity-[0.02] blur-3xl animate-float" style={{ animationDelay: '-3s' }}></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-secondary)] mb-6 sm:mb-10">
            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[var(--accent-primary)]"></span>
            <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] tracking-wider uppercase">
              Premium AI Browser
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[12rem] font-black mb-6 sm:mb-8 leading-[0.9]">
            <span className="text-gradient block mb-2 sm:mb-4">
              Duna
            </span>
            <span className="text-[var(--text-primary)] text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light block">
              Intelligence
            </span>
          </h1>
          
          <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-light mb-4 sm:mb-8 text-[var(--accent-primary)] max-w-4xl mx-auto leading-relaxed px-4">
            The Premium AI Browser Reimagined
          </p>
          
          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-16 max-w-3xl mx-auto text-[var(--text-secondary)] leading-relaxed px-4">
            Experience the future of intelligent browsing. Designed for those who demand performance, elegance, and precision.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-20 px-4">
            <a
              href={user ? '/chat' : '/auth/signup'}
              onClick={handleGetStarted}
              className="btn-primary text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 w-full sm:w-auto"
            >
              Get Started Free
            </a>
            
            <a
              href={process.env.NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 w-full sm:w-auto"
            >
              Upgrade to Pro
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 text-sm sm:text-base md:text-lg px-4">
            {[
              { text: 'Unlimited Messages' },
              { text: 'Premium AI Agents' },
              { text: '24/7 Support' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 sm:gap-3"
              >
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent-primary)]" 
                  fill="none" 
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium text-[var(--text-secondary)]">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
