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
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative premium-card glass-strong max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto z-[201]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gradient mb-4">{title}</h2>
            <p className="text-[var(--text-secondary)] mb-6 text-sm leading-relaxed">{message}</p>

            {showUpgradeButtons && (
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <motion.a
                  href={process.env.NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 btn-primary text-center text-sm relative z-10"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Upgrade Monthly
                </motion.a>
                <motion.a
                  href={process.env.NEXT_PUBLIC_WHOP_CHECKOUT_LIFETIME || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 btn-secondary text-center text-sm relative z-10"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Get Lifetime
                </motion.a>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="w-full px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors text-sm relative z-10 cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
