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
  const [showMobileMenu, setShowMobileMenu] = useState(false)
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
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center hover:opacity-80 transition-opacity"
          onClick={() => setShowMobileMenu(false)}
        >
          <div className="relative h-8 w-8 sm:h-10 sm:w-10 flex items-center">
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

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
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

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          {loading ? (
            <div className="w-5 h-5 border-2 border-[#888] border-t-[#d4c4a0] rounded-full animate-spin" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 text-[#BBBBBB] hover:text-[#d4c4a0] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#d4c4a0] bg-opacity-20 flex items-center justify-center text-[#d4c4a0] font-semibold text-sm">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden lg:inline text-sm truncate max-w-[120px]">{user.email?.split('@')[0] || 'User'}</span>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-[#2a2a2a] border border-[#333] rounded-lg overflow-hidden shadow-lg z-50"
                >
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs sm:text-sm text-[#BBBBBB] border-b border-[#333] truncate">
                      {user.email}
                    </div>
                    <Link
                      href="/chat"
                      onClick={() => {
                        setShowProfileMenu(false)
                        setShowMobileMenu(false)
                      }}
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
                className="text-[#BBBBBB] hover:text-[#d4c4a0] transition-colors text-sm font-medium px-2"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#d4c4a0] bg-opacity-20 text-[#d4c4a0] rounded-lg text-sm font-medium hover:bg-opacity-30 transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden p-2 text-[#BBBBBB] hover:text-[#d4c4a0] transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {showMobileMenu ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-full left-0 right-0 bg-[#222] border-b border-[#333] shadow-lg"
        >
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/"
              onClick={() => setShowMobileMenu(false)}
              className="block py-2 text-[#BBBBBB] hover:text-[#d4c4a0] transition-colors text-sm font-medium"
            >
              Home
            </Link>
            <Link
              href="/pricing"
              onClick={() => setShowMobileMenu(false)}
              className="block py-2 text-[#BBBBBB] hover:text-[#d4c4a0] transition-colors text-sm font-medium"
            >
              Pricing
            </Link>
            <a
              href="https://discord.gg/Duneworks"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowMobileMenu(false)}
              className="block py-2 text-[#BBBBBB] hover:text-[#d4c4a0] transition-colors text-sm font-medium"
            >
              Discord
            </a>
            {user ? (
              <>
                <Link
                  href="/chat"
                  onClick={() => setShowMobileMenu(false)}
                  className="block py-2 text-[#BBBBBB] hover:text-[#d4c4a0] transition-colors text-sm font-medium"
                >
                  Chat
                </Link>
                <div className="pt-2 border-t border-[#333]">
                  <div className="px-2 py-2 text-xs text-[#888888] truncate mb-2">
                    {user.email}
                  </div>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false)
                      handleSignOut()
                    }}
                    className="w-full text-left py-2 px-2 text-sm text-[#BBBBBB] hover:text-[#d4c4a0] transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="block py-2 text-[#BBBBBB] hover:text-[#d4c4a0] transition-colors text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setShowMobileMenu(false)}
                  className="block w-full text-center py-2 bg-[#d4c4a0] bg-opacity-20 text-[#d4c4a0] rounded-lg text-sm font-medium hover:bg-opacity-30 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Click outside to close dropdowns */}
      {(showProfileMenu || showMobileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileMenu(false)
            setShowMobileMenu(false)
          }}
        />
      )}
    </nav>
  )
}

