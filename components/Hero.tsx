'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Ultra-Premium Gold Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Massive Gold Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.6), rgba(255, 237, 78, 0.4), transparent 70%)',
            boxShadow: '0 0 200px rgba(255, 215, 0, 0.5), 0 0 400px rgba(212, 175, 55, 0.3)',
          }}
          animate={{
            scale: [1, 1.5, 1],
            x: [0, 100, 0],
            y: [0, -60, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] rounded-full blur-[140px]"
          style={{
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.6), rgba(255, 215, 0, 0.4), transparent 70%)',
            boxShadow: '0 0 250px rgba(212, 175, 55, 0.5), 0 0 500px rgba(255, 215, 0, 0.3)',
          }}
          animate={{
            scale: [1, 1.6, 1],
            x: [0, -80, 0],
            y: [0, 80, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[800px] h-[800px] rounded-full blur-[160px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4), rgba(255, 237, 78, 0.3), transparent 70%)',
            boxShadow: '0 0 300px rgba(255, 215, 0, 0.4), 0 0 600px rgba(212, 175, 55, 0.2)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Animated Gold Grid Pattern with Pulse */}
        <motion.div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 215, 0, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 215, 0, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
          animate={{
            opacity: [0.05, 0.12, 0.05],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Ultra-Premium Floating Gold Particles */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(255, 215, ${Math.random() * 100 + 155}, 1), transparent)`,
              boxShadow: `0 0 ${8 + Math.random() * 12}px rgba(255, 215, 0, ${0.8 + Math.random() * 0.2})`,
            }}
            animate={{
              y: [0, -60, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 2, 0.8],
              x: [0, Math.random() * 60 - 30, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 5 + Math.random() * 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 3,
            }}
          />
        ))}

        {/* Rotating Gold Rings - Multiple Layers */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute rounded-full border-2"
            style={{
              width: `${300 + i * 200}px`,
              height: `${300 + i * 200}px`,
              borderColor: `rgba(255, 215, 0, ${0.3 - i * 0.05})`,
              left: `${15 + i * 15}%`,
              top: `${25 + i * 15}%`,
              boxShadow: `0 0 ${30 + i * 15}px rgba(255, 215, 0, ${0.4 - i * 0.08})`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 25 + i * 8,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 3,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Ultra-Premium Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass border-2 border-[rgba(255,215,0,0.4)] mb-10 glow-hover"
          >
            <motion.span 
              className="w-3 h-3 rounded-full bg-[#ffd700]"
              animate={{
                scale: [1, 1.5, 1],
                boxShadow: [
                  '0 0 10px rgba(255, 215, 0, 1)',
                  '0 0 25px rgba(255, 215, 0, 1), 0 0 50px rgba(255, 215, 0, 0.8)',
                  '0 0 10px rgba(255, 215, 0, 1)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <span className="text-sm font-bold text-[var(--text-secondary)] tracking-wider uppercase">
              Premium AI Browser by Duneworks
            </span>
          </motion.div>

          {/* Ultra-Premium Main Heading */}
          <motion.h1
            className="font-display text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] font-black mb-8 leading-[0.9]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5, type: 'spring', stiffness: 100 }}
          >
            <motion.span 
              className="text-gradient block mb-4"
              animate={{
                filter: [
                  'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 40px rgba(255, 215, 0, 0.6))',
                  'drop-shadow(0 0 40px rgba(255, 215, 0, 1)) drop-shadow(0 0 80px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 120px rgba(212, 175, 55, 0.6))',
                  'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 40px rgba(255, 215, 0, 0.6))',
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              Duna
            </motion.span>
            <motion.span 
              className="text-[var(--text-primary)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light block"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              Intelligence
            </motion.span>
          </motion.h1>
          
          <motion.p
            className="text-2xl sm:text-3xl md:text-4xl font-light mb-8 text-[var(--text-secondary)] max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            The Premium AI Browser Reimagined
          </motion.p>
          
          <motion.p
            className="text-lg sm:text-xl md:text-2xl mb-16 max-w-3xl mx-auto text-[var(--text-tertiary)] leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            Experience the future of intelligent browsing. Designed for those who demand performance, elegance, and precision.
          </motion.p>

          {/* Ultra-Premium CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4 }}
          >
            <motion.a
              href="#pricing"
              className="btn-primary group relative overflow-hidden text-lg px-12 py-6"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <span>Get Started Free</span>
                <motion.svg 
                  className="w-5 h-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#ffed4e] via-[#ffd700] to-[#d4af37]"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.a>
            
            <motion.a
              href={process.env.NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary group relative overflow-hidden text-lg px-12 py-6"
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <span>Upgrade to Pro</span>
                <motion.svg 
                  className="w-5 h-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  animate={{ x: [0, 6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </span>
            </motion.a>
          </motion.div>

          {/* Ultra-Premium Trust Indicators */}
          <motion.div
            className="flex flex-wrap justify-center items-center gap-12 text-base sm:text-lg text-[var(--text-tertiary)]"
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
                className="flex items-center gap-3 group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.6 + index * 0.15 }}
                whileHover={{ scale: 1.1, x: 5 }}
              >
                <motion.svg 
                  className="w-6 h-6 text-[var(--accent-primary)] group-hover:scale-125" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
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

      {/* Ultra-Premium Scroll Indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2, repeat: Infinity, repeatType: 'reverse' }}
      >
        <motion.svg 
          className="w-8 h-8 text-[var(--text-secondary)]" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          animate={{
            y: [0, 15, 0],
            filter: [
              'drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))',
              'drop-shadow(0 0 25px rgba(255, 215, 0, 1)) drop-shadow(0 0 50px rgba(255, 215, 0, 0.8))',
              'drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))',
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </motion.svg>
      </motion.div>
    </section>
  )
}
