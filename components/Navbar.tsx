'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase'
import { useTheme } from '@/contexts/ThemeContext'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { theme } = useTheme()
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
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      setShowProfileMenu(false)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        alert(`Sign out failed: ${error.message}`)
      } else {
        setTimeout(() => {
          window.location.href = '/'
        }, 500)
      }
    } catch (error) {
      console.error('Unexpected error during sign out:', error)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass border-b border-[var(--border-primary)]">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group"
          onClick={() => setShowMobileMenu(false)}
        >
          <div className="relative h-12 w-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffd700] to-[#d4af37] rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity animate-glow"></div>
            <Image 
              src="https://media.discordapp.net/attachments/1049403383603273758/1437875664316399809/a4ea2ab422827bd939a023a7ff248ce5.webp?ex=6914d590&is=69138410&hm=4b163a993bcdbd87924ab3d6689abeae0f0a26e4ad260eb1f33a8875826cc361&=&format=webp&width=1022&height=1022" 
              alt="Duna Logo" 
              width={48}
              height={48}
              className="object-contain relative z-10 filter drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]"
              priority
              unoptimized
            />
          </div>
          <span className="text-xl font-bold text-gradient hidden sm:block glow-hover">Duna</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors relative group"
          >
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors relative group"
          >
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all duration-300 group-hover:w-full" />
          </Link>
          <a
            href="https://discord.gg/Duneworks"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors relative group"
          >
            Discord
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all duration-300 group-hover:w-full" />
          </a>
        </div>

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <div className="w-5 h-5 border-2 border-[var(--border-secondary)] border-t-[var(--accent-primary)] rounded-full animate-spin" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-primary)] hover:border-[var(--accent-primary)] transition-all duration-300 group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden lg:inline text-sm font-medium text-[var(--text-primary)] max-w-[120px] truncate">
                  {user.email?.split('@')[0] || 'User'}
                </span>
                <svg className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-56 premium-card z-50 overflow-hidden"
                  >
                    <div className="p-2">
                      <div className="px-4 py-3 text-xs text-[var(--text-secondary)] border-b border-[var(--border-primary)] truncate mb-1">
                        {user.email}
                      </div>
                      <Link
                        href="/chat"
                        onClick={() => {
                          setShowProfileMenu(false)
                          setShowMobileMenu(false)
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chat
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200 text-left"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors px-3"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="btn-primary text-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-elevated)] transition-all"
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
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden glass border-t border-[var(--border-primary)]"
          >
            <div className="px-4 py-4 space-y-2">
              <Link
                href="/"
                onClick={() => setShowMobileMenu(false)}
                className="block py-2.5 px-3 text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-elevated)] rounded-lg transition-all"
              >
                Home
              </Link>
              <Link
                href="/pricing"
                onClick={() => setShowMobileMenu(false)}
                className="block py-2.5 px-3 text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-elevated)] rounded-lg transition-all"
              >
                Pricing
              </Link>
              <a
                href="https://discord.gg/Duneworks"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowMobileMenu(false)}
                className="block py-2.5 px-3 text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-elevated)] rounded-lg transition-all"
              >
                Discord
              </a>
              
              {user ? (
                <>
                  <div className="pt-2 border-t border-[var(--border-primary)]">
                    <div className="px-3 py-2 text-xs text-[var(--text-secondary)] truncate mb-2">
                      {user.email}
                    </div>
                    <Link
                      href="/chat"
                      onClick={() => setShowMobileMenu(false)}
                      className="block py-2.5 px-3 text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-elevated)] rounded-lg transition-all"
                    >
                      Chat
                    </Link>
                    <button
                      onClick={() => {
                        setShowMobileMenu(false)
                        handleSignOut()
                      }}
                      className="w-full text-left py-2.5 px-3 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
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
                    className="block py-2.5 px-3 text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-elevated)] rounded-lg transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setShowMobileMenu(false)}
                    className="block w-full text-center py-2.5 btn-primary"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
