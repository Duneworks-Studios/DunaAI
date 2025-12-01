'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createSupabaseClient } from '@/lib/supabase'
import { useTheme } from '@/contexts/ThemeContext'
import type { User } from '@supabase/supabase-js'
import LoginModal from './LoginModal'
import PromoCodeModal from './PromoCodeModal'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showPromoCodeModal, setShowPromoCodeModal] = useState(false)
  const { theme } = useTheme()
  const router = useRouter()
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
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[var(--bg-primary)] border-b border-[var(--border-primary)]">
      <div className="max-w-7xl mx-auto h-full px-6 sm:px-8 lg:px-12 flex items-center justify-between">
        {/* Logo - Clean Design */}
        <Link 
          href="/" 
          className="flex items-center gap-3"
          onClick={() => setShowMobileMenu(false)}
        >
          <div className="relative h-10 w-10 flex items-center justify-center">
            <Image 
              src="/duneailogo.png" 
              alt="Duna Logo" 
              width={40}
              height={40}
              className="object-contain w-full h-full"
              priority
              unoptimized
            />
          </div>
          <span className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
            Duna
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
            Beta
          </span>
        </Link>

        {/* Center Navigation - Clean Layout */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="px-4 py-2 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            Home
          </Link>
          <button
            onClick={() => {
              if (user) {
                router.push('/chat')
              } else {
                setShowLoginModal(true)
              }
            }}
            className="px-4 py-2 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            Chat
          </button>
          <Link
            href="/pricing"
            className="px-4 py-2 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            Pricing
          </Link>
          <a
            href="https://discord.gg/Duneworks"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            Discord
          </a>
        </div>

        {/* Right Section - Modern Design */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-primary)] hover:border-[var(--border-secondary)] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-[var(--bg-primary)] font-semibold text-xs">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="hidden xl:inline text-sm font-medium text-[var(--text-primary)] max-w-[140px] truncate">
                  {user.email?.split('@')[0] || 'User'}
                </span>
                <svg 
                  className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown - Simple Design */}
              {showProfileMenu && (
                  <div
                    className="absolute right-0 top-full mt-2 w-64 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg overflow-hidden z-[100] shadow-lg"
                    onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                  >
                    <div className="p-3">
                      <div className="px-4 py-3 text-sm text-[var(--text-secondary)] border-b border-[var(--border-primary)] mb-2 break-all font-medium">
                        {user.email}
                      </div>
                      <Link
                        href="/chat"
                        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                          e.stopPropagation()
                          setShowProfileMenu(false)
                          setShowMobileMenu(false)
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chat
                      </Link>
                      <button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation()
                          setShowProfileMenu(false)
                          setShowPromoCodeModal(true)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        Redeem Promo Code
                      </button>
                      <button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation()
                          handleSignOut()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors text-left"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
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
            className="md:hidden p-2 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className={`w-6 h-6 transition-transform ${showMobileMenu ? 'rotate-90' : ''}`}
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
      </div>

      {/* Mobile Menu - Simple Design */}
      {showMobileMenu && (
          <div
            className="md:hidden overflow-hidden glass border-t border-[var(--border-primary)]"
          >
            <div className="px-4 py-4 space-y-1">
              <Link
                href="/"
                onClick={() => setShowMobileMenu(false)}
                className="block py-2 px-4 text-base font-medium text-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)] rounded-md transition-colors"
              >
                Home
              </Link>
              <button
                onClick={() => {
                  setShowMobileMenu(false)
                  if (user) {
                    router.push('/chat')
                  } else {
                    setShowLoginModal(true)
                  }
                }}
                className="w-full text-left py-2 px-4 text-base font-medium text-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)] rounded-md transition-colors"
              >
                Chat
              </button>
              <Link
                href="/pricing"
                onClick={() => setShowMobileMenu(false)}
                className="block py-2 px-4 text-base font-medium text-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)] rounded-md transition-colors"
              >
                Pricing
              </Link>
              <a
                href="https://discord.gg/Duneworks"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowMobileMenu(false)}
                className="block py-2 px-4 text-base font-medium text-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)] rounded-md transition-colors"
              >
                Discord
              </a>
              
              {user ? (
                <div className="pt-4 border-t border-[var(--border-primary)] mt-4">
                  <div className="px-4 py-2 text-xs text-[var(--text-secondary)] break-all mb-3 font-medium">
                    {user.email}
                  </div>
                  <Link
                    href="/chat"
                    onClick={() => setShowMobileMenu(false)}
                    className="block py-2 px-4 text-base font-medium text-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)] rounded-md transition-colors"
                  >
                    Chat
                  </Link>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false)
                      setShowPromoCodeModal(true)
                    }}
                    className="w-full text-left py-2 px-4 text-base font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-md transition-colors"
                  >
                    Redeem Promo Code
                  </button>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false)
                      handleSignOut()
                    }}
                    className="w-full text-left py-2 px-4 text-base font-medium text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-[var(--border-primary)] mt-4 space-y-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="block py-2 px-4 text-base font-medium text-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)] rounded-md transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setShowMobileMenu(false)}
                    className="block w-full text-center py-2 px-4 btn-primary rounded-md"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Click outside to close dropdown */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-[99]"
          onClick={() => {
            setShowProfileMenu(false)
          }}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setShowLoginModal(false)
          router.push('/chat')
        }}
      />

      {/* Promo Code Modal */}
      <PromoCodeModal
        isOpen={showPromoCodeModal}
        onClose={() => setShowPromoCodeModal(false)}
        user={user}
        onSuccess={() => {
          // Refresh the page to update user plan
          window.location.reload()
        }}
      />
    </nav>
  )
}
