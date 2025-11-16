'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'

export default function Hero() {
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Only check once on mount to prevent re-renders
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    // Debounce resize to prevent constant re-renders
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        checkMobile()
      }, 150)
    }
    
    window.addEventListener('resize', handleResize, { passive: true })
    
    return () => {
      clearTimeout(resizeTimeout)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Memoize particle data to prevent re-renders - stable values
  const particles = useMemo(() => {
    if (isMobile || prefersReducedMotion) return []
    // Use fixed seed values for consistent animations
    const seed = 12345
    return Array.from({ length: 8 }, (_, i) => {
      const rng = (seed: number, i: number) => {
        const x = Math.sin(seed * (i + 1)) * 10000
        return x - Math.floor(x)
      }
      return {
        id: i,
        width: 2 + rng(seed, i * 2) * 2,
        height: 2 + rng(seed, i * 2 + 1) * 2,
        left: rng(seed, i * 3) * 100,
        top: rng(seed, i * 3 + 1) * 100,
        background: `radial-gradient(circle, rgba(255, 215, ${200 + rng(seed, i * 4) * 50}, 1), transparent)`,
        boxShadow: `0 0 ${4 + rng(seed, i * 5) * 4}px rgba(255, 215, 0, ${0.4 + rng(seed, i * 6) * 0.2})`,
        duration: 5 + rng(seed, i * 7) * 2,
        delay: rng(seed, i * 8) * 2,
        x: (rng(seed, i * 9) - 0.5) * 30,
      }
    })
  }, []) // Empty deps - only calculate once

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Optimized Background - Reduced on Mobile */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Animated Gold Gradient Orbs - Stable animations */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px] will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3), rgba(255, 237, 78, 0.2), transparent 70%)',
            boxShadow: '0 0 80px rgba(255, 215, 0, 0.25), 0 0 150px rgba(212, 175, 55, 0.15)',
          }}
          animate={isMobile || prefersReducedMotion ? {} : {
            scale: [1, 1.15, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={isMobile || prefersReducedMotion ? {} : {
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatType: 'loop',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] md:w-[550px] md:h-[550px] rounded-full blur-[70px] sm:blur-[90px] md:blur-[110px] will-change-transform"
          style={{
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3), rgba(255, 215, 0, 0.2), transparent 70%)',
            boxShadow: '0 0 90px rgba(212, 175, 55, 0.25), 0 0 180px rgba(255, 215, 0, 0.15)',
          }}
          animate={isMobile || prefersReducedMotion ? {} : {
            scale: [1, 1.2, 1],
            x: [0, -25, 0],
            y: [0, 25, 0],
          }}
          transition={isMobile || prefersReducedMotion ? {} : {
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
            repeatType: 'loop',
          }}
        />

        {/* Static Grid Pattern - No animation for better performance */}
        {!isMobile && !prefersReducedMotion && (
          <div 
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 215, 0, 0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 215, 0, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
        )}

        {/* Animated Particles - Stable animations */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full will-change-transform"
            style={{
              width: `${particle.width}px`,
              height: `${particle.height}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              background: particle.background,
              boxShadow: particle.boxShadow,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.15, 0.6, 0.15],
              scale: [0.9, 1.2, 0.9],
              x: [0, particle.x, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: particle.delay,
              repeatType: 'loop',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full glass border-2 border-[rgba(255,215,0,0.4)] mb-6 sm:mb-10"
          >
            <motion.span 
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#ffd700] will-change-transform"
              animate={isMobile || prefersReducedMotion ? {} : {
                scale: [1, 1.2, 1],
                boxShadow: [
                  '0 0 6px rgba(255, 215, 0, 0.7)',
                  '0 0 15px rgba(255, 215, 0, 0.9), 0 0 30px rgba(255, 215, 0, 0.5)',
                  '0 0 6px rgba(255, 215, 0, 0.7)',
                ],
              }}
              transition={isMobile || prefersReducedMotion ? {} : {
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatType: 'loop',
              }}
            />
            <span className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] tracking-wider uppercase">
              Premium AI Browser
            </span>
          </motion.div>

          {/* Main Heading - Responsive */}
          <motion.h1
            className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[12rem] font-black mb-6 sm:mb-8 leading-[0.9]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5, type: 'spring', stiffness: 100 }}
          >
            <motion.span 
              className="text-gradient block mb-2 sm:mb-4"
              animate={isMobile || prefersReducedMotion ? {} : {
                filter: [
                  'drop-shadow(0 0 15px rgba(255, 215, 0, 0.5)) drop-shadow(0 0 25px rgba(255, 215, 0, 0.3))',
                  'drop-shadow(0 0 25px rgba(255, 215, 0, 0.7)) drop-shadow(0 0 50px rgba(255, 215, 0, 0.5))',
                  'drop-shadow(0 0 15px rgba(255, 215, 0, 0.5)) drop-shadow(0 0 25px rgba(255, 215, 0, 0.3))',
                ],
              }}
              transition={isMobile || prefersReducedMotion ? {} : {
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                repeatType: 'loop',
              }}
            >
              Duna
            </motion.span>
            <motion.span 
              className="text-[var(--text-primary)] text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light block"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              Intelligence
            </motion.span>
          </motion.h1>
          
          <motion.p
            className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-light mb-4 sm:mb-8 text-[var(--text-secondary)] max-w-4xl mx-auto leading-relaxed px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            The Premium AI Browser Reimagined
          </motion.p>
          
          <motion.p
            className="text-sm sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-16 max-w-3xl mx-auto text-[var(--text-tertiary)] leading-relaxed px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            Experience the future of intelligent browsing. Designed for those who demand performance, elegance, and precision.
          </motion.p>

          {/* CTA Buttons - Responsive */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-20 px-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4 }}
          >
            <motion.a
              href="#pricing"
              className="btn-primary group relative overflow-hidden text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 w-full sm:w-auto"
              whileHover={isMobile ? {} : { scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                <span>Get Started Free</span>
                <motion.svg 
                  className="w-4 h-4 sm:w-5 sm:h-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  animate={isMobile ? {} : { x: [0, 4, 0] }}
                  transition={isMobile ? {} : { duration: 1.5, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </span>
              {!isMobile && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#ffed4e] via-[#ffd700] to-[#d4af37]"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </motion.a>
            
            <motion.a
              href={process.env.NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary group relative overflow-hidden text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 w-full sm:w-auto"
              whileHover={isMobile ? {} : { scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                <span>Upgrade to Pro</span>
                <motion.svg 
                  className="w-4 h-4 sm:w-5 sm:h-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  animate={isMobile ? {} : { x: [0, 5, 0] }}
                  transition={isMobile ? {} : { duration: 1.5, repeat: Infinity, delay: 0.3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </span>
            </motion.a>
          </motion.div>

          {/* Trust Indicators - Responsive */}
          <motion.div
            className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 text-sm sm:text-base md:text-lg text-[var(--text-tertiary)] px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.6 }}
          >
            {[
              { icon: '✓', text: 'Unlimited Messages' },
              { icon: '✓', text: 'Premium AI Agents' },
              { icon: '✓', text: '24/7 Support' },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2 sm:gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.6 + index * 0.15 }}
                whileHover={isMobile ? {} : { scale: 1.1, x: 5 }}
              >
                <motion.svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent-primary)]" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  animate={isMobile ? {} : {
                    scale: [1, 1.15, 1],
                  }}
                  transition={isMobile ? {} : {
                    duration: 2.5,
                    repeat: Infinity,
                    delay: index * 0.4,
                  }}
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </motion.svg>
                <span className="font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator - Hidden on Mobile */}
      {!isMobile && (
        <motion.div
          className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2, repeat: Infinity, repeatType: 'reverse' }}
        >
          <motion.svg 
            className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--text-secondary)]" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </motion.svg>
        </motion.div>
      )}
    </section>
  )
}
