'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase'
import { getUserPlan, canSendMessage, type UserPlan } from '@/lib/planDetection'
import { useTheme } from '@/contexts/ThemeContext'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  lastMessage: Date
}

export default function Chat() {
  const [user, setUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const supabase = createSupabaseClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error)
        return
      }
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserPlan(session.user)
        loadChatSessions(session.user.id)
      }
    }).catch((error) => {
      console.error('Error in getSession:', error)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserPlan(session.user)
        loadChatSessions(session.user.id)
      } else {
        setSessions([])
        setMessages([])
        setUserPlan(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (activeSessionId) {
      const session = sessions.find(s => s.id === activeSessionId)
      if (session) {
        setMessages(session.messages)
      }
    } else {
      setMessages([])
    }
  }, [activeSessionId, sessions])

  const loadUserPlan = async (user: User) => {
    const plan = await getUserPlan(user)
    setUserPlan(plan)
  }

  const loadChatSessions = async (userId: string) => {
    const stored = localStorage.getItem(`chat_sessions_${userId}`)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const sessionsWithDates = parsed.map((s: {
          id: string
          title: string
          messages: Array<{ id: string; role: string; content: string; timestamp: string }>
          lastMessage: string
        }) => ({
          ...s,
          messages: s.messages.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })),
          lastMessage: new Date(s.lastMessage),
        }))
        setSessions(sessionsWithDates)
        if (sessionsWithDates.length > 0 && !activeSessionId) {
          setActiveSessionId(sessionsWithDates[0].id)
        }
      } catch (e) {
        console.error('Error loading sessions:', e)
      }
    }
  }

  const saveChatSessions = async (userId: string, newSessions: ChatSession[]) => {
    localStorage.setItem(`chat_sessions_${userId}`, JSON.stringify(newSessions))
  }

  const createNewChat = () => {
    if (!user) return
    
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      lastMessage: new Date(),
    }
    
    const updatedSessions = [newSession, ...sessions]
    setSessions(updatedSessions)
    setActiveSessionId(newSession.id)
    setMessages([])
    
    if (user) {
      saveChatSessions(user.id, updatedSessions)
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('handleSend called', { input: input.trim(), loading, user: !!user })
    
    if (!input.trim() || loading) {
      console.log('Blocked: empty input or loading')
      return
    }

    if (!user) {
      console.log('No user, redirecting to login')
      window.location.href = '/auth/login'
      return
    }

    // Check if user can send message (with error handling)
    try {
      const { canSend, reason } = await canSendMessage(user)
      if (!canSend) {
        setShowUpgrade(true)
        return
      }
    } catch (error) {
      console.error('Error checking message limit:', error)
      // Continue anyway - don't block messages if check fails
    }

    // Create new session if needed
    if (!activeSessionId) {
      const newId = Date.now().toString()
      const newSession: ChatSession = {
        id: newId,
        title: 'New Chat',
        messages: [],
        lastMessage: new Date(),
      }
      const updatedSessions = [newSession, ...sessions]
      setSessions(updatedSessions)
      setActiveSessionId(newId)
      setMessages([])
      if (user) {
        saveChatSessions(user.id, updatedSessions)
      }
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

    // Update session
    const updatedSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: newMessages,
          lastMessage: new Date(),
          title: s.messages.length === 0 ? input.trim().substring(0, 30) : s.title,
        }
      }
      return s
    })
    setSessions(updatedSessions)
    saveChatSessions(user.id, updatedSessions)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userId: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data || !data.response) {
        throw new Error('Invalid response from API')
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      }

      const updatedMessages = [...newMessages, aiMessage]
      setMessages(updatedMessages)

      const finalSessions = updatedSessions.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: updatedMessages,
            lastMessage: new Date(),
          }
        }
        return s
      })
      setSessions(finalSessions)
      saveChatSessions(user.id, finalSessions)

      // Try to record message count (don't block if it fails)
      try {
        await supabase.from('user_messages').insert({
          user_id: user.id,
          created_at: new Date().toISOString(),
        })
        loadUserPlan(user)
      } catch (error) {
        console.warn('Could not record message count (table may not exist):', error)
        // Continue anyway - this is not critical
      }
    } catch (error) {
      console.error('Error calling AI:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the browser console for details and try again.`,
        timestamp: new Date(),
      }
      setMessages([...newMessages, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center premium-card max-w-md"
        >
          <h2 className={`font-display text-3xl font-bold mb-4 text-gradient`}>
            Sign In Required
          </h2>
          <p className="mb-6 text-[var(--text-secondary)]">
            Please sign in to start chatting with Duna AI.
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-3 btn-primary"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    )
  }

  const activeSession = sessions.find(s => s.id === activeSessionId)

  return (
    <div className="min-h-screen flex pt-16">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-20 left-4 z-50 px-4 py-2 rounded-lg premium-card glass"
      >
        {sidebarOpen ? 'Close' : 'Chats'}
      </button>

      {/* Left Sidebar - Chat History */}
      <aside className={`w-64 fixed left-0 top-16 bottom-0 border-r glass transition-transform duration-300 z-40 border-[var(--border-primary)] ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <div className="h-full flex flex-col">
          {/* New Chat Button */}
          <div className="p-4 border-b border-[var(--border-primary)]">
            <button
              onClick={createNewChat}
              className="w-full btn-primary"
            >
              New Chat
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-2">
            <AnimatePresence>
              {sessions.map((session) => (
                <motion.button
                  key={session.id}
                  onClick={() => {
                    setActiveSessionId(session.id)
                    setSidebarOpen(false)
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg mb-2 transition-all duration-200 ${
                    activeSessionId === session.id
                      ? 'bg-[var(--accent-primary)]/10 border-l-2 border-[var(--accent-primary)] text-[var(--accent-primary)]'
                      : 'hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                  }`}
                >
                  <div className="text-sm font-medium truncate">
                    {session.title}
                  </div>
                  <div className="text-xs mt-1 text-[var(--text-tertiary)]">
                    {session.lastMessage.toLocaleDateString()}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <main className="flex-1 md:ml-64 flex flex-col">
        {/* Header */}
        <div className="border-b glass px-6 py-4 border-[var(--border-primary)]">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className={`font-display text-2xl font-bold text-gradient`}>
                {activeSession?.title || 'New Chat'}
              </h1>
              {userPlan && (
                <p className="text-sm mt-1 text-[var(--text-secondary)]">
                  {userPlan.isUnlimited ? (
                    <span className="text-[var(--accent-primary)] font-semibold">
                      Pro Plan • Unlimited
                    </span>
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
              className="border-b px-6 py-4 bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/30"
            >
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <p className="text-[var(--text-primary)]">
                  You've reached your daily limit. Upgrade to Duna Pro for unlimited access.
                </p>
                <div className="flex gap-3">
                  <a
                    href={process.env.NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 btn-primary text-sm"
                  >
                    Monthly
                  </a>
                  <a
                    href={process.env.NEXT_PUBLIC_WHOP_CHECKOUT_LIFETIME || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 btn-secondary text-sm"
                  >
                    Lifetime
                  </a>
                  <button
                    onClick={() => setShowUpgrade(false)}
                    className="px-4 py-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
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
                <h2 className={`font-display text-3xl font-bold mb-2 text-gradient`}>
                  Welcome to Duna
                </h2>
                <p className="text-[var(--text-secondary)]">
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
                    className={`max-w-[75%] rounded-2xl px-4 py-3 premium-card ${
                      message.role === 'user'
                        ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20'
                        : 'bg-[var(--bg-elevated)] border border-[var(--border-primary)]'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed text-[var(--text-primary)]">{message.content}</p>
                    <p className="text-xs mt-2 text-[var(--text-tertiary)]">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
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
                <div className="premium-card rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[var(--border-secondary)] border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
                    <span className="text-[var(--text-secondary)]">
                      Duna is thinking...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t glass px-6 py-4 border-[var(--border-primary)]">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto">
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
