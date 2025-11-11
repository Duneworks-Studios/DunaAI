'use client'

import { motion } from 'framer-motion'

export default function About() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 dune-gradient opacity-20" />
      
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h2
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-gradient"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            The Future of Browsing, Powered by AI.
          </motion.h2>
          
          <motion.p
            className="text-lg md:text-xl lg:text-2xl text-dune-sand-light leading-relaxed mb-6 max-w-4xl mx-auto"
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
            className="text-base md:text-lg text-dune-gold font-light italic"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Engineered by Duneworks, optimized for visionaries.
          </motion.p>
        </motion.div>

        {/* Decorative elements */}
        <div className="mt-20 flex justify-center gap-8">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 h-24 bg-gradient-to-b from-dune-gold via-dune-sand to-transparent opacity-30"
              initial={{ opacity: 0, scaleY: 0 }}
              whileInView={{ opacity: 0.3, scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

