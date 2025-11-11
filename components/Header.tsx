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
  const { theme, toggleTheme } = useTheme()
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
            className={`w-16 h-16 rounded-full premium-border flex items-center justify-center backdrop-blur-md transition-all duration-300 ${
              theme === 'gray' 
                ? 'bg-gray-dark/90 border-gray-mid/40 hover:border-gray-light/60' 
                : 'bg-dune-black-soft/90 border-dune-gold/30 hover:border-dune-gold/50'
            } ${isExpanded ? 'scale-110' : ''}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {user ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-mid to-gray-dark flex items-center justify-center text-gray-white-gray font-semibold text-sm">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            ) : (
              <span className="text-xl">☰</span>
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
                      className={`w-14 h-14 rounded-full premium-border flex items-center justify-center backdrop-blur-md transition-all duration-300 ${
                        theme === 'gray'
                          ? 'bg-gray-dark/90 border-gray-mid/40 hover:border-gray-light/60 hover:bg-gray-dark'
                          : 'bg-dune-black-soft/90 border-dune-gold/30 hover:border-dune-gold/50 hover:bg-dune-black-soft'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                    </Link>
                    {/* Tooltip */}
                    <div className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
                      theme === 'gray'
                        ? 'bg-gray-dark/95 text-gray-white-gray border border-gray-mid/30'
                        : 'bg-dune-black-soft/95 text-dune-sand-light border border-dune-gold/30'
                    }`}>
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
                    className={`w-14 h-14 rounded-full premium-border flex items-center justify-center backdrop-blur-md transition-all duration-300 ${
                      theme === 'gray'
                        ? 'bg-gray-dark/90 border-gray-mid/40 hover:border-gray-light/60 hover:bg-gray-dark'
                        : 'bg-dune-black-soft/90 border-dune-gold/30 hover:border-dune-gold/50 hover:bg-dune-black-soft'
                    }`}
                  >
                    <span className="text-lg">{theme === 'gray' ? '☀️' : '🌑'}</span>
                  </button>
                  <div className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
                    theme === 'gray'
                      ? 'bg-gray-dark/95 text-gray-white-gray border border-gray-mid/30'
                      : 'bg-dune-black-soft/95 text-dune-sand-light border border-dune-gold/30'
                  }`}>
                    {theme === 'gray' ? 'Dune Theme' : 'Gray Theme'}
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
                      className={`w-14 h-14 rounded-full premium-border flex items-center justify-center backdrop-blur-md transition-all duration-300 ${
                        theme === 'gray'
                          ? 'bg-gray-dark/90 border-gray-mid/40 hover:border-gray-light/60'
                          : 'bg-dune-black-soft/90 border-dune-gold/30 hover:border-dune-gold/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                        theme === 'gray'
                          ? 'bg-gray-mid text-gray-dark'
                          : 'bg-dune-gold/30 text-dune-gold'
                      }`}>
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
                          className={`absolute right-0 top-full mt-2 w-48 rounded-lg backdrop-blur-md ${
                            theme === 'gray'
                              ? 'bg-gray-dark/95 border border-gray-mid/30'
                              : 'bg-dune-black-soft/95 border border-dune-gold/30'
                          }`}
                        >
                          <div className="p-2">
                            <div className={`px-3 py-2 text-sm ${
                              theme === 'gray' ? 'text-gray-light' : 'text-dune-sand-light'
                            }`}>
                              {user.email}
                            </div>
                            <Link
                              href="/profile"
                              onClick={() => setShowProfileMenu(false)}
                              className={`block px-3 py-2 text-sm rounded hover:bg-opacity-50 transition-colors ${
                                theme === 'gray'
                                  ? 'text-gray-white-gray hover:bg-gray-mid/20'
                                  : 'text-dune-sand-light hover:bg-dune-gold/10'
                              }`}
                            >
                              Profile
                            </Link>
                            <Link
                              href="/settings"
                              onClick={() => setShowProfileMenu(false)}
                              className={`block px-3 py-2 text-sm rounded hover:bg-opacity-50 transition-colors ${
                                theme === 'gray'
                                  ? 'text-gray-white-gray hover:bg-gray-mid/20'
                                  : 'text-dune-sand-light hover:bg-dune-gold/10'
                              }`}
                            >
                              Settings
                            </Link>
                            <button
                              onClick={handleSignOut}
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-opacity-50 transition-colors ${
                                theme === 'gray'
                                  ? 'text-gray-white-gray hover:bg-gray-mid/20'
                                  : 'text-dune-sand-light hover:bg-dune-gold/10'
                              }`}
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
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (navItems.length + 1) * 0.05 }}
                      className="relative group"
                    >
                      <Link
                        href="/auth/login"
                        onClick={() => setIsExpanded(false)}
                        className={`w-14 h-14 rounded-full premium-border flex items-center justify-center backdrop-blur-md transition-all duration-300 ${
                          theme === 'gray'
                            ? 'bg-gray-dark/90 border-gray-mid/40 hover:border-gray-light/60'
                            : 'bg-dune-black-soft/90 border-dune-gold/30 hover:border-dune-gold/50'
                        }`}
                      >
                        <span className="text-sm font-semibold">Login</span>
                      </Link>
                    </motion.div>
                  </>
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
