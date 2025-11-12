'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Hero() {
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Optimized Background - Reduced on Mobile */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Responsive Gold Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4), rgba(255, 237, 78, 0.3), transparent 70%)',
            boxShadow: '0 0 100px rgba(255, 215, 0, 0.3), 0 0 200px rgba(212, 175, 55, 0.2)',
          }}
          animate={isMobile ? {} : {
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
            rotate: [0, 90, 180],
          }}
          transition={isMobile ? {} : {
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] md:w-[700px] md:h-[700px] rounded-full blur-[90px] sm:blur-[120px] md:blur-[140px]"
          style={{
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4), rgba(255, 215, 0, 0.3), transparent 70%)',
            boxShadow: '0 0 120px rgba(212, 175, 55, 0.3), 0 0 250px rgba(255, 215, 0, 0.2)',
          }}
          animate={isMobile ? {} : {
            scale: [1, 1.4, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
            rotate: [360, 180, 0],
          }}
          transition={isMobile ? {} : {
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] md:w-[800px] md:h-[800px] rounded-full blur-[100px] sm:blur-[140px] md:blur-[160px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3), rgba(255, 237, 78, 0.2), transparent 70%)',
            boxShadow: '0 0 150px rgba(255, 215, 0, 0.3), 0 0 300px rgba(212, 175, 55, 0.15)',
          }}
          animate={isMobile ? {} : {
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={isMobile ? {} : {
            duration: 35,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Simplified Grid Pattern - Static on Mobile */}
        {!isMobile && (
          <motion.div 
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 215, 0, 0.2) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 215, 0, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
            animate={{
              opacity: [0.04, 0.08, 0.04],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Reduced Particles - Only on Desktop */}
        {!isMobile && [...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(255, 215, ${Math.random() * 100 + 155}, 1), transparent)`,
              boxShadow: `0 0 ${6 + Math.random() * 8}px rgba(255, 215, 0, ${0.6 + Math.random() * 0.2})`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.5, 0.8],
              x: [0, Math.random() * 40 - 20, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Simplified Rings - Only on Desktop */}
        {!isMobile && [...Array(3)].map((_, i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute rounded-full border-2"
            style={{
              width: `${200 + i * 150}px`,
              height: `${200 + i * 150}px`,
              borderColor: `rgba(255, 215, 0, ${0.2 - i * 0.05})`,
              left: `${20 + i * 20}%`,
              top: `${30 + i * 20}%`,
              boxShadow: `0 0 ${20 + i * 10}px rgba(255, 215, 0, ${0.3 - i * 0.05})`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 2,
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
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#ffd700]"
              animate={isMobile ? {} : {
                scale: [1, 1.3, 1],
                boxShadow: [
                  '0 0 8px rgba(255, 215, 0, 0.8)',
                  '0 0 20px rgba(255, 215, 0, 1), 0 0 40px rgba(255, 215, 0, 0.6)',
                  '0 0 8px rgba(255, 215, 0, 0.8)',
                ],
              }}
              transition={isMobile ? {} : {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
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
              animate={isMobile ? {} : {
                filter: [
                  'drop-shadow(0 0 15px rgba(255, 215, 0, 0.6)) drop-shadow(0 0 30px rgba(255, 215, 0, 0.4))',
                  'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 60px rgba(255, 215, 0, 0.6)) drop-shadow(0 0 90px rgba(212, 175, 55, 0.4))',
                  'drop-shadow(0 0 15px rgba(255, 215, 0, 0.6)) drop-shadow(0 0 30px rgba(255, 215, 0, 0.4))',
                ],
              }}
              transition={isMobile ? {} : {
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
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
