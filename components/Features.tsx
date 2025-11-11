'use client'

import { motion } from 'framer-motion'

const features = [
  {
    title: 'AI Assistant',
    description: 'Smart, adaptive, and context-aware. Your intelligent companion for every browsing session.',
    icon: '🤖',
  },
  {
    title: 'Performance',
    description: 'Lightweight, fast, and secure. Experience blazing speeds without compromising on security.',
    icon: '⚡',
  },
  {
    title: 'Cloud Sync',
    description: 'Private data sync across all your devices. Seamless continuity, wherever you go.',
    icon: '☁️',
  },
  {
    title: 'Privacy First',
    description: 'Zero tracking. 100% encrypted sessions. Your data belongs to you, always.',
    icon: '🔒',
  },
]

export default function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-6 text-gradient">
            Powerful Features
          </h2>
          <p className="text-xl max-w-2xl mx-auto text-[var(--text-secondary)]">
            Everything you need for intelligent, efficient browsing
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="premium-card group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">
                {feature.title}
              </h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
