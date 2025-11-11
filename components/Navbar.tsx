'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Navbar: Session error:', error)
        }
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Navbar: Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }
    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Navbar auth state changed:', !!session?.user)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      console.log('Starting sign out process...')
      setShowProfileMenu(false)

      // Check if we have a valid Supabase client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
        console.error('Supabase not properly configured. Please check your .env.local file.')
        alert('Sign out failed: Supabase not configured. Please check your environment variables.')
        return
      }

      console.log('Calling supabase.auth.signOut()...')
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Sign out error:', error)
        alert(`Sign out failed: ${error.message}`)
      } else {
        console.log('Sign out successful, waiting for auth state change...')
        // Force a page reload after a short delay to ensure clean state
        setTimeout(() => {
          console.log('Redirecting to home page...')
          window.location.href = '/'
        }, 500)
      }
    } catch (error) {
      console.error('Unexpected error during sign out:', error)
      alert('An unexpected error occurred during sign out.')
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-[#222] bg-opacity-95 backdrop-blur-sm border-b border-[#333]">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <div className="relative h-10 w-10 flex items-center">
            <Image 
              src="https://media.discordapp.net/attachments/1049403383603273758/1437875664316399809/a4ea2ab422827bd939a023a7ff248ce5.webp?ex=6914d590&is=69138410&hm=4b163a993bcdbd87924ab3d6689abeae0f0a26e4ad260eb1f33a8875826cc361&=&format=webp&width=1022&height=1022" 
              alt="Duna Logo" 
              width={40}
              height={40}
              className="object-contain"
              priority
              unoptimized
            />
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-[#BBBBBB] hover:text-[#d4c4a0] transition-colors text-sm font-medium relative group"
          >
            Home
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#d4c4a0] transition-all group-hover:w-full" />
          </Link>
          <Link
            href="/pricing"
            className="text-[#BBBBBB] hover:text-[#d4c4a0] transition-colors text-sm font-medium relative group"
          >
            Pricing
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#d4c4a0] transition-all group-hover:w-full" />
          </Link>
          <a
            href="https://discord.gg/Duneworks"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#BBBBBB] hover:text-[#d4c4a0] transition-colors text-sm font-medium relative group"
          >
            Discord
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#d4c4a0] transition-all group-hover:w-full" />
          </a>
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-6 h-6 border-2 border-[#888] border-t-[#d4c4a0] rounded-full animate-spin" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 text-[#BBBBBB] hover:text-[#d4c4a0] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#d4c4a0] bg-opacity-20 flex items-center justify-center text-[#d4c4a0] font-semibold text-sm">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:inline text-sm">{user.email?.split('@')[0] || 'User'}</span>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-[#2a2a2a] border border-[#333] rounded-lg overflow-hidden"
                >
                  <div className="p-2">
                    <div className="px-3 py-2 text-sm text-[#BBBBBB] border-b border-[#333]">
                      {user.email}
                    </div>
                    <Link
                      href="/chat"
                      onClick={() => setShowProfileMenu(false)}
                      className="block px-3 py-2 text-sm text-[#BBBBBB] hover:text-[#d4c4a0] hover:bg-[#333] transition-colors"
                    >
                      Chat
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-sm text-[#BBBBBB] hover:text-[#d4c4a0] hover:bg-[#333] transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-[#BBBBBB] hover:text-[#d4c4a0] transition-colors text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-[#d4c4a0] bg-opacity-20 text-[#d4c4a0] rounded-lg text-sm font-medium hover:bg-opacity-30 transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </nav>
  )
}

