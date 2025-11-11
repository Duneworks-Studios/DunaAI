'use client'

import { motion } from 'framer-motion'

export default function About() {
  return (
    <section className="relative py-24 sm:py-32 px-6 overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h2
            className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-8 text-gradient"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            The Future of Browsing, Powered by AI.
          </motion.h2>
          
          <motion.p
            className="text-lg sm:text-xl md:text-2xl leading-relaxed mb-6 max-w-4xl mx-auto text-[var(--text-primary)]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Duna is an AI-powered browser assistant that understands context, automates tasks, 
            and helps you browse smarter — wrapped in a cinematic, premium experience. 
            Experience the next evolution of intelligent browsing, where artificial intelligence 
            meets elegant design.
          </motion.p>
          
          <motion.p
            className="text-base sm:text-lg text-[var(--text-secondary)] max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Created by Duneworks Studios with precision, passion, and a vision for the future.
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
