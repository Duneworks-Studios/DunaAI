'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const plans = [
  {
    name: 'Free Plan',
    price: '$0',
    period: 'forever',
    features: [
      '20 messages/day',
      'AI Assistant access',
      'Basic support',
      'Standard performance',
    ],
    cta: 'Get Started',
    href: '/auth/signup',
    highlight: false,
  },
  {
    name: 'Pro Plan',
    price: '$9.99',
    period: 'month',
    altPrice: '$50',
    altPeriod: 'Lifetime Access',
    features: [
      'Unlimited AI messages',
      'Priority model access',
      'Premium design themes',
      'Advanced features',
      'Priority support',
      'Early access to updates',
    ],
    cta: 'Upgrade to Pro',
    monthlyUrl: process.env.NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY || '#',
    lifetimeUrl: process.env.NEXT_PUBLIC_WHOP_CHECKOUT_LIFETIME || '#',
    highlight: true,
    badge: 'Recommended',
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32 px-6 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-6 text-gradient">
            Choose Your Plan
          </h2>
          <p className="text-xl max-w-2xl mx-auto text-[var(--text-secondary)]">
            Flexible options for every explorer
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`premium-card relative ${plan.highlight ? 'border-[var(--accent-primary)]/50 glow' : ''}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              {/* Recommended badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4 font-display text-[var(--text-primary)]">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-[var(--text-primary)]">
                    {plan.price}
                  </span>
                  <span className="ml-2 text-[var(--text-tertiary)]">/{plan.period}</span>
                </div>
                {plan.altPrice && (
                  <div className="mt-3">
                    <span className="text-2xl font-semibold text-gradient">
                      or {plan.altPrice}
                    </span>
                    <span className="ml-2 text-[var(--text-tertiary)]">/{plan.altPeriod}</span>
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <svg className="w-5 h-5 mr-3 text-[var(--accent-primary)] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[var(--text-primary)]">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="space-y-3">
                {plan.highlight ? (
                  <>
                    <motion.a
                      href={plan.monthlyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full btn-primary text-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {plan.cta}
                    </motion.a>
                    <motion.a
                      href={plan.lifetimeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full btn-secondary text-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Get Lifetime Access
                    </motion.a>
                  </>
                ) : (
                  <Link
                    href={plan.href || '/auth/signup'}
                    className="block w-full btn-secondary text-center"
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
