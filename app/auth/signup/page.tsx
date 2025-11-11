'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createSupabaseClient } from '@/lib/supabase'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // Auto-confirm the user (works when email confirmation is disabled in Supabase)
        data: {
          email_confirm: true,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Wait a moment for session to be established
    await new Promise(resolve => setTimeout(resolve, 300))

    // Check if we have a session (email confirmation disabled)
    if (data.user) {
      // Try to get the session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Session exists - user is logged in
        setLoading(false)
        router.push('/chat')
      } else if (data.user && !data.session) {
        // No session but user exists - email confirmation might be required
        // Try to sign in with the same credentials
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          // Email confirmation is required
          setError(null)
          setLoading(false)
          setSuccess(true)
          setTimeout(() => {
            router.push('/auth/login')
          }, 3000)
        } else if (signInData.session) {
          // Successfully signed in
          setLoading(false)
          router.push('/chat')
        } else {
          setLoading(false)
          setError('Account created. Please check your email to verify your account.')
          setTimeout(() => {
            router.push('/auth/login')
          }, 2000)
        }
      } else {
        // Fallback: redirect to login
        setLoading(false)
        setError('Account created. Please sign in to continue.')
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      }
    } else {
      // No user data - something went wrong
      setLoading(false)
      setError('Failed to create account. Please try again.')
    }
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    setError(null)

    // Get the correct redirect URL (use environment variable in production, localhost in dev)
    const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                       process.env.NEXTAUTH_URL || 
                       window.location.origin

    const { error: signUpError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${redirectUrl}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20 pt-[80px] bg-[#1a1a1a]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#2a2a2a] border border-[#444] rounded-lg p-6 sm:p-8"
      >
        <h1 className="font-display text-3xl font-bold text-[#EEEEEE] mb-2">Join Duna</h1>
        <p className="text-[#888888] mb-8 text-sm">Create your account to start your AI journey</p>

        {success && (
          <div className="mb-6 p-4 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-lg text-green-400 text-sm">
            Account created successfully! Please check your email to verify your account, then you can sign in.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#BBBBBB] mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#333] border border-[#444] rounded-lg text-[#EEEEEE] focus:outline-none focus:border-[#d4c4a0] focus:border-opacity-50 transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#BBBBBB] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#333] border border-[#444] rounded-lg text-[#EEEEEE] focus:outline-none focus:border-[#d4c4a0] focus:border-opacity-50 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#BBBBBB] mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#333] border border-[#444] rounded-lg text-[#EEEEEE] focus:outline-none focus:border-[#d4c4a0] focus:border-opacity-50 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-[#d4c4a0] bg-opacity-20 text-[#d4c4a0] font-semibold rounded-lg hover:bg-opacity-30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-[#444]"></div>
          <span className="px-4 text-sm text-[#888888]">or</span>
          <div className="flex-1 border-t border-[#444]"></div>
        </div>

        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full px-6 py-3 border border-[#444] text-[#BBBBBB] hover:border-[#d4c4a0] hover:text-[#d4c4a0] rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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

        <div className="mt-4 text-center">
          <span className="text-sm text-[#888888]">Already have an account? </span>
          <Link
            href="/auth/login"
            className="text-sm text-[#d4c4a0] hover:text-[#d4c4a0] hover:opacity-80 font-semibold transition-colors"
          >
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
