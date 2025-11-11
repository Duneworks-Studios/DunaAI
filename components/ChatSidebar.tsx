'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAgent } from '@/contexts/AgentContext'
import type { UserPlan } from '@/lib/planDetection'

interface ChatSession {
  id: string
  title: string
  messages: any[]
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
      onAgentSelect('coding') // This will trigger the premium modal
      return
    }
    onAgentSelect(agent)
    onClose?.()
  }

  return (
    <aside className="w-full h-full bg-[#2a2a2a] border-r border-[#333] flex flex-col overflow-hidden">
      {/* AI Agents Section */}
      <div className="p-3 sm:p-4 border-b border-[#333] flex-shrink-0">
        <div className="text-xs uppercase tracking-wider text-[#888888] mb-3 font-medium">
          AI Agents
        </div>
        <div className="space-y-2">
          <button
            onClick={() => handleAgentClick('chat')}
            className={`w-full px-3 py-2 rounded-xl text-left transition-all duration-200 text-sm ${
              currentAgent === 'chat'
                ? 'bg-[#333] border border-[#d4c4a0] border-opacity-40 text-[#d4c4a0]'
                : 'hover:bg-[#222222] text-[#BBBBBB]'
            }`}
          >
            <div className="font-medium">Chat Agent</div>
            <div className="text-xs text-[#888888] mt-0.5">General assistant</div>
          </button>
          <button
            onClick={() => handleAgentClick('coding')}
            className={`w-full px-3 py-2 rounded-xl text-left transition-all duration-200 text-sm relative ${
              currentAgent === 'coding'
                ? 'bg-[#333] border border-[#d4c4a0] border-opacity-40 text-[#d4c4a0]'
                : 'hover:bg-[#222222] text-[#BBBBBB]'
            } ${!isPro ? 'opacity-60' : ''}`}
          >
            <div className="font-medium flex items-center justify-between">
              <span>Coding Agent</span>
              {!isPro && (
                <span className="text-xs px-1.5 py-0.5 bg-[#d4c4a0] bg-opacity-10 text-[#d4c4a0] rounded text-[10px]">
                  Pro
                </span>
              )}
            </div>
            <div className="text-xs text-[#888888] mt-0.5">Code-focused assistant</div>
          </button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-3 sm:p-4 border-b border-[#333] flex-shrink-0">
        <button
          onClick={() => {
            onCreateNewChat()
            onClose?.()
          }}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[#d4c4a0] bg-opacity-10 text-[#d4c4a0] rounded-lg font-medium hover:bg-opacity-20 transition-all duration-200 text-xs sm:text-sm"
        >
          New Chat
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-2 min-h-0">
        <div className="text-xs uppercase tracking-wider text-[#888888] mb-2 px-2 font-medium">
          Conversations
        </div>
        <AnimatePresence>
          {sessions.map((session) => (
            <motion.button
              key={session.id}
              onClick={() => {
                onSelectSession(session.id)
                onClose?.()
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`w-full text-left px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg mb-1 transition-all duration-200 ${
                activeSessionId === session.id
                  ? 'bg-[#333] border-l-2 border-[#d4c4a0]'
                  : 'hover:bg-[#333] hover:bg-opacity-50'
              }`}
            >
              <div className="text-xs sm:text-sm font-medium text-[#EEEEEE] truncate">
                {session.title}
              </div>
              <div className="text-[10px] sm:text-xs mt-1 text-[#888888]">
                {session.lastMessage.toLocaleDateString()}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </aside>
  )
}

