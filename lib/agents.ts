// Agent definitions for Duna AI
export type AgentId = 
  | 'meta-advanced'  // Pro - Best
  | 'meta'          // Pro - 2nd Best
  | 'universe'      // Pro - 3rd Best
  | 'galaxy'        // Pro - 4th Best
  | 'jupiter'       // Pro - 5th Best
  | 'luna'          // Pro - 6th Best (Coding)
  | 'nova-advanced' // Free - 2nd Last
  | 'nova'          // Free - Last

export interface Agent {
  id: AgentId
  name: string
  description: string
  plan: 'pro' | 'free'
  depth: number // 1 = best, 8 = last
}

export const AGENTS: Record<AgentId, Agent> = {
  'meta-advanced': {
    id: 'meta-advanced',
    name: 'Duna AI Meta Advanced',
    description: 'The Best Agent, Very Advanced And High Quality and Fast Responses',
    plan: 'pro',
    depth: 1,
  },
  'meta': {
    id: 'meta',
    name: 'Duna AI Meta',
    description: 'The 2nd Best Agent Used For Fast and More Simpler Responses but very advanced',
    plan: 'pro',
    depth: 2,
  },
  'universe': {
    id: 'universe',
    name: 'Duna AI Universe',
    description: 'The 3rd Best Agent, A High Level Agent Used For Advanced Questions and Responses',
    plan: 'pro',
    depth: 3,
  },
  'galaxy': {
    id: 'galaxy',
    name: 'Duna AI Galaxy',
    description: 'The 4th Best Agent, Used For Simpler and Fast Responses',
    plan: 'pro',
    depth: 4,
  },
  'jupiter': {
    id: 'jupiter',
    name: 'Duna AI Jupiter',
    description: 'The 5th Best Agent Used For Simple Questions and Fast Responses',
    plan: 'pro',
    depth: 5,
  },
  'luna': {
    id: 'luna',
    name: 'Duna AI Luna',
    description: 'The 6th Best Agent Used For Coding And Advanced Responses',
    plan: 'pro',
    depth: 6,
  },
  'nova-advanced': {
    id: 'nova-advanced',
    name: 'Duna AI Nova Advanced',
    description: 'The 2nd Last Agent, Moderate Responses but still speedy and advanced responses',
    plan: 'free',
    depth: 7,
  },
  'nova': {
    id: 'nova',
    name: 'Duna AI Nova',
    description: 'The Last Agent Used For Regular Questions and Responses',
    plan: 'free',
    depth: 8,
  },
}

// Get available agents based on plan
export function getAvailableAgents(isPro: boolean): Agent[] {
  if (isPro) {
    return Object.values(AGENTS)
  }
  return Object.values(AGENTS).filter(agent => agent.plan === 'free')
}

// Get default agent based on plan
export function getDefaultAgent(isPro: boolean): AgentId {
  return isPro ? 'meta-advanced' : 'nova-advanced'
}

// Check if agent is available for plan
export function isAgentAvailable(agentId: AgentId, isPro: boolean): boolean {
  const agent = AGENTS[agentId]
  if (!agent) return false
  return agent.plan === 'free' || isPro
}

