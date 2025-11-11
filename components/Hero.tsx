'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Premium Gold Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Gold Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4), transparent 70%)',
            boxShadow: '0 0 100px rgba(255, 215, 0, 0.3)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 60, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4), transparent 70%)',
            boxShadow: '0 0 100px rgba(212, 175, 55, 0.3)',
          }}
          animate={{
            scale: [1, 1.4, 1],
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2), transparent 70%)',
            boxShadow: '0 0 150px rgba(255, 215, 0, 0.2)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Animated Gold Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 215, 0, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 215, 0, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Floating Gold Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(255, 215, ${Math.random() * 100 + 155}, 0.8), transparent)`,
              boxShadow: `0 0 ${6 + Math.random() * 8}px rgba(255, 215, 0, ${0.6 + Math.random() * 0.4})`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1.5, 0.5],
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

        {/* Rotating Gold Rings */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`ring-${i}`}
            className="absolute rounded-full border-2"
            style={{
              width: `${200 + i * 150}px`,
              height: `${200 + i * 150}px`,
              borderColor: `rgba(255, 215, 0, ${0.2 - i * 0.05})`,
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`,
              boxShadow: `0 0 ${20 + i * 10}px rgba(255, 215, 0, ${0.3 - i * 0.1})`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
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
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[rgba(212,175,55,0.3)] mb-8 glow-hover"
          >
            <motion.span 
              className="w-2 h-2 rounded-full bg-[#ffd700]"
              animate={{
                scale: [1, 1.3, 1],
                boxShadow: [
                  '0 0 5px rgba(255, 215, 0, 0.8)',
                  '0 0 15px rgba(255, 215, 0, 1)',
                  '0 0 5px rgba(255, 215, 0, 0.8)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              Premium AI Browser by Duneworks
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <motion.span 
              className="text-gradient block mb-2"
              animate={{
                filter: [
                  'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))',
                  'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))',
                  'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              Duna
            </motion.span>
            <span className="text-[var(--text-primary)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light">
              Intelligence
            </span>
          </motion.h1>
          
          <motion.p
            className="text-xl sm:text-2xl md:text-3xl font-light mb-6 text-[var(--text-secondary)] max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            The Premium AI Browser Reimagined
          </motion.p>
          
          <motion.p
            className="text-base sm:text-lg md:text-xl mb-12 max-w-2xl mx-auto text-[var(--text-tertiary)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Experience the future of intelligent browsing. Designed for those who demand performance, elegance, and precision.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <motion.a
              href="#pricing"
              className="btn-primary group relative overflow-hidden"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Get Started Free</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#ffed4e] via-[#ffd700] to-[#d4af37]"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
            </motion.a>
            
            <motion.a
              href={process.env.NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary group relative overflow-hidden"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>Upgrade to Pro</span>
                <motion.svg 
                  className="w-4 h-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </span>
            </motion.a>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-[var(--text-tertiary)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            {[
              { icon: '✓', text: 'Unlimited Messages' },
              { icon: '✓', text: 'Premium AI Agents' },
              { icon: '✓', text: '24/7 Support' },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
              >
                <motion.svg 
                  className="w-5 h-5 text-[var(--accent-primary)]" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </motion.svg>
                <span>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.3, repeat: Infinity, repeatType: 'reverse' }}
      >
        <motion.svg 
          className="w-6 h-6 text-[var(--text-secondary)]" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          animate={{
            y: [0, 10, 0],
            filter: [
              'drop-shadow(0 0 5px rgba(255, 215, 0, 0.5))',
              'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))',
              'drop-shadow(0 0 5px rgba(255, 215, 0, 0.5))',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </motion.svg>
      </motion.div>
    </section>
  )
}
