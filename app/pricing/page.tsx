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
    monthlyUrl: process.env.NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY || 'https://whop.com/checkout/plan_vhBLiFWs6AJNx?d2c=true',
    lifetimeUrl: process.env.NEXT_PUBLIC_WHOP_CHECKOUT_LIFETIME || 'https://whop.com/checkout/plan_nAv9o4mMRgV37?d2c=true',
    highlight: true,
    badge: 'Most Popular',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-[60px] bg-[#1a1a1a]">
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 text-[#EEEEEE]">
              Choose Your Plan
            </h1>
            <p className="text-xl text-[#888888] max-w-2xl mx-auto">
              Flexible options for every creator
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`relative rounded-lg p-8 transition-all duration-300 ${
                  plan.highlight
                    ? 'bg-[#222] border-2 border-[#d4c4a0] border-opacity-30 shadow-lg shadow-[#d4c4a0] shadow-opacity-10'
                    : 'bg-[#2a2a2a] border border-[#444]'
                }`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#d4c4a0] text-[#1a1a1a] px-4 py-1 rounded-full text-sm font-semibold">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold mb-4 font-display ${
                    plan.highlight ? 'text-[#d4c4a0]' : 'text-[#EEEEEE]'
                  }`}>
                    {plan.name}
                  </h3>
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-[#EEEEEE]">
                      {plan.price}
                    </span>
                    <span className="text-[#888888] ml-2">/{plan.period}</span>
                  </div>
                  {plan.altPrice && (
                    <div className="mt-2">
                      <span className="text-2xl font-semibold text-[#d4c4a0]">
                        or {plan.altPrice}
                      </span>
                      <span className="text-[#888888] ml-2">/{plan.altPeriod}</span>
                    </div>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className={`mr-3 text-lg ${
                        plan.highlight ? 'text-[#d4c4a0]' : 'text-[#888888]'
                      }`}>✓</span>
                      <span className="text-[#BBBBBB] text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-3">
                  {plan.highlight ? (
                    <>
                      <motion.a
                        href={plan.monthlyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center py-3 bg-[#d4c4a0] bg-opacity-20 text-[#d4c4a0] rounded-lg font-semibold hover:bg-opacity-30 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {plan.cta}
                      </motion.a>
                      <motion.a
                        href={plan.lifetimeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center py-3 border border-[#d4c4a0] border-opacity-30 text-[#d4c4a0] rounded-lg font-semibold hover:border-opacity-50 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Get Lifetime Access
                      </motion.a>
                    </>
                  ) : (
                    <Link
                      href={plan.href || '/auth/signup'}
                      className="block w-full text-center py-3 border border-[#444] text-[#BBBBBB] rounded-lg font-semibold hover:border-[#888] hover:text-[#EEEEEE] transition-all duration-300"
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
    </div>
  )
}

