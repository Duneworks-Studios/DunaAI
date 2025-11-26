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
import { AGENTS, isAgentAvailable, getDefaultAgent, type AgentId } from '@/lib/agents'

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
    
    // Ensure current agent is available for user's plan
    const isPro = plan?.isUnlimited || false
    if (!isAgentAvailable(currentAgent, isPro)) {
      // Switch to default agent for their plan
      const defaultAgent = getDefaultAgent(isPro)
      setCurrentAgent(defaultAgent)
    }
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

  // Agent selection is now handled in ChatWindow dropdown
  // This function is kept for compatibility but not used
  const handleAgentSelect = useCallback((agent: any) => {
    // No longer needed - handled in ChatWindow
  }, [])

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

    // Check if user can send message (free users have 20/day limit)
    // Free agents: nova-advanced, nova
    const currentAgentData = AGENTS[currentAgent]
    const isFreeAgent = currentAgentData?.plan === 'free'
    
    if (isFreeAgent || !userPlan?.isUnlimited) {
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
    
    // Check if user is trying to use a Pro agent without Pro plan
    if (currentAgentData?.plan === 'pro' && !userPlan?.isUnlimited) {
      setPremiumModalTitle('Premium Required')
      setPremiumModalMessage('This agent requires a Premium subscription. Upgrade to unlock all advanced AI agents.')
      setShowPremiumModal(true)
      // Switch to default free agent
      setCurrentAgent(getDefaultAgent(false))
      return
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
          // Detect mobile and use longer timeout
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
          // Use much longer timeout to allow all retries to complete
          // 6 attempts with delays: 60s + 1s + 65s + 2s + 70s + 3s + 75s + 4s + 80s + 5s + 85s = ~450s max
          // Add buffer for network overhead: 540s (9 minutes) should be safe for mobile
          const clientTimeout = isMobile ? 540000 : 480000
          
          // Add timeout to client-side fetch (longer for mobile)
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), clientTimeout)
          
          // Strip images from all messages except the last one to prevent API errors
          // Only the current message (last one) should have images
          // CRITICAL: Completely omit images property for non-last messages (don't set to undefined)
          const messagesToSend = newMessages.map((m, index) => {
            const isLastMessage = index === newMessages.length - 1
            if (isLastMessage && m.images && m.images.length > 0) {
              // Only include images in the last message
              return {
                role: m.role,
                content: m.content,
                images: m.images
              }
            } else {
              // Completely omit images property for all other messages
              return {
                role: m.role,
                content: m.content
                // No images property at all
              }
            }
          })
          
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: messagesToSend,
              userId: user.id,
              agent: currentAgent, // Pass current agent to API
            }),
            signal: controller.signal,
          })
          
          clearTimeout(timeoutId)

          // Read response data first (even for errors, API returns JSON with error message)
      let data
      try {
        // Check if response is HTML (common with 504 errors from Netlify)
        const contentType = response.headers.get('content-type') || ''
        const text = await response.text()
        
        if (contentType.includes('text/html') || text.trim().startsWith('<')) {
          // Server returned HTML instead of JSON (likely a 504 error page)
          console.error('[Chat] Server returned HTML instead of JSON:', {
            status: response.status,
            contentType,
            preview: text.substring(0, 100)
          })
          
          // Create appropriate error based on status code
          if (response.status === 504 || response.status === 502 || response.status === 503) {
            data = {
              response: '⚠️ The AI service is temporarily unavailable.\n\nThe service took too long to respond or is experiencing issues. This can happen on slower connections or when the service is overloaded.\n\n**What you can do:**\n- Wait 30-60 seconds and try again\n- Check your internet connection\n- Try a simpler, shorter question\n- If this persists, try switching to a different AI agent',
              statusCode: response.status,
              suggestModelSwitch: true
            }
          } else {
            data = {
              response: '⚠️ The AI service returned an invalid response. Please try again.',
              statusCode: response.status || 500,
              suggestModelSwitch: false
            }
          }
        } else {
          // Try to parse as JSON
          data = JSON.parse(text)
        }
      } catch (jsonError) {
        // If JSON parsing fails, create a fallback error response
        console.error('[Chat] Failed to parse response as JSON:', jsonError)
        
        // Check status code to provide appropriate error message
        if (response.status === 504 || response.status === 502 || response.status === 503) {
          data = {
            response: '⚠️ The AI service is temporarily unavailable.\n\nThe service took too long to respond or is experiencing issues. This can happen on slower connections or when the service is overloaded.\n\n**What you can do:**\n- Wait 30-60 seconds and try again\n- Check your internet connection\n- Try a simpler, shorter question\n- If this persists, try switching to a different AI agent',
            statusCode: response.status,
            suggestModelSwitch: true
          }
        } else {
          data = {
            response: '⚠️ The AI service returned an invalid response. Please try again.',
            statusCode: response.status || 500,
            suggestModelSwitch: false
          }
        }
      }
      
      if (!response.ok) {
        // If API returned an error message, use it; otherwise use status code
        // Include status code and model switch suggestion in error for better detection
        const statusCode = data?.statusCode || response.status
        const suggestModelSwitch = data?.suggestModelSwitch || false
        
        if (data && data.response) {
          const error = new Error(data.response)
          ;(error as any).statusCode = statusCode
          ;(error as any).suggestModelSwitch = suggestModelSwitch
          throw error
        }
        const error = new Error(`API error: ${response.status} ${response.statusText}`)
        ;(error as any).statusCode = statusCode
        ;(error as any).suggestModelSwitch = suggestModelSwitch
        throw error
      }
      
      if (!data || !data.response) {
        throw new Error('Invalid response from API')
      }
      
      // Decode HTML entities in the response
      const decodeHtmlEntities = (text: string): string => {
        if (!text || typeof text !== 'string') return text
        
        let decoded = text
        
        // CRITICAL: Decode numeric entities FIRST (decimal format like &#039;)
        decoded = decoded.replace(/&#0*(\d+);/g, (match, num) => {
          const charCode = parseInt(num, 10)
          if (charCode >= 0 && charCode <= 0x10FFFF) {
            try {
              return String.fromCharCode(charCode)
            } catch (e) {
              return match
            }
          }
          return match
        })
        
        // Decode hex entities: &#x27; etc.
        decoded = decoded.replace(/&#x([0-9a-fA-F]+);/gi, (match, hex) => {
          const charCode = parseInt(hex, 16)
          if (charCode >= 0 && charCode <= 0x10FFFF) {
            try {
              return String.fromCharCode(charCode)
            } catch (e) {
              return match
            }
          }
          return match
        })
        
        // Use textarea method which handles all named HTML entities automatically
        const textarea = document.createElement('textarea')
        textarea.innerHTML = decoded
        decoded = textarea.value
        
        // Final pass: catch any remaining numeric entities
        decoded = decoded.replace(/&#0*(\d+);/g, (match, num) => {
          const charCode = parseInt(num, 10)
          if (charCode >= 0 && charCode <= 0x10FFFF) {
            try {
              return String.fromCharCode(charCode)
            } catch (e) {
              return match
            }
          }
          return match
        })
        
        return decoded
      }
      
      const decodedResponse = decodeHtmlEntities(data.response)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: decodedResponse,
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
      // Log error for debugging
      console.error('[Chat] Error calling AI:', {
        message: error instanceof Error ? error.message : String(error),
        statusCode: (error as any)?.statusCode,
        suggestModelSwitch: (error as any)?.suggestModelSwitch
      })
      
      let errorContent = `⚠️ The AI service is temporarily unavailable.

Please wait a moment and try again.`
      const suggestModelSwitch = (error as any)?.suggestModelSwitch || false
      
      // Handle timeout errors specifically
      if (error instanceof Error) {
        // Check status code first (most reliable)
        const statusCode = (error as any).statusCode
        
        // If the error message already contains formatted content from API (starts with ⚠️ or contains markdown),
        // use it directly as it's already properly formatted
        if (error.message.includes('⚠️') || error.message.includes('**') || error.message.startsWith('🖼️') || error.message.includes('❌')) {
          errorContent = error.message
        } else if (statusCode === 502 || error.message.includes('502')) {
          errorContent = `⚠️ The AI service is temporarily unavailable.

The service gateway is experiencing temporary issues. Please wait 15-30 seconds and try again.`
        } else if (statusCode === 503 || error.message.includes('503')) {
          errorContent = `⚠️ The AI service is temporarily unavailable.

The service is temporarily overloaded. Please wait 15-30 seconds and try again.`
        } else if (statusCode === 504 || error.message.includes('504') || error.message.includes('Gateway Timeout')) {
          errorContent = `⚠️ The AI service is temporarily unavailable.

The service took too long to respond. Please check your internet connection and try again.`
        } else if (error.name === 'AbortError' || error.message.includes('timeout')) {
          errorContent = `⚠️ The AI service is temporarily unavailable.

The request took too long to complete. This can happen on slower connections. Please wait 30-60 seconds and try again.`
        } else if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
          errorContent = `⚠️ Network Error

I couldn't connect to the AI service. Please check your internet connection and try again.`
        }
      }
      
      // Add model switch suggestion if applicable
      if (suggestModelSwitch) {
        const currentAgentData = AGENTS[currentAgent]
        const isProAgent = currentAgentData?.plan === 'pro'
        
        if (isProAgent) {
          // Find a free alternative
          const freeAgents = Object.values(AGENTS).filter(a => a.plan === 'free')
          if (freeAgents.length > 0) {
            errorContent += `\n\n💡 **Tip:** If this persists, try switching to a lighter agent like **${freeAgents[0].name}** which may be more stable on slower connections.`
          }
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
      // Always stop loading, even on error
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
        className="md:hidden fixed top-[76px] left-4 z-40 p-2.5 bg-[var(--bg-elevated)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-lg shadow-lg hover:border-[var(--accent-primary)] transition-colors touch-manipulation"
        style={{
          marginTop: 'env(safe-area-inset-top, 0)'
        }}
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
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 top-[60px] z-50 transition-transform duration-300 ease-in-out w-full max-w-[280px] md:w-60 h-full`}>
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
          className="md:hidden fixed inset-0 bg-black bg-opacity-60 z-40"
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
          onShowPremiumModal={(title, message) => {
            setPremiumModalTitle(title)
            setPremiumModalMessage(message)
            setShowPremiumModal(true)
          }}
        />
      </div>

      {/* Premium Modal */}
      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => {
          setShowPremiumModal(false)
        }}
        title={premiumModalTitle}
        message={premiumModalMessage}
        showUpgradeButtons={true}
      />
    </div>
  )
}
