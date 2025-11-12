'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAgent } from '@/contexts/AgentContext'
import type { UserPlan } from '@/lib/planDetection'

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

interface ChatSidebarProps {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onCreateNewChat: () => void
  onClose?: () => void
  userPlan: UserPlan | null
  onAgentSelect: (agent: 'chat' | 'coding') => void
}

export default function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateNewChat,
  onClose,
  userPlan,
  onAgentSelect,
}: ChatSidebarProps) {
  const { currentAgent } = useAgent()
  const isPro = userPlan?.isUnlimited || false

  const handleAgentClick = (agent: 'chat' | 'coding') => {
    if (agent === 'coding' && !isPro) {
      onAgentSelect('coding')
      return
    }
    onAgentSelect(agent)
    onClose?.()
  }

  return (
    <aside className="w-full h-full bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] flex flex-col overflow-hidden">
      {/* AI Agents Section */}
      <div className="p-4 border-b border-[var(--border-primary)] flex-shrink-0">
        <div className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-3 font-semibold">
          AI Agents
        </div>
        <div className="space-y-2">
          <button
            onClick={() => handleAgentClick('chat')}
            className={`w-full px-4 py-3 rounded-xl text-left transition-all duration-200 text-sm premium-card ${
              currentAgent === 'chat'
                ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)]'
                : 'hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]'
            }`}
          >
            <div className="font-semibold">Chat Agent</div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">General assistant</div>
          </button>
          <button
            onClick={() => handleAgentClick('coding')}
            className={`w-full px-4 py-3 rounded-xl text-left transition-all duration-200 text-sm premium-card relative ${
              currentAgent === 'coding'
                ? 'bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)]'
                : 'hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]'
            } ${!isPro ? 'opacity-70' : ''}`}
          >
            <div className="font-semibold flex items-center justify-between">
              <span>Coding Agent</span>
              {!isPro && (
                <span className="text-xs px-2 py-1 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-full font-semibold">
                  Pro
                </span>
              )}
            </div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">Code-focused assistant</div>
          </button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-[var(--border-primary)] flex-shrink-0">
        <button
          onClick={() => {
            onCreateNewChat()
            onClose?.()
          }}
          className="w-full btn-primary text-sm"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-3 min-h-0">
        <div className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-3 px-2 font-semibold">
          Conversations
        </div>
        <AnimatePresence>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">
              No conversations yet
            </div>
          ) : (
            sessions.map((session) => (
              <motion.button
                key={session.id}
                onClick={() => {
                  onSelectSession(session.id)
                  onClose?.()
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
            ))
          )}
        </AnimatePresence>
      </div>
    </aside>
  )
}
