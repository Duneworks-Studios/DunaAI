'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase'
import { getUserPlan, canSendMessage, type UserPlan } from '@/lib/planDetection'
import ChatSidebar from '@/components/ChatSidebar'
import ChatWindow from '@/components/ChatWindow'
import PremiumModal from '@/components/PremiumModal'
import { useAgent } from '@/contexts/AgentContext'
import type { User } from '@supabase/supabase-js'

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
        const sessionsWithDates = parsed.map((s: any) => ({
          ...s,
          messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
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

  const handleSend = async () => {
    if (!input.trim() || loading || !user) return

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
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: newMessages.map(m => ({ role: m.role, content: m.content })),
              userId: user.id,
              agent: currentAgent, // Pass current agent to API
            }),
          })

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
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      }
      setMessages([...newMessages, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
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
