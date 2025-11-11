'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useTheme } from '@/contexts/ThemeContext'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const { theme, toggleTheme, isDark } = useTheme()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
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
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setShowProfileMenu(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navItems = [
    { href: '/', label: 'Home', icon: '⌂' },
    { href: '/chat', label: 'Chat', icon: '💬' },
    { href: '#pricing', label: 'Pricing', icon: '💳' },
  ]

  return (
    <>
      {/* Circular Floating Navbar */}
      <motion.nav
        className="fixed top-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div className="relative">
          {/* Main Circle */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-16 h-16 rounded-full premium-card glass flex items-center justify-center transition-all duration-300 ${
              isExpanded ? 'scale-110' : ''
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {user ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white font-semibold text-sm">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            ) : (
              <span className="text-xl text-[var(--text-primary)]">☰</span>
            )}
          </motion.button>

          {/* Expanded Menu Items */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="absolute top-0 right-0 flex flex-col gap-3"
              >
                {/* Navigation Items */}
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group"
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsExpanded(false)}
                      className="w-14 h-14 rounded-full premium-card glass flex items-center justify-center transition-all duration-300 hover:scale-110"
                    >
                      <span className="text-lg">{item.icon}</span>
                    </Link>
                    {/* Tooltip */}
                    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none premium-card glass">
                      {item.label}
                    </div>
                  </motion.div>
                ))}

                {/* Theme Toggle */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.05 }}
                  className="relative group"
                >
                  <button
                    onClick={toggleTheme}
                    className="w-14 h-14 rounded-full premium-card glass flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
                  </button>
                  <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none premium-card glass">
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </div>
                </motion.div>

                {/* Profile Menu (if logged in) */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navItems.length + 1) * 0.05 }}
                    className="relative"
                  >
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="w-14 h-14 rounded-full premium-card glass flex items-center justify-center transition-all duration-300 hover:scale-110"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white text-xs font-semibold">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </button>
                    
                    {/* Profile Dropdown */}
                    <AnimatePresence>
                      {showProfileMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 top-full mt-2 w-48 premium-card glass-strong rounded-lg overflow-hidden"
                        >
                          <div className="p-2">
                            <div className="px-3 py-2 text-sm text-[var(--text-secondary)] border-b border-[var(--border-primary)]">
                              {user.email}
                            </div>
                            <Link
                              href="/profile"
                              onClick={() => setShowProfileMenu(false)}
                              className="block px-3 py-2 text-sm text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-elevated)] rounded transition-colors"
                            >
                              Profile
                            </Link>
                            <Link
                              href="/settings"
                              onClick={() => setShowProfileMenu(false)}
                              className="block px-3 py-2 text-sm text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-elevated)] rounded transition-colors"
                            >
                              Settings
                            </Link>
                            <button
                              onClick={handleSignOut}
                              className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            >
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* Auth Buttons (if not logged in) */}
                {!user && !loading && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navItems.length + 1) * 0.05 }}
                    className="relative group"
                  >
                    <Link
                      href="/auth/login"
                      onClick={() => setIsExpanded(false)}
                      className="w-14 h-14 rounded-full premium-card glass flex items-center justify-center transition-all duration-300 hover:scale-110"
                    >
                      <span className="text-sm font-semibold text-[var(--text-primary)]">Login</span>
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Click outside to close */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsExpanded(false)
            setShowProfileMenu(false)
          }}
        />
      )}
    </>
  )
}
