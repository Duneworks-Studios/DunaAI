'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase'
import { getUserPlan, canSendMessage, type UserPlan } from '@/lib/planDetection'
import type { User } from '@supabase/supabase-js'
import { useAgent } from '@/contexts/AgentContext'

interface ResearchModeProps {
  user: User
  userPlan: UserPlan | null
  onShowPremiumModal?: (title: string, message: string) => void
  onBackToChat?: () => void
}

export default function ResearchMode({ user, userPlan, onShowPremiumModal, onBackToChat }: ResearchModeProps) {
  const [content, setContent] = useState('')
  const [aiMessages, setAiMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: Date }>>([])
  const [aiInput, setAiInput] = useState('')
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const aiMessagesEndRef = useRef<HTMLDivElement>(null)
  const { currentAgent } = useAgent()
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [content])

  useEffect(() => {
    aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages])

  const handleAiSend = async () => {
    if (!aiInput.trim() || loading) return

    // Check message limit for free users
    if (!userPlan?.isUnlimited) {
      try {
        const { canSend } = await canSendMessage(user)
        if (!canSend) {
          if (onShowPremiumModal) {
            onShowPremiumModal(
              'Daily Limit Reached',
              'You\'ve reached your daily message limit. Upgrade to Premium for unlimited access.'
            )
          }
          return
        }
      } catch (error) {
        console.error('Error checking message limit:', error)
      }
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: aiInput.trim(),
      timestamp: new Date(),
    }

    setAiMessages(prev => [...prev, userMessage])
    setAiInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...aiMessages, userMessage].map(m => ({ role: m.role, content: m.content })),
          userId: user.id,
          agent: currentAgent,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.response || 'Failed to get response')
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.response || 'I apologize, but I couldn\'t generate a response.',
        timestamp: new Date(),
      }

      setAiMessages(prev => [...prev, aiMessage])

      // Record message count
      try {
        await supabase.from('user_messages').insert({
          user_id: user.id,
          created_at: new Date().toISOString(),
        })
      } catch (error) {
        console.warn('Could not record message count:', error)
      }
    } catch (error) {
      console.error('Error calling AI:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: error instanceof Error ? error.message : 'An error occurred. Please try again.',
        timestamp: new Date(),
      }
      setAiMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const insertAiResponse = (text: string) => {
    const cursorPos = textareaRef.current?.selectionStart || content.length
    const newContent = content.slice(0, cursorPos) + '\n\n' + text + '\n\n' + content.slice(cursorPos)
    setContent(newContent)
    
    // Focus and set cursor position after inserted text
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = cursorPos + text.length + 4
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(newPos, newPos)
      }
    }, 0)
  }

  return (
    <div className="flex h-full bg-[var(--bg-primary)]">
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b border-[var(--border-primary)] px-6 py-3 glass flex-shrink-0">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Research Document</h2>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing your research notes here...&#10;&#10;Use the AI assistant on the right to help you research, take notes, and study for exams."
            className="w-full h-full min-h-[500px] bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] resize-none outline-none text-base leading-relaxed font-mono"
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              lineHeight: '1.8',
            }}
          />
        </div>

        {/* Quick Actions */}
        <div className="border-t border-[var(--border-primary)] px-6 py-3 glass flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span>{content.length} characters</span>
            <span>•</span>
            <span>{content.split('\n').length} lines</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(content)
                alert('Content copied to clipboard!')
              }}
              className="px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg hover:border-[var(--accent-primary)] transition-colors text-sm text-[var(--text-primary)]"
            >
              Copy All
            </button>
            <button
              onClick={() => {
                if (confirm('Clear all content?')) {
                  setContent('')
                }
              }}
              className="px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg hover:border-[var(--accent-primary)] transition-colors text-sm text-[var(--text-primary)]"
            >
              Clear
            </button>
            {onBackToChat && (
              <button
                onClick={onBackToChat}
                className="px-4 py-2 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-semibold"
              >
                ← Back to Chat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Assistant Sidebar */}
      <div className="w-96 border-l border-[var(--border-primary)] flex flex-col bg-[var(--bg-elevated)] flex-shrink-0">
        <div className="border-b border-[var(--border-primary)] px-4 py-3 glass flex-shrink-0">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">AI Research Assistant</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Ask me to help with research, notes, and study materials</p>
        </div>

        {/* AI Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
          {aiMessages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--text-secondary)]">
                Ask me to help you research, create study notes, or explain concepts. I can write directly to your document!
              </p>
            </div>
          )}

          {aiMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  message.role === 'user'
                    ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20'
                    : 'bg-[var(--bg-primary)] border border-[var(--border-primary)]'
                }`}
              >
                <div className="text-[var(--text-primary)] whitespace-pre-wrap break-words">
                  {message.content}
                </div>
                {message.role === 'assistant' && (
                  <button
                    onClick={() => insertAiResponse(message.content)}
                    className="mt-2 text-xs text-[var(--accent-primary)] hover:underline"
                  >
                    Insert into document →
                  </button>
                )}
                <p className="text-xs mt-1 text-[var(--text-tertiary)]">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[var(--border-secondary)] border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
                  <span className="text-xs text-[var(--text-secondary)]">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={aiMessagesEndRef} />
        </div>

        {/* AI Input */}
        <div className="border-t border-[var(--border-primary)] px-4 py-3 glass flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleAiSend()
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask for research help..."
              className="flex-1 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:border-[var(--accent-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !aiInput.trim()}
              className="px-4 py-2 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

