'use client'

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react'

export type AgentType = 'chat' | 'coding'

interface AgentContextType {
  currentAgent: AgentType
  setCurrentAgent: (agent: AgentType) => void
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export const AgentProvider = ({ children }: { children: ReactNode }) => {
  const [currentAgent, setCurrentAgentState] = useState<AgentType>('chat')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load agent from localStorage
    const savedAgent = localStorage.getItem('duna-current-agent') as AgentType
    if (savedAgent && (savedAgent === 'chat' || savedAgent === 'coding')) {
      setCurrentAgentState(savedAgent)
    }
    setMounted(true)
  }, [])

  const setCurrentAgent = (agent: AgentType) => {
    setCurrentAgentState(agent)
    localStorage.setItem('duna-current-agent', agent)
  }

  return (
    <AgentContext.Provider value={{ currentAgent, setCurrentAgent }}>
      {children}
    </AgentContext.Provider>
  )
}

export const useAgent = () => {
  const context = useContext(AgentContext)
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider')
  }
  return context
}

