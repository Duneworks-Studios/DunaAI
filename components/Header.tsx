'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }
    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 premium-border border-b border-dune-gold/20 bg-dune-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.span
            className="font-display text-2xl font-bold text-gradient"
            whileHover={{ scale: 1.05 }}
          >
            Duna
          </motion.span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-dune-sand-light hover:text-dune-gold transition-colors duration-300"
          >
            Home
          </Link>
          <Link
            href="/chat"
            className="text-dune-sand-light hover:text-dune-gold transition-colors duration-300"
          >
            Chat with Duna
          </Link>
          <Link
            href="#pricing"
            className="text-dune-sand-light hover:text-dune-gold transition-colors duration-300"
          >
            Pricing
          </Link>
        </nav>

        {/* Right side - Discord & Auth */}
        <div className="flex items-center gap-4">
          {/* Discord Link */}
          <motion.a
            href="https://discord.gg/Duneworks"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-dune-sand-light hover:text-dune-gold transition-colors duration-300 group"
            whileHover={{ scale: 1.05 }}
          >
            <svg
              className="w-6 h-6 group-hover:drop-shadow-[0_0_8px_rgba(201,169,97,0.6)] transition-all duration-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.007-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928-1.793 6.4-3.498 6.4-3.498a.07.07 0 0 0 .031-.056c.004-.1-.015-.2-.056-.292a11.93 11.93 0 0 0-1.019-1.644.077.077 0 0 1 .01-.078c.12-.17.24-.34.35-.52a.074.074 0 0 1 .06-.033c2.56.19 5.1.19 7.62 0a.074.074 0 0 1 .061.033c.109.18.228.35.35.52a.077.077 0 0 1 .01.078 12.08 12.08 0 0 0-1.02 1.644.077.077 0 0 0-.025.292c.002.02.01.04.031.056 0 0 2.47 1.705 6.4 3.498a.077.077 0 0 0 .078.01 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span className="hidden sm:inline text-sm font-medium">Join Community</span>
          </motion.a>

          {/* Auth Section */}
          {loading ? (
            <div className="w-8 h-8 border-2 border-dune-gold/30 border-t-dune-gold rounded-full animate-spin" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-dune-gold/20 flex items-center justify-center text-dune-gold font-semibold">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden md:inline text-sm text-dune-sand-light">
                  {user.email?.split('@')[0] || 'User'}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 premium-border text-dune-sand-light hover:text-dune-gold hover:border-dune-gold/50 rounded-lg text-sm transition-all duration-300"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-4 py-2 premium-border text-dune-sand-light hover:text-dune-gold hover:border-dune-gold/50 rounded-lg text-sm transition-all duration-300"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-dune-gold text-dune-black hover:bg-dune-gold-light rounded-lg text-sm font-semibold transition-all duration-300"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

