'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const features = [
  {
    title: 'AI Assistant',
    description: 'Smart, adaptive, and context-aware. Your intelligent companion for every browsing session.',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Robot Head */}
        <circle cx="50" cy="35" r="18" fill="#4A90E2" />
        <circle cx="45" cy="32" r="3" fill="white" />
        <circle cx="55" cy="32" r="3" fill="white" />
        <rect x="48" y="38" width="4" height="2" rx="1" fill="black" />
        <path d="M 35 25 L 30 20 L 25 25" stroke="#FF69B4" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M 65 25 L 70 20 L 75 25" stroke="#FF69B4" strokeWidth="3" strokeLinecap="round" fill="none" />
        <rect x="30" y="50" width="40" height="25" rx="5" fill="#2A2A2A" stroke="#4A90E2" strokeWidth="2" />
        <rect x="38" y="58" width="8" height="8" rx="2" fill="#4A90E2" />
        <rect x="54" y="58" width="8" height="8" rx="2" fill="#4A90E2" />
      </svg>
    ),
    color: 'from-blue-500 to-blue-600',
    glowColor: 'rgba(74, 144, 226, 0.3)',
  },
  {
    title: 'Performance',
    description: 'Lightweight, fast, and secure. Experience blazing speeds without compromising on security.',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Lightning Bolt */}
        <path d="M 50 10 L 35 50 L 50 50 L 45 90 L 65 50 L 50 50 Z" fill="#FF6B35" stroke="#FF6B35" strokeWidth="2" />
      </svg>
    ),
    color: 'from-orange-500 to-orange-600',
    glowColor: 'rgba(255, 107, 53, 0.3)',
  },
  {
    title: 'Cloud Sync',
    description: 'Private data sync across all your devices. Seamless continuity, wherever you go.',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Cloud */}
        <path d="M 30 50 Q 20 50 20 60 Q 20 70 30 70 L 70 70 Q 80 70 80 60 Q 80 50 70 50 Q 70 40 60 40 Q 50 30 40 40 Q 30 40 30 50 Z" 
              fill="white" 
              stroke="rgba(147, 51, 234, 0.5)" 
              strokeWidth="2" />
        <circle cx="35" cy="55" r="3" fill="rgba(147, 51, 234, 0.3)" />
        <circle cx="50" cy="50" r="4" fill="rgba(147, 51, 234, 0.4)" />
        <circle cx="65" cy="55" r="3" fill="rgba(147, 51, 234, 0.3)" />
      </svg>
    ),
    color: 'from-purple-500 to-purple-600',
    glowColor: 'rgba(147, 51, 234, 0.3)',
  },
  {
    title: 'Privacy First',
    description: 'Zero tracking. 100% encrypted sessions. Your data belongs to you, always.',
    icon: (
      <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Padlock */}
        <rect x="35" y="45" width="30" height="35" rx="3" fill="#FF6B35" stroke="#FF6B35" strokeWidth="2" />
        <path d="M 40 45 L 40 35 Q 40 25 50 25 Q 60 25 60 35 L 60 45" 
              stroke="#FF6B35" 
              strokeWidth="3" 
              strokeLinecap="round" 
              fill="none" />
        <circle cx="50" cy="60" r="4" fill="white" />
      </svg>
    ),
    color: 'from-orange-500 to-orange-600',
    glowColor: 'rgba(255, 107, 53, 0.3)',
  },
]

export default function Features() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <section id="features" className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6 overflow-hidden">
      {/* Background with subtle gold glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(255,215,0,0.02)] to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 text-gradient">
            Powerful Features
          </h2>
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-[var(--text-secondary)] px-4">
            Everything you need for intelligent, efficient browsing
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="relative group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={isMobile ? {} : { scale: 1.02, y: -5 }}
            >
              {/* Card */}
              <div 
                className="relative h-full bg-[#1a1a1a] border border-[rgba(255,215,0,0.2)] rounded-xl p-6 sm:p-8 backdrop-blur-sm"
                style={{
                  boxShadow: `0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 215, 0, 0.1)`,
                }}
              >
                {/* Glow effect on hover */}
                <div 
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at center, ${feature.glowColor}, transparent 70%)`,
                    filter: 'blur(20px)',
                  }}
                />

                {/* Icon Container */}
                <div className="relative mb-4 sm:mb-6 flex items-center justify-center">
                  <div className="relative">
                    {feature.icon}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        filter: `drop-shadow(0 0 20px ${feature.glowColor})`,
                      }}
                    />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-[var(--text-primary)] text-center">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed text-center">
                  {feature.description}
                </p>

                {/* Bottom accent line */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[rgba(255,215,0,0.5)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
