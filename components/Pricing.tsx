'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

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
    href: process.env.NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY,
    lifetimeHref: process.env.NEXT_PUBLIC_WHOP_CHECKOUT_LIFETIME,
    highlight: true,
    badge: 'Recommended',
  },
]

export default function Pricing() {
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleCheckoutClick = (url: string | undefined, e?: React.MouseEvent) => {
    e?.preventDefault()
    const checkoutUrl = url || process.env.NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY || 'https://whop.com/dunabrowser/checkout'
    
    if (checkoutUrl && checkoutUrl !== '#' && checkoutUrl !== '#pricing') {
      setIsRedirecting(true)
      // Small delay for smooth transition effect
      setTimeout(() => {
        window.open(checkoutUrl, '_blank', 'noopener,noreferrer')
        setIsRedirecting(false)
      }, 150)
    }
  }

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
                  <button
                    onClick={(e) => handleCheckoutClick(plan.href, e)}
                    disabled={isRedirecting}
                    className={`block w-full text-center py-4 rounded-lg font-semibold transition-all duration-300 cursor-pointer relative overflow-hidden ${
                      plan.highlight
                        ? 'bg-dune-gold text-dune-black hover:bg-dune-gold-light glow-gold-hover'
                        : 'premium-border text-dune-gold hover:border-dune-gold/50'
                    } ${isRedirecting ? 'opacity-75' : ''}`}
                  >
                    {isRedirecting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-dune-black border-t-transparent rounded-full animate-spin"></span>
                        Redirecting...
                      </span>
                    ) : (
                      plan.cta
                    )}
                  </button>
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
                {plan.lifetimeHref && (
                  <button
                    onClick={(e) => handleCheckoutClick(plan.lifetimeHref, e)}
                    disabled={isRedirecting}
                    className="block w-full text-center py-4 premium-border text-dune-sand rounded-lg font-semibold hover:border-dune-gold/50 transition-all duration-300 cursor-pointer disabled:opacity-75"
                  >
                    {isRedirecting ? 'Redirecting...' : 'Get Lifetime Access'}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

