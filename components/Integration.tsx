'use client'

import { motion } from 'framer-motion'

export default function Integration() {
  return (
    <section className="relative py-24 sm:py-32 px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(212,175,55,0.1)] via-[rgba(212,175,55,0.05)] to-[rgba(212,175,55,0.1)]" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gradient"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Seamless and Secure <span className="text-[var(--accent-primary)]">Payments</span>
          </motion.h2>
          
          <motion.p
            className="text-lg sm:text-xl leading-relaxed mb-12 max-w-2xl mx-auto text-[var(--text-primary)]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Duna integrates with Whop for premium subscriptions. Enjoy secure, 
            hassle-free payments with industry-leading encryption and privacy protection.
          </motion.p>

          <motion.div
            className="max-w-2xl mx-auto mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="premium-card glass-strong border-2 border-[rgba(255,215,0,0.3)] p-8 sm:p-10 rounded-2xl">
              <h3 className="text-2xl sm:text-3xl font-bold mb-6 font-display text-[var(--text-primary)] text-center">
                Why Whop?
              </h3>
              <ul className="text-left space-y-4 mb-6">
                <li className="flex items-start group">
                  <div className="flex-shrink-0 w-6 h-6 mr-4 mt-0.5 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center group-hover:bg-[var(--accent-primary)]/30 transition-colors">
                    <svg className="w-4 h-4 text-[var(--accent-primary)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-[var(--text-primary)] text-base leading-relaxed group-hover:text-[var(--accent-primary)] transition-colors">
                    All transactions are processed securely through Whop's encrypted payment system.
                  </span>
                </li>
                <li className="flex items-start group">
                  <div className="flex-shrink-0 w-6 h-6 mr-4 mt-0.5 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center group-hover:bg-[var(--accent-primary)]/30 transition-colors">
                    <svg className="w-4 h-4 text-[var(--accent-primary)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-[var(--text-primary)] text-base leading-relaxed group-hover:text-[var(--accent-primary)] transition-colors">
                    Your payment information is never stored on our servers.
                  </span>
                </li>
                <li className="flex items-start group">
                  <div className="flex-shrink-0 w-6 h-6 mr-4 mt-0.5 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center group-hover:bg-[var(--accent-primary)]/30 transition-colors">
                    <svg className="w-4 h-4 text-[var(--accent-primary)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-[var(--text-primary)] text-base leading-relaxed group-hover:text-[var(--accent-primary)] transition-colors">
                    Instant access to premium features after purchase.
                  </span>
                </li>
              </ul>
              <div className="pt-6 border-t border-[rgba(255,215,0,0.2)]">
                <p className="text-xs sm:text-sm text-[var(--text-tertiary)] italic text-center">
                  Note: Whop integration tokens are configured in the environment variables.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
