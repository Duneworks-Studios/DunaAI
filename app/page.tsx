'use client'

import Intro from '@/components/Intro'

export default function Home() {
  // No loading state - render immediately for better performance
  return (
    <div className="overflow-x-hidden">
      <Intro />
    </div>
  )
}
