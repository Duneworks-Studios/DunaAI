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
    console.log('ChatWindow handleSubmit called, input:', input.trim(), 'loading:', loading)
    if (input.trim() && !loading) {
      console.log('Calling onSend()')
      onSend()
    } else {
      console.log('Not sending - input empty or loading')
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#333]">
      {/* Header */}
      <div className="h-16 border-b border-[#444] px-6 flex items-center">
        <h1 className="text-lg font-semibold text-[#EEEEEE]">
          {activeSessionTitle || 'New Chat'}
        </h1>
        {userPlan && (
          <div className="ml-auto text-sm text-[#888888]">
            {userPlan.isUnlimited ? (
              <span className="text-[#d4c4a0]">Pro Plan • Unlimited</span>
            ) : (
              <span>
                Free Plan • {userPlan.messagesUsed}/{userPlan.messagesLimit} messages today
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
            className="border-b border-[#d4c4a0] border-opacity-30 bg-[#d4c4a0] bg-opacity-5 px-6 py-3"
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <p className="text-sm text-[#BBBBBB]">
                You've reached your daily limit. Upgrade to Duna Pro for unlimited access.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://whop.com/checkout/plan_vhBLiFWs6AJNx?d2c=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 bg-[#d4c4a0] bg-opacity-20 text-[#d4c4a0] rounded text-sm font-medium hover:bg-opacity-30 transition-all"
                >
                  Monthly
                </a>
                <a
                  href="https://whop.com/checkout/plan_nAv9o4mMRgV37?d2c=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 border border-[#d4c4a0] border-opacity-30 text-[#d4c4a0] rounded text-sm font-medium hover:border-opacity-50 transition-all"
                >
                  Lifetime
                </a>
                <button
                  onClick={onDismissUpgrade}
                  className="px-4 py-1.5 text-[#888888] hover:text-[#BBBBBB] transition-colors"
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
              <h2 className="text-2xl font-semibold mb-2 text-[#EEEEEE]">
                Welcome to Duna
              </h2>
              <p className="text-[#888888]">
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
                  className={`max-w-[75%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-[#444] text-[#EEEEEE]'
                      : 'bg-[#2a2a2a] border border-[#d4c4a0] border-opacity-20 text-[#EEEEEE]'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
                  <p className="text-xs mt-2 text-[#888888]">
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
              <div className="bg-[#2a2a2a] border border-[#333] rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#888] border-t-[#d4c4a0] rounded-full animate-spin"></div>
                  <span className="text-sm text-[#888888]">Duna is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-[#444] px-6 py-4 bg-[#2a2a2a]">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-[#333] border border-[#444] rounded-lg focus:outline-none focus:border-[#d4c4a0] focus:border-opacity-50 transition-colors text-[#EEEEEE] placeholder:text-[#888888] text-sm"
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
              className="px-6 py-3 bg-[#d4c4a0] bg-opacity-20 text-[#d4c4a0] rounded-lg font-medium hover:bg-opacity-30 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

