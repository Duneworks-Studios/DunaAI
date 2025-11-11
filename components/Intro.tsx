'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Intro() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#222] to-[#333]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,196,160,0.05)_0%,_transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-[#EEEEEE]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Meet Duna
          </motion.h1>
          
          <motion.p
            className="text-xl md:text-2xl text-[#BBBBBB] mb-4 font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Your Intelligent AI Browser Assistant
          </motion.p>
          
          <motion.p
            className="text-base md:text-lg text-[#888888] mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Created by Duneworks Studios. Designed for precision and elegance.
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link
              href="/auth/signup"
              className="px-8 py-3 bg-[#d4c4a0] bg-opacity-20 text-[#d4c4a0] rounded-lg font-medium hover:bg-opacity-30 transition-all duration-300"
            >
              Get Started
            </Link>
            
            <Link
              href="/auth/login"
              className="px-8 py-3 border border-[#888] text-[#BBBBBB] rounded-lg font-medium hover:border-[#d4c4a0] hover:text-[#d4c4a0] transition-all duration-300"
            >
              Login
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

