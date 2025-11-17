'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// Removed framer-motion for better performance
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess?: () => void
}

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    if (data.user && data.session) {
      setLoading(false)
      onClose()
      if (onLoginSuccess) {
        onLoginSuccess()
      } else {
        router.push('/chat')
      }
    } else {
      setError('Failed to create session. Please try again.')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                       process.env.NEXTAUTH_URL || 
                       window.location.origin

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${redirectUrl}/auth/callback?redirect=/chat`,
      },
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative premium-card glass-strong max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto z-[201]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gradient-gold mb-2">Sign In Required</h2>
            <p className="text-[var(--text-secondary)] mb-6 text-sm">
              Please sign in to access the chat feature.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-4 mb-4">
              <div>
                <label htmlFor="modal-email" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Email
                </label>
                <input
                  id="modal-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:border-opacity-50 transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="modal-password" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Password
                </label>
                <input
                  id="modal-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:border-opacity-50 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-sm py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="my-4 flex items-center">
              <div className="flex-1 border-t border-[var(--border-primary)]"></div>
              <span className="px-4 text-sm text-[var(--text-secondary)]">or</span>
              <div className="flex-1 border-t border-[var(--border-primary)]"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full px-6 py-3 border border-[var(--border-primary)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="text-center space-y-2">
              <Link
                href="/auth/forgot-password"
                onClick={onClose}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors block"
              >
                Forgot password?
              </Link>
              <div>
                <span className="text-sm text-[var(--text-secondary)]">Don't have an account? </span>
                <Link
                  href="/auth/signup"
                  onClick={onClose}
                  className="text-sm text-[var(--accent-primary)] hover:opacity-80 font-semibold transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-4 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors text-sm"
            >
              Cancel
            </button>
        </div>
      </div>
    </div>
  )
}

