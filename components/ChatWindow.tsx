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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>([])

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
                    <p className="whitespace-pre-wrap leading-relaxed text-sm break-words text-[var(--text-primary)] mb-3">
                      {message.content}
                    </p>
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
          
          <div className="flex gap-3">
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
              className="px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-xl hover:border-[var(--accent-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title="Add images (max 4)"
            >
              <svg className="w-5 h-5 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={selectedImages.length > 0 ? "Add a message with your images..." : "Type your message..."}
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
              disabled={loading || (!input.trim() && selectedImages.length === 0)}
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
