'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Intro() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20 pb-12">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#222] to-[#333]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,196,160,0.05)_0%,_transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 text-[#EEEEEE] px-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Meet Duna
          </motion.h1>
          
          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-[#BBBBBB] mb-3 sm:mb-4 font-light px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Your Intelligent AI Browser Assistant
          </motion.p>
          
          <motion.p
            className="text-sm sm:text-base md:text-lg text-[#888888] mb-8 sm:mb-12 max-w-2xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Created by Duneworks Studios. Designed for precision and elegance.
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-[#d4c4a0] bg-opacity-20 text-[#d4c4a0] rounded-lg font-medium hover:bg-opacity-30 transition-all duration-300 text-sm sm:text-base"
            >
              Get Started
            </Link>
            
            <Link
              href="/auth/login"
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 border border-[#888] text-[#BBBBBB] rounded-lg font-medium hover:border-[#d4c4a0] hover:text-[#d4c4a0] transition-all duration-300 text-sm sm:text-base"
            >
              Login
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

