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
  const [logoError, setLogoError] = useState(false)
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
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 glass border-b-2 border-[rgba(255,215,0,0.3)]">
      <div className="max-w-7xl mx-auto h-full px-6 sm:px-8 lg:px-12 flex items-center justify-between">
        {/* Logo - Modern Design */}
        <Link 
          href="/" 
          className="flex items-center gap-4 group"
          onClick={() => setShowMobileMenu(false)}
        >
          <motion.div 
            className="relative h-16 w-16 flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Multi-layer Gold Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffd700] via-[#ffed4e] to-[#d4af37] rounded-2xl blur-2xl opacity-70 group-hover:opacity-90 transition-opacity animate-glow"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffd700] to-[#d4af37] rounded-xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
            
            {/* Logo Image */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              {!logoError ? (
                <Image 
                  src="/duna-logo.png" 
                  alt="Duna Logo" 
                  width={64}
                  height={64}
                  className="object-contain w-full h-full filter drop-shadow-[0_0_25px_rgba(255,215,0,0.9)] drop-shadow-[0_0_50px_rgba(212,175,55,0.6)]"
                  priority
                  unoptimized
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#ffd700] via-[#ffed4e] to-[#d4af37] rounded-xl"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-black text-black">D</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Rotating Gold Ring */}
            <motion.div
              className="absolute inset-0 border-2 border-[rgba(255,215,0,0.5)] rounded-xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
          
          {/* Brand Name - No box, just text */}
          <motion.span 
            className="text-2xl font-black text-gradient tracking-tight"
            whileHover={{ scale: 1.05 }}
          >
            Duna
          </motion.span>
        </Link>

        {/* Center Navigation - Modern Layout */}
        <div className="hidden lg:flex items-center gap-1">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[rgba(255,215,0,0.1)] transition-all duration-300 relative group"
          >
            Home
            <motion.span 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          </Link>
          <Link
            href="/pricing"
            className="px-6 py-3 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[rgba(255,215,0,0.1)] transition-all duration-300 relative group"
          >
            Pricing
            <motion.span 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          </Link>
          <a
            href="https://discord.gg/Duneworks"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[rgba(255,215,0,0.1)] transition-all duration-300 relative group"
          >
            Discord
            <motion.span 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          </a>
        </div>

        {/* Right Section - Modern Design */}
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-6 h-6 border-2 border-[var(--border-secondary)] border-t-[var(--accent-primary)] rounded-full animate-spin" />
          ) : user ? (
            <div className="relative">
              <motion.button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border-2 border-[rgba(255,215,0,0.3)] hover:border-[rgba(255,215,0,0.6)] transition-all duration-300 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-black font-bold text-sm shadow-lg glow">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden xl:inline text-sm font-semibold text-[var(--text-primary)] max-w-[140px] truncate">
                  {user.email?.split('@')[0] || 'User'}
                </span>
                <motion.svg 
                  className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  animate={{ rotate: showProfileMenu ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </motion.button>

              {/* Profile Dropdown - Modern Design */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
                    className="absolute right-0 top-full mt-3 w-64 premium-card glass-strong overflow-hidden z-[100]"
                    onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                  >
                    <div className="p-3">
                      <div className="px-4 py-3 text-sm text-[var(--text-secondary)] border-b-2 border-[rgba(255,215,0,0.2)] mb-2 break-all font-medium">
                        {user.email}
                      </div>
                      <Link
                        href="/chat"
                        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                          e.stopPropagation()
                          setShowProfileMenu(false)
                          setShowMobileMenu(false)
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:bg-[rgba(255,215,0,0.1)] rounded-xl transition-all duration-200 cursor-pointer relative z-10 group"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chat
                      </Link>
                      <button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation()
                          handleSignOut()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--text-primary)] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 text-left cursor-pointer relative z-10 group"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="btn-primary text-sm px-6 py-2.5"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[rgba(255,215,0,0.1)] transition-all"
            aria-label="Toggle menu"
          >
            <motion.svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              stroke="currentColor"
              animate={{ rotate: showMobileMenu ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {showMobileMenu ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </motion.svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Modern Design */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden glass border-t-2 border-[rgba(255,215,0,0.3)]"
          >
            <div className="px-6 py-6 space-y-2">
              <Link
                href="/"
                onClick={() => setShowMobileMenu(false)}
                className="block py-3 px-4 text-base font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:bg-[rgba(255,215,0,0.1)] rounded-xl transition-all"
              >
                Home
              </Link>
              <Link
                href="/pricing"
                onClick={() => setShowMobileMenu(false)}
                className="block py-3 px-4 text-base font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:bg-[rgba(255,215,0,0.1)] rounded-xl transition-all"
              >
                Pricing
              </Link>
              <a
                href="https://discord.gg/Duneworks"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowMobileMenu(false)}
                className="block py-3 px-4 text-base font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:bg-[rgba(255,215,0,0.1)] rounded-xl transition-all"
              >
                Discord
              </a>
              
              {user ? (
                <div className="pt-4 border-t-2 border-[rgba(255,215,0,0.2)] mt-4">
                  <div className="px-4 py-2 text-xs text-[var(--text-secondary)] break-all mb-3 font-medium">
                    {user.email}
                  </div>
                  <Link
                    href="/chat"
                    onClick={() => setShowMobileMenu(false)}
                    className="block py-3 px-4 text-base font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:bg-[rgba(255,215,0,0.1)] rounded-xl transition-all"
                  >
                    Chat
                  </Link>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false)
                      handleSignOut()
                    }}
                    className="w-full text-left py-3 px-4 text-base font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t-2 border-[rgba(255,215,0,0.2)] mt-4 space-y-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="block py-3 px-4 text-base font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:bg-[rgba(255,215,0,0.1)] rounded-xl transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setShowMobileMenu(false)}
                    className="block w-full text-center py-3 btn-primary"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close dropdown */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-[99]"
          onClick={() => {
            setShowProfileMenu(false)
          }}
        />
      )}
    </nav>
  )
}
