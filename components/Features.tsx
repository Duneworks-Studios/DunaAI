'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

const features = [
  {
    title: 'AI Assistant',
    description: 'Smart, adaptive, and context-aware. Your intelligent companion for every browsing session.',
  },
  {
    title: 'Performance',
    description: 'Lightweight, fast, and secure. Experience blazing speeds without compromising on security.',
  },
  {
    title: 'Cloud Sync',
    description: 'Private data sync across all your devices. Seamless continuity, wherever you go.',
  },
  {
    title: 'Privacy First',
    description: 'Zero tracking. 100% encrypted sessions. Your data belongs to you, always.',
  },
]

export default function Features() {
  const { theme } = useTheme()

  return (
    <section id="features" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gradient">
            Powerful Features
          </h2>
          <p className={`text-xl max-w-2xl mx-auto ${
            theme === 'gray' ? 'text-gray-mid' : 'text-dune-sand-dark'
          }`}>
            Everything you need for intelligent, efficient browsing
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="premium-card group relative overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              {/* Glow effect on hover - Theme aware */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 ${
                  theme === 'gray'
                    ? 'from-gray-light/30 to-gray-mid/30'
                    : 'from-dune-gold/30 to-dune-sand/30'
                }`}
              />
              
              <div className="relative z-10">
                <h3 className={`text-2xl font-semibold mb-3 font-display ${
                  theme === 'gray' ? 'text-gray-white-gray' : 'text-dune-gold'
                }`}>
                  {feature.title}
                </h3>
                <p className={`leading-relaxed ${
                  theme === 'gray' ? 'text-gray-light' : 'text-dune-sand-light'
                }`}>
                  {feature.description}
                </p>
              </div>

              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
