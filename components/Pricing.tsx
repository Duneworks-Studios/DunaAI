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
    href: '#',
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
    monthlyUrl: 'https://whop.com/checkout/plan_vhBLiFWs6AJNx?d2c=true',
    lifetimeUrl: 'https://whop.com/checkout/plan_nAv9o4mMRgV37?d2c=true',
    highlight: true,
    badge: 'Recommended',
  },
]

export default function Pricing() {

  return (
    <section id="pricing" className="relative py-32 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 dune-gradient opacity-10" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gradient">
            Choose Your Plan
          </h2>
          <p className="text-xl text-dune-sand-dark max-w-2xl mx-auto">
            Flexible options for every explorer
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`premium-card relative ${
                plan.highlight
                  ? 'border-dune-gold/50 bg-gradient-to-br from-dune-black-soft to-dune-black-lighter glow-gold'
                  : 'border-dune-bronze/30'
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              {/* Recommended badge */}
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-dune-gold text-dune-black px-4 py-1 rounded-full text-sm font-semibold">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-dune-gold mb-4 font-display">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-dune-sand">
                    {plan.price}
                  </span>
                  <span className="text-dune-sand-dark ml-2">/{plan.period}</span>
                </div>
                {plan.altPrice && (
                  <div className="mt-2">
                    <span className="text-2xl font-semibold text-dune-gold">
                      or {plan.altPrice}
                    </span>
                    <span className="text-dune-sand-dark ml-2">/{plan.altPeriod}</span>
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-dune-gold mr-3 text-xl">✓</span>
                    <span className="text-dune-sand-light">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                {plan.highlight ? (
                  <motion.a
                    href={plan.monthlyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full text-center py-4 rounded-lg font-semibold transition-all duration-300 cursor-pointer relative overflow-hidden ${
                      plan.highlight
                        ? 'bg-dune-gold text-dune-black hover:bg-dune-gold-light glow-gold-hover'
                        : 'premium-border text-dune-gold hover:border-dune-gold/50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {plan.cta}
                  </motion.a>
                ) : (
                  <Link
                    href={plan.href}
                    className={`block w-full text-center py-4 rounded-lg font-semibold transition-all duration-300 ${
                      plan.highlight
                        ? 'bg-dune-gold text-dune-black hover:bg-dune-gold-light glow-gold-hover'
                        : 'premium-border text-dune-gold hover:border-dune-gold/50'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                )}
                {plan.lifetimeUrl && (
                  <motion.a
                    href={plan.lifetimeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-4 premium-border text-dune-sand rounded-lg font-semibold hover:border-dune-gold/50 transition-all duration-300 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Lifetime Access
                  </motion.a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

