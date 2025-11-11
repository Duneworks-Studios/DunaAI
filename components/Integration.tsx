'use client'

import { motion } from 'framer-motion'

export default function Integration() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gradient"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Seamless and Secure Payments
          </motion.h2>
          
          <motion.p
            className="text-lg md:text-xl text-dune-sand-light leading-relaxed mb-8 max-w-2xl mx-auto"
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
            <div className="text-dune-gold mb-4 text-4xl">🔒</div>
            <h3 className="text-2xl font-semibold text-dune-gold mb-3 font-display">
              Secure Payment Processing
            </h3>
            <p className="text-dune-sand-light">
              All transactions are processed securely through Whop's encrypted payment system. 
              Your financial information is never stored on our servers.
            </p>
            <p className="text-sm text-dune-sand-dark mt-4 italic">
              Note: Whop integration tokens are configured in the environment variables.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

