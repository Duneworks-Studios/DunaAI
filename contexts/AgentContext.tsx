'use client'

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react'
import type { AgentId } from '@/lib/agents'
import { getDefaultAgent } from '@/lib/agents'

interface AgentContextType {
  currentAgent: AgentId
  setCurrentAgent: (agent: AgentId) => void
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export const AgentProvider = ({ children }: { children: ReactNode }) => {
  const [currentAgent, setCurrentAgentState] = useState<AgentId>('nova-advanced')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Load agent from localStorage
    const savedAgent = localStorage.getItem('duna-current-agent') as AgentId
    if (savedAgent) {
      // Validate agent exists (will be checked against available agents in components)
      setCurrentAgentState(savedAgent)
    } else {
      // Default to free agent
      setCurrentAgentState('nova-advanced')
    }
    setMounted(true)
  }, [])

  const setCurrentAgent = (agent: AgentId) => {
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

