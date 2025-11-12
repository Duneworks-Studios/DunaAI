// Client-side helper for message counting with localStorage fallback

export function getLocalMessageCount(userId: string): number {
  if (typeof window === 'undefined') return 0
  
  const today = new Date().toISOString().split('T')[0]
  const storageKey = `messages_${userId}_${today}`
  const stored = localStorage.getItem(storageKey)
  return stored ? parseInt(stored, 10) : 0
}

export function incrementLocalMessageCount(userId: string): void {
  if (typeof window === 'undefined') return
  
  const today = new Date().toISOString().split('T')[0]
  const storageKey = `messages_${userId}_${today}`
  const currentCount = getLocalMessageCount(userId)
  localStorage.setItem(storageKey, String(currentCount + 1))
}

export function resetLocalMessageCount(userId: string): void {
  if (typeof window === 'undefined') return
  
  const today = new Date().toISOString().split('T')[0]
  const storageKey = `messages_${userId}_${today}`
  localStorage.removeItem(storageKey)
}

