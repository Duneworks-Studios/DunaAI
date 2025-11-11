'use client'

import { motion } from 'framer-motion'

export default function Hero() {

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Dune Background */}
      <div className="absolute inset-0 z-0">
        {/* Dune waves */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-96 dune-gradient opacity-30"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            clipPath: 'polygon(0 40%, 100% 30%, 100% 100%, 0% 100%)',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-80 dune-gradient opacity-20"
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
          style={{
            clipPath: 'polygon(0 50%, 100% 45%, 100% 100%, 0% 100%)',
          }}
        />
        
        {/* Flickering stars */}
        {[...Array(30)].map((_, i) => {
          const baseDelay = Math.random() * 2
          const flickerSpeed = 0.5 + Math.random() * 1.5
          const baseOpacity = 0.2 + Math.random() * 0.4
          
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-dune-gold rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                boxShadow: `0 0 ${2 + Math.random() * 4}px rgba(201, 169, 97, 0.8)`,
              }}
              animate={{
                opacity: [
                  baseOpacity * 0.3,
                  baseOpacity,
                  baseOpacity * 0.5,
                  baseOpacity * 0.8,
                  baseOpacity * 0.2,
                  baseOpacity,
                ],
                scale: [
                  0.8,
                  1.2,
                  0.9,
                  1.1,
                  0.85,
                  1,
                ],
              }}
              transition={{
                duration: flickerSpeed,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: baseDelay,
                times: [0, 0.2, 0.4, 0.6, 0.8, 1],
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
            className="text-2xl md:text-3xl lg:text-4xl font-light text-dune-sand mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Meet Duna — The Intelligent Browser Reimagined.
          </motion.p>
          
          <motion.p
            className="text-lg md:text-xl text-dune-sand-dark mb-12 max-w-2xl mx-auto"
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
              className="px-8 py-4 bg-dune-gold text-dune-black font-semibold rounded-lg glow-gold-hover transition-all duration-300 hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Free
            </motion.a>
            
            <motion.a
              href="https://whop.com/checkout/plan_vhBLiFWs6AJNx?d2c=true"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 premium-border text-dune-gold font-semibold rounded-lg glow-gold-hover transition-all duration-300 hover:scale-105 relative overflow-hidden group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Upgrade to Pro</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-dune-gold/20 to-dune-sand/20"
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

