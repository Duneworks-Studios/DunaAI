'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

export default function Hero() {
  const { theme } = useTheme()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Dune Background */}
      <div className="absolute inset-0 z-0">
        {/* Background waves - Theme aware */}
        {theme === 'dune' && (
          <>
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-96 opacity-30"
              style={{
                background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.1) 0%, rgba(201, 169, 97, 0.05) 50%, rgba(139, 111, 71, 0.1) 100%)',
                clipPath: 'polygon(0 40%, 100% 30%, 100% 100%, 0% 100%)',
              }}
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-80 opacity-20"
              style={{
                background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.1) 0%, rgba(201, 169, 97, 0.05) 50%, rgba(139, 111, 71, 0.1) 100%)',
                clipPath: 'polygon(0 50%, 100% 45%, 100% 100%, 0% 100%)',
              }}
              animate={{
                y: [0, -15, 0],
                scale: [1, 1.03, 1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
            />
          </>
        )}
        
        {/* Planets in background - Only show in Dune theme */}
        {theme === 'dune' && (
          <>
            {/* Mars */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: '120px',
                height: '120px',
                left: '15%',
                top: '20%',
                background: 'radial-gradient(circle at 30% 30%, rgba(193, 68, 14, 0.8), rgba(139, 69, 19, 0.6), rgba(101, 50, 14, 0.4))',
                boxShadow: '0 0 40px rgba(193, 68, 14, 0.3), inset -20px -20px 40px rgba(0, 0, 0, 0.3)',
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            {/* Distant Planet 1 */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: '80px',
                height: '80px',
                right: '20%',
                top: '60%',
                background: 'radial-gradient(circle at 40% 40%, rgba(139, 111, 71, 0.6), rgba(107, 86, 53, 0.4))',
                boxShadow: '0 0 30px rgba(139, 111, 71, 0.2)',
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            />
            
            {/* Distant Planet 2 */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: '60px',
                height: '60px',
                left: '70%',
                top: '15%',
                background: 'radial-gradient(circle at 35% 35%, rgba(201, 169, 97, 0.5), rgba(139, 111, 71, 0.3))',
                boxShadow: '0 0 25px rgba(201, 169, 97, 0.2)',
              }}
              animate={{
                y: [0, -8, 0],
                opacity: [0.25, 0.4, 0.25],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2,
              }}
            />
            
            {/* Small Planet 3 */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: '45px',
                height: '45px',
                right: '10%',
                top: '80%',
                background: 'radial-gradient(circle at 30% 30%, rgba(212, 165, 116, 0.5), rgba(139, 111, 71, 0.3))',
                boxShadow: '0 0 20px rgba(212, 165, 116, 0.2)',
              }}
              animate={{
                y: [0, -5, 0],
                opacity: [0.2, 0.35, 0.2],
              }}
              transition={{
                duration: 14,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
            />
          </>
        )}

        {/* Slowly flickering stars - Theme aware colors */}
        {[...Array(30)].map((_, i) => {
          const baseDelay = Math.random() * 3
          const flickerSpeed = 3 + Math.random() * 4
          const baseOpacity = 0.2 + Math.random() * 0.4
          const starColor = theme === 'gray' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(201, 169, 97, 0.8)'
          const bgColor = theme === 'gray' ? '#EEEEEE' : '#C9A961'
          
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: bgColor,
                boxShadow: `0 0 ${2 + Math.random() * 4}px ${starColor}`,
              }}
              animate={{
                opacity: [
                  baseOpacity * 0.2,
                  baseOpacity * 0.9,
                  baseOpacity * 0.4,
                  baseOpacity * 0.8,
                  baseOpacity * 0.3,
                  baseOpacity * 0.7,
                  baseOpacity * 0.2,
                ],
                scale: [
                  0.7,
                  1.1,
                  0.85,
                  1.05,
                  0.8,
                  1,
                  0.75,
                ],
              }}
              transition={{
                duration: flickerSpeed,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: baseDelay,
                times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 1],
              }}
            />
          )
        })}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="font-display text-6xl md:text-8xl lg:text-9xl font-bold mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="text-gradient">Duna</span>
          </motion.h1>
          
          <motion.p
            className={`text-2xl md:text-3xl lg:text-4xl font-light mb-4 ${
              theme === 'gray' ? 'text-gray-white-gray' : 'text-dune-sand'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Meet Duna — The Intelligent Browser Reimagined.
          </motion.p>
          
          <motion.p
            className={`text-lg md:text-xl mb-12 max-w-2xl mx-auto ${
              theme === 'gray' ? 'text-gray-mid' : 'text-dune-sand-dark'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Created by Duneworks. Designed for those who demand performance, elegance, and precision.
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.a
              href="#pricing"
              className={`px-8 py-4 font-semibold rounded-lg transition-all duration-300 hover:scale-105 ${
                theme === 'gray'
                  ? 'bg-gray-mid text-gray-dark hover:bg-gray-light'
                  : 'bg-dune-gold text-dune-black hover:bg-dune-gold-light glow-accent-hover'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Free
            </motion.a>
            
            <motion.a
              href="https://whop.com/checkout/plan_vhBLiFWs6AJNx?d2c=true"
              target="_blank"
              rel="noopener noreferrer"
              className={`px-8 py-4 premium-border font-semibold rounded-lg transition-all duration-300 hover:scale-105 relative overflow-hidden group cursor-pointer ${
                theme === 'gray'
                  ? 'text-gray-white-gray hover:border-gray-light/50'
                  : 'text-dune-gold hover:border-dune-gold/50 glow-accent-hover'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Upgrade to Pro</span>
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${
                  theme === 'gray'
                    ? 'from-gray-mid/20 to-gray-light/20'
                    : 'from-dune-gold/20 to-dune-sand/20'
                }`}
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

