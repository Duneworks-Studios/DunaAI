'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface PremiumModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  showUpgradeButtons?: boolean
}

export default function PremiumModal({
  isOpen,
  onClose,
  title,
  message,
  showUpgradeButtons = true,
}: PremiumModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative premium-card glass-strong max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">{title}</h2>
            <p className="text-[var(--text-secondary)] mb-6 text-sm leading-relaxed">{message}</p>

            {showUpgradeButtons && (
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.a
                  href={process.env.NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 btn-primary text-center text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Upgrade Monthly
                </motion.a>
                <motion.a
                  href={process.env.NEXT_PUBLIC_WHOP_CHECKOUT_LIFETIME || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 btn-secondary text-center text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Lifetime
                </motion.a>
              </div>
            )}

            <button
              onClick={onClose}
              className="mt-4 w-full px-4 py-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
