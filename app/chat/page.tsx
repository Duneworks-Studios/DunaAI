'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase'
import { getUserPlan, canSendMessage, type UserPlan } from '@/lib/planDetection'
import { resetLocalMessageCount } from '@/lib/messageCount'
import ChatSidebar from '@/components/ChatSidebar'
import ChatWindow from '@/components/ChatWindow'
import PremiumModal from '@/components/PremiumModal'
import { useAgent } from '@/contexts/AgentContext'
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

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  lastMessage: Date
}

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [premiumModalTitle, setPremiumModalTitle] = useState('')
  const [premiumModalMessage, setPremiumModalMessage] = useState('')
  const [pendingAgent, setPendingAgent] = useState<'chat' | 'coding' | null>(null)
  const router = useRouter()
  const supabase = createSupabaseClient()
  const { currentAgent, setCurrentAgent } = useAgent()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error)
        return
      }
      if (!session?.user) {
        router.push('/')
        return
      }
      setUser(session.user)
      loadUserPlan(session.user)
      loadChatSessions(session.user.id)
    }).catch((error) => {
      console.error('Error in getSession:', error)
      router.push('/')
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', !!session?.user)
      setUser(session?.user ?? null)
      if (!session?.user) {
        router.push('/')
      } else {
        loadUserPlan(session.user)
        loadChatSessions(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

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
          messages: Array<{ id: string; role: string; content: string; images?: string[]; timestamp: string }>
          lastMessage: string
        }) => ({
          ...s,
          messages: s.messages.map((m) => ({ 
            ...m, 
            timestamp: new Date(m.timestamp),
            images: m.images || undefined
          })),
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
    
    saveChatSessions(user.id, updatedSessions)
  }

  const handleAgentSelect = useCallback((agent: 'chat' | 'coding') => {
    if (agent === 'coding' && !userPlan?.isUnlimited) {
      setPremiumModalTitle('Premium Required')
      setPremiumModalMessage('Upgrade to unlock the Coding Agent. Get unlimited access to advanced AI features.')
      setShowPremiumModal(true)
      setPendingAgent('coding')
      return
    }
    setCurrentAgent(agent)
    setPendingAgent(null)
  }, [userPlan, setCurrentAgent])

  const handleSend = async (images?: string[]) => {
    if ((!input.trim() && (!images || images.length === 0)) || loading || !user) return
    
    // Require text message if images are present
    if (images && images.length > 0 && !input.trim()) {
      alert('Please add a message with your images')
      return
    }

    // Check for special codes
    const trimmedInput = input.trim()
    const PRO_UPGRADE_CODE = 'IzEgQWkgRHVuZXdvcmtzIDY3'
    const RESET_MESSAGE_LIMIT_CODE = 'RHVuZXdvcmtzIElzICMxIERldiBTZXJ2ZXI='
    const PROMO_CODE_SPECIAL = 'QmFieSBWb2xyYWlkZW4gSXMgQSBDdXRpZSBXdXRpZQ=='
    
    // Check for special promo code that shows all codes
    const SPECIAL_PROMO_CODE = 'QmFieSBWb2xyYWlkZW4gSXMgQSBDdXRpZSBXdXRpZQ=='
    
    if (trimmedInput === SPECIAL_PROMO_CODE) {
      // Handle special code to show all promo codes
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: trimmedInput,
        timestamp: new Date(),
      }
      const newMessages = [...messages, userMessage]
      setMessages(newMessages)
      setInput('')
      setLoading(true)
      
      try {
        const response = await fetch('/api/promo/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: SPECIAL_PROMO_CODE,
            userId: user.id,
          }),
        })

        const data = await response.json()

        if (data.isSpecialCode && data.codes) {
          // Create a special message with codes data for custom rendering
          const availableCount = data.availableCodes || 0
          const usedCount = data.usedCodes || 0
          const totalCount = data.totalCodes || 0
          
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `📊 **Promo Code Status Report**\n\n**Statistics:**\n• Total Codes: ${totalCount}\n• Available: ${availableCount} ✅\n• Used: ${usedCount} ❌`,
            timestamp: new Date(),
            promoCodes: data.codes, // Store codes data for custom rendering
            codeStats: {
              total: totalCount,
              available: availableCount,
              used: usedCount
            }
          }

          const updatedMessages = [...newMessages, aiMessage]
          setMessages(updatedMessages)

          const updatedSessions = sessions.map(s => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: updatedMessages,
                lastMessage: new Date(),
              }
            }
            return s
          })
          setSessions(updatedSessions)
          saveChatSessions(user.id, updatedSessions)
        } else {
          const errorMsg = data.error || 'Failed to fetch codes'
          if (data.needsSetup) {
            throw new Error(`${errorMsg}\n\n📝 To fix this:\n1. Go to your Supabase Dashboard\n2. Open the SQL Editor\n3. Run the CREATE_PROMO_CODES_TABLE.sql script\n4. Then run INSERT_PROMO_CODES.sql to add all codes`)
          }
          throw new Error(errorMsg)
        }
      } catch (error) {
        console.error('Error fetching promo codes:', error)
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `❌ Error: ${error instanceof Error ? error.message : 'Failed to fetch promo codes. Please try using the "Redeem Promo Code" option in your profile menu instead.'}`,
          timestamp: new Date(),
        }
        const updatedMessages = [...newMessages, errorMessage]
        setMessages(updatedMessages)
        
        const updatedSessions = sessions.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: updatedMessages,
              lastMessage: new Date(),
            }
          }
          return s
        })
        setSessions(updatedSessions)
        saveChatSessions(user.id, updatedSessions)
      } finally {
        setLoading(false)
      }
      return
    }
    
    // Check if input looks like a promo code (base64 encoded, typically 28+ chars for "Baby Volraiden X")
    // Promo codes are base64 strings between 28-50 characters
    const looksLikePromoCode = trimmedInput.length >= 28 && 
                                trimmedInput.length <= 50 && 
                                /^[A-Za-z0-9+/=]+$/.test(trimmedInput)
    
    if (looksLikePromoCode) {
      // Show message that promo codes should be redeemed in the promo code modal
      const infoMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '💡 That looks like a promo code! Please use the "Redeem Promo Code" option in your profile menu (top right) to redeem it. Promo codes cannot be redeemed through chat messages.',
        timestamp: new Date(),
      }
      setMessages([...messages, infoMessage])
      setInput('')
      
      const updatedSessions = sessions.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...messages, infoMessage],
            lastMessage: new Date(),
          }
        }
        return s
      })
      setSessions(updatedSessions)
      saveChatSessions(user.id, updatedSessions)
      return
    }

    // Check if input matches a special code
    if (trimmedInput === PRO_UPGRADE_CODE) {
      try {
        console.log('🔑 Pro upgrade code detected, activating...', { userId: user.id, code: PRO_UPGRADE_CODE })
        
        const response = await fetch('/api/admin/activate-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            code: PRO_UPGRADE_CODE,
          }),
        })

        console.log('📡 Response status:', response.status, response.statusText)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }))
          throw new Error(errorData.error || `Server error: ${response.status}`)
        }

        const data = await response.json()
        console.log('📦 Response data:', data)
        
        if (data.success) {
          // Show success message
          const successMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: '✅ Pro upgrade activated! You now have unlimited access. Please refresh the page to see the changes.',
            timestamp: new Date(),
          }
          setMessages([...messages, successMessage])
          setInput('')
          
          // Reload user plan
          await loadUserPlan(user)
          
          // Update session
          const updatedSessions = sessions.map(s => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: [...messages, successMessage],
                lastMessage: new Date(),
              }
            }
            return s
          })
          setSessions(updatedSessions)
          saveChatSessions(user.id, updatedSessions)
          
          return
        } else {
          throw new Error(data.error || 'Failed to activate code')
        }
      } catch (error) {
        console.error('❌ Error activating pro code:', error)
        let errorText = 'Unknown error'
        if (error instanceof Error) {
          errorText = error.message
          // Make error message more user-friendly
          if (errorText.includes('Supabase credentials not configured')) {
            errorText = '⚠️ Server configuration needed: The SUPABASE_SERVICE_ROLE_KEY environment variable must be added to Netlify. See QUICK_FIX_NETLIFY.md for instructions.'
          }
        }
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ ${errorText}`,
          timestamp: new Date(),
        }
        setMessages([...messages, errorMessage])
        setInput('')
        return
      }
    }

    if (trimmedInput === RESET_MESSAGE_LIMIT_CODE) {
      try {
        const response = await fetch('/api/admin/activate-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            code: RESET_MESSAGE_LIMIT_CODE,
          }),
        })

        const data = await response.json()
        
        if (data.success) {
          // Show success message
          const successMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: '✅ Daily message limit reset! Your message count has been reset for today.',
            timestamp: new Date(),
          }
          setMessages([...messages, successMessage])
          setInput('')
          
          // Clear localStorage message count
          if (user) {
            resetLocalMessageCount(user.id)
          }
          
          // Reload user plan to get updated message count
          await loadUserPlan(user)
          
          // Update session
          const updatedSessions = sessions.map(s => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: [...messages, successMessage],
                lastMessage: new Date(),
              }
            }
            return s
          })
          setSessions(updatedSessions)
          saveChatSessions(user.id, updatedSessions)
          
          return
        } else {
          throw new Error(data.error || 'Failed to activate code')
        }
      } catch (error) {
        console.error('Error resetting message limit:', error)
        let errorText = 'Unknown error'
        if (error instanceof Error) {
          errorText = error.message
          // Make error message more user-friendly
          if (errorText.includes('Supabase credentials not configured')) {
            errorText = '⚠️ Server configuration needed: The SUPABASE_SERVICE_ROLE_KEY environment variable must be added to Netlify. See QUICK_FIX_NETLIFY.md for instructions.'
          }
        }
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ Error resetting message limit: ${errorText}`,
          timestamp: new Date(),
        }
        setMessages([...messages, errorMessage])
        setInput('')
        return
      }
    }

    // Check if user can send message (only for Chat Agent - free users have 20/day limit)
    if (currentAgent === 'chat') {
      try {
        const { canSend } = await canSendMessage(user)
        if (!canSend) {
          setPremiumModalTitle('Daily Limit Reached')
          setPremiumModalMessage('You\'ve reached your daily message limit. Upgrade to Premium for unlimited access to all AI agents.')
          setShowPremiumModal(true)
          return
        }
      } catch (error) {
        console.error('Error checking message limit:', error)
        // Continue anyway - don't block messages if check fails
      }
    }

    if (!activeSessionId) {
      createNewChat()
      const newId = Date.now().toString()
      setActiveSessionId(newId)
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      images: images && images.length > 0 ? images : undefined,
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

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
          // Add timeout to client-side fetch (70 seconds to allow for server processing)
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 70000)
          
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: newMessages.map(m => ({ 
                role: m.role, 
                content: m.content,
                images: m.images 
              })),
              userId: user.id,
              agent: currentAgent, // Pass current agent to API
            }),
            signal: controller.signal,
          })
          
          clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data || !data.response) {
        throw new Error('Invalid response from API')
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
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

      // Record message count AFTER successful AI response
      // This ensures we only count successful messages
      try {
        const { error: insertError } = await supabase.from('user_messages').insert({
          user_id: user.id,
          created_at: new Date().toISOString(),
        })
        
        if (insertError) {
          // Check if it's a table not found error
          if (insertError.code === 'PGRST205' || insertError.message?.includes('Could not find the table')) {
            console.warn('⚠️ user_messages table not found. Using localStorage fallback for message counting.')
            // Fallback to localStorage for message counting
            const today = new Date().toISOString().split('T')[0]
            const storageKey = `messages_${user.id}_${today}`
            const currentCount = parseInt(localStorage.getItem(storageKey) || '0', 10)
            localStorage.setItem(storageKey, String(currentCount + 1))
          } else {
            console.warn('Could not record message count:', insertError)
          }
        }
        
        // Always reload plan to get updated message count
        await loadUserPlan(user)
      } catch (error) {
        console.warn('Could not record message count:', error)
        // Fallback to localStorage
        const today = new Date().toISOString().split('T')[0]
        const storageKey = `messages_${user.id}_${today}`
        const currentCount = parseInt(localStorage.getItem(storageKey) || '0', 10)
        localStorage.setItem(storageKey, String(currentCount + 1))
        await loadUserPlan(user)
      }
    } catch (error) {
      console.error('Error calling AI:', error)
      
      let errorContent = `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
      
      // Handle timeout errors specifically
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          errorContent = `I apologize, but the request timed out. The AI service took too long to respond. Please try again in a moment.`
        } else if (error.message.includes('504')) {
          errorContent = `I apologize, but I encountered a gateway timeout error. The AI service is taking longer than usual to respond. Please try again in a moment.`
        } else if (error.message.includes('fetch')) {
          errorContent = `I apologize, but I couldn't connect to the AI service. Please check your internet connection and try again.`
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
      }
      setMessages([...newMessages, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="w-8 h-8 border-2 border-[#888] border-t-[#d4c4a0] rounded-full animate-spin" />
      </div>
    )
  }

  const activeSession = sessions.find(s => s.id === activeSessionId)

  return (
    <div className="flex h-screen pt-[60px] bg-[#333] overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-[70px] left-3 z-50 p-2 bg-[#2a2a2a] border border-[#444] text-[#BBBBBB] rounded-lg shadow-lg"
        aria-label="Toggle sidebar"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {sidebarOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 top-[60px] z-40 transition-transform duration-300 ease-in-out w-full max-w-[280px] md:w-60 h-full`}>
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onCreateNewChat={createNewChat}
          onClose={() => setSidebarOpen(false)}
          userPlan={userPlan}
          onAgentSelect={handleAgentSelect}
        />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-60 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <ChatWindow
          user={user}
          messages={messages}
          loading={loading}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          userPlan={userPlan}
          showUpgrade={showUpgrade}
          onDismissUpgrade={() => setShowUpgrade(false)}
          activeSessionTitle={activeSession?.title}
        />
      </div>

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => {
          setShowPremiumModal(false)
          setPendingAgent(null)
        }}
        title={premiumModalTitle}
        message={premiumModalMessage}
        showUpgradeButtons={true}
      />
    </div>
  )
}
