'use client'

import { motion } from 'framer-motion'

export default function Integration() {
  return (
    <section className="relative py-24 sm:py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
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
            Seamless and Secure Payments
          </motion.h2>
          
          <motion.p
            className="text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl mx-auto text-[var(--text-primary)]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Duna integrates with Whop for premium subscriptions. Enjoy secure, 
            hassle-free payments with industry-leading encryption and privacy protection.
          </motion.p>

          <motion.div
            className="premium-card max-w-2xl mx-auto mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h3 className="text-2xl font-semibold mb-3 font-display text-[var(--text-primary)]">
              Why Whop?
            </h3>
            <ul className="text-left space-y-3 text-[var(--text-secondary)]">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-3 text-[var(--accent-primary)] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>All transactions are processed securely through Whop's encrypted payment system.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-3 text-[var(--accent-primary)] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Your payment information is never stored on our servers.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-3 text-[var(--accent-primary)] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Instant access to premium features after purchase.</span>
              </li>
            </ul>
            <p className="mt-6 text-sm text-[var(--text-tertiary)] italic">
              Note: Whop integration tokens are configured in the environment variables.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
