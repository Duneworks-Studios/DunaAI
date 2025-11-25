'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase'
import { getUserPlan, canSendMessage, type UserPlan } from '@/lib/planDetection'
import type { User } from '@supabase/supabase-js'
import MarkdownRenderer from './MarkdownRenderer'
import { useAgent } from '@/contexts/AgentContext'
import { AGENTS, getAvailableAgents, isAgentAvailable, type AgentId } from '@/lib/agents'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  images?: string[] // Base64 encoded images
  timestamp: Date
  promoCodes?: Array<{ code: string; text: string; isUsed: boolean; usedAt?: string }> // For promo code display
  codeStats?: { total: number; available: number; used: number } // For promo code stats
}

interface ChatWindowProps {
  user: User
  messages: Message[]
  loading: boolean
  input: string
  onInputChange: (value: string) => void
  onSend: (images?: string[]) => void
  userPlan: UserPlan | null
  showUpgrade: boolean
  onDismissUpgrade: () => void
  activeSessionTitle?: string
  onShowPremiumModal?: (title: string, message: string) => void
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
  onShowPremiumModal,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [showAgentDropdown, setShowAgentDropdown] = useState(false)
  const { currentAgent, setCurrentAgent } = useAgent()
  const isPro = userPlan?.isUnlimited || false
  // Show all agents, but filter availability for clicking
  const allAgents = Object.values(AGENTS)
  const currentAgentData = AGENTS[currentAgent]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length === 0) {
      alert('Please select image files only')
      return
    }

    // Limit to 4 images max
    const filesToProcess = imageFiles.slice(0, 4 - selectedImages.length)
    
    filesToProcess.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setSelectedImages(prev => [...prev, base64])
      }
      reader.readAsDataURL(file)
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    const imageItems: File[] = []

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile()
        if (file) imageItems.push(file)
      }
    }

    if (imageItems.length > 0 && selectedImages.length < 4) {
      e.preventDefault()
      const filesToProcess = imageItems.slice(0, 4 - selectedImages.length)
      
      filesToProcess.forEach(file => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const base64 = event.target?.result as string
          setSelectedImages(prev => [...prev, base64])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((input.trim() || selectedImages.length > 0) && !loading) {
      // Require text message if images are present
      if (selectedImages.length > 0 && !input.trim()) {
        alert('Please add a message with your images')
        return
      }
      
      const imagesToSend = [...selectedImages]
      setSelectedImages([])
      onSend(imagesToSend.length > 0 ? imagesToSend : undefined)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary)] min-w-0 overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-[var(--border-primary)] pl-14 md:pl-4 pr-4 sm:pr-6 flex items-center flex-shrink-0 glass relative z-30">
        <h1 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] truncate flex-1 min-w-0">
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
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 min-h-0">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 sm:py-20 px-4"
            >
              <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-[var(--text-primary)]">
                Welcome to Duna
              </h2>
              <p className="text-sm sm:text-base text-[var(--text-secondary)]">
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
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} px-2 sm:px-0`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 premium-card ${
                    message.role === 'user'
                      ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20'
                      : 'bg-[var(--bg-elevated)] border border-[var(--border-primary)]'
                  }`}
                >
                  {message.images && message.images.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {message.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`Attachment ${idx + 1}`}
                            className="max-w-[200px] max-h-[200px] rounded-lg object-cover border border-[var(--border-primary)]"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {message.content && (
                    <div className="text-sm text-[var(--text-primary)]">
                      <MarkdownRenderer content={message.content} />
                    </div>
                  )}
                  
                  {/* Promo Codes Display */}
                  {message.promoCodes && message.promoCodes.length > 0 && (
                    <div className="mt-4 border border-[var(--border-primary)] rounded-lg overflow-hidden bg-[var(--bg-primary)]">
                      <div 
                        className="max-h-[400px] overflow-y-scroll p-4 promo-codes-scroll"
                        style={{ 
                          scrollbarWidth: 'thin',
                          scrollbarColor: 'rgba(255, 215, 0, 0.5) rgba(0, 0, 0, 0.1)',
                          WebkitOverflowScrolling: 'touch',
                          overscrollBehavior: 'contain'
                        }}
                      >
                        <div className="space-y-2">
                          {message.promoCodes.map((codeItem, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg border transition-all ${
                                codeItem.isUsed
                                  ? 'bg-red-500/10 border-red-500/30 opacity-75'
                                  : 'bg-green-500/10 border-green-500/30'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-sm font-medium ${
                                      codeItem.isUsed ? 'text-red-400' : 'text-green-400'
                                    }`}>
                                      {codeItem.text}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                      codeItem.isUsed
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-green-500/20 text-green-400'
                                    }`}>
                                      {codeItem.isUsed ? 'USED' : 'VALID'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[var(--text-tertiary)] font-mono break-all mt-1">
                                    {codeItem.code}
                                  </p>
                                  {codeItem.isUsed && codeItem.usedAt && (
                                    <p className="text-xs text-red-400/70 mt-1">
                                      Used: {new Date(codeItem.usedAt).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                {!codeItem.isUsed && (
                                  <button
                                    onClick={(e) => {
                                      navigator.clipboard.writeText(codeItem.code)
                                      // Show a brief feedback
                                      const btn = e.currentTarget
                                      const originalText = btn.textContent
                                      btn.textContent = 'Copied!'
                                      setTimeout(() => {
                                        btn.textContent = originalText
                                      }, 2000)
                                    }}
                                    className="px-3 py-1.5 text-xs btn-secondary flex-shrink-0"
                                  >
                                    Copy
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
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
              className="flex justify-start px-2 sm:px-0"
            >
              <div className="premium-card px-3 sm:px-4 py-2.5 sm:py-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[var(--border-secondary)] border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
                  <span className="text-xs sm:text-sm text-[var(--text-secondary)]">Duna is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Agent Selector Dropdown */}
      <div className="border-t border-[var(--border-primary)] px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 glass flex-shrink-0">
        <div className="max-w-4xl mx-auto relative">
          <button
            type="button"
            onClick={() => setShowAgentDropdown(!showAgentDropdown)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg hover:border-[var(--accent-primary)] transition-colors flex items-center justify-between text-xs sm:text-sm touch-manipulation"
          >
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-primary)] font-medium">
                {currentAgentData?.name || 'Select Agent'}
              </span>
              {currentAgentData?.plan === 'pro' && (
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white text-xs font-semibold">
                  Pro
                </span>
              )}
            </div>
            <svg
              className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${showAgentDropdown ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAgentDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowAgentDropdown(false)}
              />
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg shadow-lg max-h-96 overflow-y-auto z-20">
                {allAgents.map((agent) => {
                  const isProAgent = agent.plan === 'pro'
                  const isLocked = isProAgent && !isPro
                  const isAvailable = !isProAgent || isPro
                  
                  return (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => {
                        if (isLocked) {
                          // Show upgrade modal
                          if (onShowPremiumModal) {
                            onShowPremiumModal(
                              'Premium Required',
                              `"${agent.name}" requires a Premium subscription. Upgrade to unlock all advanced AI agents.`
                            )
                          }
                          setShowAgentDropdown(false)
                          return
                        }
                        setCurrentAgent(agent.id)
                        setShowAgentDropdown(false)
                      }}
                      disabled={isLocked}
                      className={`w-full text-left px-4 py-3 transition-colors border-b border-[var(--border-primary)] last:border-b-0 ${
                        isLocked
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-[var(--bg-tertiary)] cursor-pointer'
                      } ${
                        currentAgent === agent.id && !isLocked
                          ? 'bg-[var(--accent-primary)]/10 border-l-2 border-l-[var(--accent-primary)]'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${
                              isLocked ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'
                            }`}>
                              {agent.name}
                            </span>
                            {isProAgent && (
                              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white text-xs font-semibold">
                                Pro
                              </span>
                            )}
                          </div>
                          <p className={`text-xs mt-1 ${
                            isLocked ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-secondary)]'
                          }`}>
                            {agent.description}
                          </p>
                        </div>
                        {currentAgent === agent.id && !isLocked && (
                          <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {isLocked && (
                          <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border-primary)] px-3 sm:px-4 md:px-6 py-3 sm:py-4 glass flex-shrink-0 safe-area-inset-bottom">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto" onPaste={handlePaste}>
          {/* Image Preview */}
          {selectedImages.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {selectedImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    className="w-20 h-20 rounded-lg object-cover border border-[var(--border-primary)]"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white text-xs transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-2 sm:gap-3 w-full min-w-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || selectedImages.length >= 4}
              className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-xl hover:border-[var(--accent-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 touch-manipulation"
              title="Add images (max 4)"
              aria-label="Add images"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={selectedImages.length > 0 ? "Add a message with your images..." : "Type your message..."}
              className="flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-xl focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-sm sm:text-base"
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
              disabled={loading || (!input.trim() && selectedImages.length === 0)}
              className="min-w-[44px] min-h-[44px] sm:min-w-[52px] sm:min-h-[52px] px-3 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary)]/90 hover:to-[var(--accent-secondary)]/90 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 flex items-center justify-center transition-all shadow-lg shadow-[var(--accent-primary)]/20 hover:shadow-[var(--accent-primary)]/30 active:scale-95 touch-manipulation"
              style={{
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.1)'
              }}
              aria-label="Send message"
            >
              <span className="flex items-center gap-1.5 sm:gap-2">
                <span className="hidden sm:inline text-sm sm:text-base font-semibold">Send</span>
                <svg className="w-5 h-5 sm:w-5 sm:h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </span>
            </button>
          </div>
          {userPlan && !userPlan.isUnlimited && (
            <p className="text-xs text-[var(--text-tertiary)] text-center mt-2 sm:mt-3">
              {userPlan.messagesUsed} / {userPlan.messagesLimit} messages today
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
