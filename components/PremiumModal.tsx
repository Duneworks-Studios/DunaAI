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
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-70"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-[#2a2a2a] border border-[#444] rounded-lg p-6 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold text-[#EEEEEE] mb-3">{title}</h2>
          <p className="text-[#BBBBBB] mb-6 text-sm leading-relaxed">{message}</p>

          {showUpgradeButtons && (
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.a
                href={process.env.NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2.5 bg-[#d4c4a0] bg-opacity-20 text-[#d4c4a0] rounded-lg font-medium hover:bg-opacity-30 transition-all text-center text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Upgrade Monthly
              </motion.a>
              <motion.a
                href={process.env.NEXT_PUBLIC_WHOP_CHECKOUT_LIFETIME || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2.5 border border-[#d4c4a0] border-opacity-30 text-[#d4c4a0] rounded-lg font-medium hover:border-opacity-50 transition-all text-center text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Lifetime Access
              </motion.a>
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 text-[#888888] hover:text-[#BBBBBB] transition-colors text-sm"
          >
            Later
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

