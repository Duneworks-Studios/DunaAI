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
  const requestTimeoutMs = Number(process.env.NEXT_PUBLIC_AI_TIMEOUT_MS) || 65000
  const maxGatewayRetries = Number(process.env.NEXT_PUBLIC_AI_GATEWAY_RETRIES ?? 1)

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
      const payload = {
        messages: [...aiMessages, userMessage].map(m => ({ role: m.role, content: m.content })),
        userId: user.id,
        agent: 'meta-advanced', // Force Groq usage in Research mode
      }

      const sendAiRequest = async (attempt = 0): Promise<{ response: string }> => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs)

        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
          })

          const contentType = response.headers.get('content-type') || ''
          const text = await response.text()
          const isHtml = contentType.includes('text/html') || text.trim().startsWith('<')
          let data: { response?: string; statusCode?: number }

          if (isHtml) {
            data = {
              response: '⚠️ The AI service is temporarily unavailable.\n\nThe service returned an invalid response. Please try again in a moment.',
              statusCode: response.status || 503,
            }
          } else {
            try {
              data = JSON.parse(text)
            } catch (parseError) {
              console.error('[Research] Failed to parse JSON response:', parseError)
              data = {
                response: '⚠️ The AI service returned an invalid response. Please try again.',
                statusCode: response.status || 500,
              }
            }
          }

          const statusCode = data?.statusCode || response.status
          const isGatewayIssue = statusCode === 502 || statusCode === 503 || statusCode === 504

          if (isGatewayIssue && attempt < maxGatewayRetries) {
            console.warn('[Research] Gateway error detected, retrying...', { statusCode, attempt })
            await new Promise(resolve => setTimeout(resolve, 400))
            return sendAiRequest(attempt + 1)
          }

          if (!response.ok) {
            throw new Error(data?.response || `API error: ${response.status} ${response.statusText}`)
          }

          if (!data || !data.response) {
            throw new Error('⚠️ The AI service returned an empty response. Please try again.')
          }

          return data as { response: string }
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            throw new Error('⚠️ The AI service took too long to respond. Please try again.')
          }
          throw err instanceof Error ? err : new Error('⚠️ Unexpected error contacting the AI service.')
        } finally {
          clearTimeout(timeoutId)
        }
      }

      const data = await sendAiRequest()

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
      console.error('[Research] Error calling AI:', error)
      
      let errorContent = '⚠️ The AI service is temporarily unavailable.\n\nPlease wait a moment and try again.'
      
      if (error instanceof Error) {
        // If the error message already contains formatted content from API (starts with ⚠️ or contains markdown),
        // use it directly as it's already properly formatted
        if (error.message.includes('⚠️') || error.message.includes('**') || error.message.startsWith('🖼️') || error.message.includes('❌')) {
          errorContent = error.message
        } else if (error.name === 'AbortError' || error.message.includes('timeout')) {
          errorContent = '⚠️ The AI service is temporarily unavailable.\n\nThe request took too long to complete. This can happen on slower connections. Please wait 30-60 seconds and try again.'
        } else if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
          errorContent = '⚠️ Network Error\n\nI couldn\'t connect to the AI service. Please check your internet connection and try again.'
        } else if (error.message.includes('502') || error.message.includes('503') || error.message.includes('504')) {
          errorContent = '⚠️ The AI service is temporarily unavailable.\n\nThe service gateway is experiencing temporary issues. Please wait 15-30 seconds and try again.'
        }
      }
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: errorContent,
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
                className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--accent-primary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] hover:border-[var(--accent-hover)] transition-colors text-sm font-medium"
              >
                Back to Chat
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
              className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--accent-primary)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] hover:border-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

