'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase'
import { getUserPlan, canSendMessage, type UserPlan } from '@/lib/planDetection'
import type { User } from '@supabase/supabase-js'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatWindowProps {
  user: User
  messages: Message[]
  loading: boolean
  input: string
  onInputChange: (value: string) => void
  onSend: () => void
  userPlan: UserPlan | null
  showUpgrade: boolean
  onDismissUpgrade: () => void
  activeSessionTitle?: string
}

export default function ChatWindow({
  user,
  messages,
  loading,
  input,
  onInputChange,
  onSend,
  userPlan,
  showUpgrade,
  onDismissUpgrade,
  activeSessionTitle,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !loading) {
      onSend()
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary)] min-w-0 overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-[var(--border-primary)] px-4 sm:px-6 flex items-center flex-shrink-0 glass">
        <h1 className="text-lg font-semibold text-[var(--text-primary)] truncate flex-1 min-w-0">
          {activeSessionTitle || 'New Chat'}
        </h1>
        {userPlan && (
          <div className="ml-4 text-sm text-[var(--text-secondary)] flex-shrink-0 hidden sm:flex items-center gap-2">
            {userPlan.isUnlimited ? (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white text-xs font-semibold">
                Pro • Unlimited
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-primary)] text-[var(--text-primary)] text-xs">
                {userPlan.messagesUsed}/{userPlan.messagesLimit} today
              </span>
            )}
          </div>
        )}
      </div>

      {/* Upgrade Banner */}
      <AnimatePresence>
        {showUpgrade && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border-b border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5 px-4 sm:px-6 py-3 flex-shrink-0"
          >
            <div className="max-w-4xl mx-auto w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-sm text-[var(--text-primary)] flex-1">
                  Daily limit reached. Upgrade to Duna Pro for unlimited access.
                </p>
                <div className="flex gap-2 w-full sm:w-auto">
                  <a
                    href={process.env.NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2 btn-primary text-sm text-center"
                  >
                    Monthly
                  </a>
                  <a
                    href={process.env.NEXT_PUBLIC_WHOP_CHECKOUT_LIFETIME || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2 btn-secondary text-sm text-center"
                  >
                    Lifetime
                  </a>
                  <button
                    onClick={onDismissUpgrade}
                    className="px-4 py-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0"
                    aria-label="Dismiss"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 min-h-0">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <h2 className="text-2xl font-semibold mb-2 text-[var(--text-primary)]">
                Welcome to Duna
              </h2>
              <p className="text-base text-[var(--text-secondary)]">
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
                  className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] rounded-xl px-4 py-3 premium-card ${
                    message.role === 'user'
                      ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20'
                      : 'bg-[var(--bg-elevated)] border border-[var(--border-primary)]'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-sm break-words text-[var(--text-primary)]">
                    {message.content}
                  </p>
                  <p className="text-xs mt-2 text-[var(--text-tertiary)]">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              <div className="premium-card px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[var(--border-secondary)] border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
                  <span className="text-sm text-[var(--text-secondary)]">Duna is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border-primary)] px-4 md:px-6 py-4 glass flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-sm"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <span className="flex items-center gap-2">
                <span>Send</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </span>
            </button>
          </div>
          {userPlan && !userPlan.isUnlimited && (
            <p className="text-xs text-[var(--text-tertiary)] text-center mt-2">
              {userPlan.messagesUsed} / {userPlan.messagesLimit} messages today
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
