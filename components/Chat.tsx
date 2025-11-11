'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase'
import { getUserPlan, canSendMessage, type UserPlan } from '@/lib/planDetection'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function Chat() {
  const [user, setUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createSupabaseClient()

  useEffect(() => {
    // Get user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserPlan(session.user)
        loadMessages(session.user.id)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserPlan(session.user)
        loadMessages(session.user.id)
      } else {
        setMessages([])
        setUserPlan(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadUserPlan = async (user: User) => {
    const plan = await getUserPlan(user)
    setUserPlan(plan)
  }

  const loadMessages = async (userId: string) => {
    // Load messages from localStorage or Supabase
    const stored = localStorage.getItem(`chat_${userId}`)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })))
      } catch (e) {
        console.error('Error loading messages:', e)
      }
    }
  }

  const saveMessages = async (userId: string, newMessages: Message[]) => {
    // Save to localStorage
    localStorage.setItem(`chat_${userId}`, JSON.stringify(newMessages))
    
    // Optionally save to Supabase
    // await supabase.from('chat_messages').upsert(...)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    if (!user) {
      // Redirect to login
      window.location.href = '/auth/login'
      return
    }

    // Check if user can send message
    const { canSend, reason } = await canSendMessage(user)
    if (!canSend) {
      setShowUpgrade(true)
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    if (user) {
      await saveMessages(user.id, newMessages)
    }

    // Call AI endpoint (placeholder)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userId: user.id,
        }),
      })

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      }

      const updatedMessages = [...newMessages, aiMessage]
      setMessages(updatedMessages)

      if (user) {
        await saveMessages(user.id, updatedMessages)
        // Update message count
        await supabase.from('user_messages').insert({
          user_id: user.id,
          created_at: new Date().toISOString(),
        })
        loadUserPlan(user)
      }
    } catch (error) {
      console.error('Error calling AI:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again later.',
        timestamp: new Date(),
      }
      setMessages([...newMessages, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center premium-card max-w-md"
        >
          <h2 className="font-display text-3xl font-bold text-gradient mb-4">
            Sign In Required
          </h2>
          <p className="text-dune-sand-light mb-6">
            Please sign in to start chatting with Duna AI.
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-3 bg-dune-gold text-dune-black font-semibold rounded-lg hover:bg-dune-gold-light glow-gold-hover transition-all duration-300"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col pt-20">
      {/* Header */}
      <div className="premium-border border-b border-dune-gold/20 bg-dune-black/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-gradient">Chat with Duna</h1>
            {userPlan && (
              <p className="text-sm text-dune-sand-dark mt-1">
                {userPlan.isUnlimited ? (
                  <span className="text-dune-gold">Pro Plan • Unlimited</span>
                ) : (
                  <span>
                    Free Plan • {userPlan.messagesUsed}/{userPlan.messagesLimit} messages today
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Banner */}
      <AnimatePresence>
        {showUpgrade && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-dune-gold/10 border-b border-dune-gold/30 px-6 py-4"
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <p className="text-dune-sand-light">
                You've reached your daily limit. Upgrade to Duna Pro for unlimited access.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://whop.com/checkout/plan_vhBLiFWs6AJNx?d2c=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-dune-gold text-dune-black font-semibold rounded-lg hover:bg-dune-gold-light transition-all duration-300 text-sm"
                >
                  Monthly
                </a>
                <a
                  href="https://whop.com/checkout/plan_nAv9o4mMRgV37?d2c=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 premium-border text-dune-gold hover:border-dune-gold/50 rounded-lg transition-all duration-300 text-sm"
                >
                  Lifetime
                </a>
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="px-4 py-2 text-dune-sand-dark hover:text-dune-sand-light transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🌊</div>
              <h2 className="font-display text-3xl font-bold text-gradient mb-2">
                Welcome to Duna
              </h2>
              <p className="text-dune-sand-dark">
                Start a conversation with your AI assistant
              </p>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] premium-card ${
                    message.role === 'user'
                      ? 'bg-dune-gold/20 border-dune-gold/30'
                      : 'bg-dune-black-soft border-dune-bronze/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-dune-gold/20 flex items-center justify-center text-dune-gold font-bold flex-shrink-0">
                        D
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-dune-sand-light whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs text-dune-sand-dark mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-dune-gold/20 flex items-center justify-center text-dune-gold font-bold flex-shrink-0">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="premium-card bg-dune-black-soft">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-dune-gold/20 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-dune-gold border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <span className="text-dune-sand-dark">Duna is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="premium-border border-t border-dune-gold/20 bg-dune-black/80 backdrop-blur-md px-6 py-4">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto">
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 premium-border bg-dune-black-soft rounded-lg text-dune-sand-light focus:outline-none focus:border-dune-gold/50 transition-colors placeholder:text-dune-sand-dark"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-dune-gold text-dune-black font-semibold rounded-lg hover:bg-dune-gold-light glow-gold-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

