'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createSupabaseClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface PromoCodeModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onSuccess?: () => void
}

export default function PromoCodeModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: PromoCodeModalProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showAllCodes, setShowAllCodes] = useState(false)
  const [allCodes, setAllCodes] = useState<Array<{ 
    code: string
    text: string
    isUsed: boolean
    usedAt?: string
    usedBy?: string
  }>>([])
  const [codeStats, setCodeStats] = useState({ total: 0, available: 0, used: 0 })

  const handleRedeem = async () => {
    if (!user) {
      setError('You must be logged in to redeem a code')
      return
    }

    if (!code.trim()) {
      setError('Please enter a promo code')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    setShowAllCodes(false)

    try {
      const response = await fetch('/api/promo/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim(),
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to redeem code')
        setLoading(false)
        return
      }

      // Handle special code that shows all codes
      if (data.isSpecialCode) {
        setShowAllCodes(true)
        setAllCodes(data.codes || [])
        setCodeStats({
          total: data.totalCodes || 0,
          available: data.availableCodes || 0,
          used: data.usedCodes || 0
        })
        setSuccess(`Showing all ${data.totalCodes} promo codes with their status`)
        setCode('')
        setLoading(false)
        return
      }

      // Successfully redeemed
      setSuccess(data.message || 'Code redeemed successfully!')
      setCode('')
      
      // Refresh user data
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
      } else {
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }
    } catch (error) {
      console.error('Error redeeming code:', error)
      setError('An error occurred while redeeming the code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
          className="relative premium-card glass-strong max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto z-[201]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gradient">Redeem Promo Code</h2>
              <button
                onClick={onClose}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!showAllCodes ? (
              <>
                <div className="mb-6">
                  <label htmlFor="promo-code" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Enter Promo Code
                  </label>
                  <input
                    id="promo-code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !loading && code.trim()) {
                        e.preventDefault()
                        handleRedeem()
                      }
                    }}
                    placeholder="Paste your base64 code here..."
                    className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:border-opacity-50 transition-colors font-mono text-sm"
                    disabled={loading}
                    autoFocus
                    style={{ pointerEvents: 'auto', zIndex: 1 }}
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                    {success}
                  </div>
                )}

                <button
                  onClick={handleRedeem}
                  disabled={loading || !code.trim()}
                  className="w-full btn-primary text-sm py-3 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  {loading ? 'Redeeming...' : 'Redeem Code'}
                </button>

                <p className="text-xs text-[var(--text-tertiary)] text-center">
                  Enter a valid promo code to upgrade to Pro Lifetime
                </p>
              </>
            ) : (
              <div>
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                  {success}
                </div>
                
                {/* Statistics */}
                <div className="mb-4 grid grid-cols-3 gap-3">
                  <div className="p-3 bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg text-center">
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{codeStats.total}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">Total Codes</p>
                  </div>
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-400">{codeStats.available}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">Available</p>
                  </div>
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-400">{codeStats.used}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">Used</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                    All Promo Codes ({allCodes.length})
                  </h3>
                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {allCodes.map((item, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg flex items-center justify-between transition-all ${
                          item.isUsed
                            ? 'bg-red-500/10 border border-red-500/30 opacity-75'
                            : 'bg-[var(--bg-elevated)] border border-green-500/30'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`text-sm font-medium ${
                              item.isUsed ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {item.text}
                            </p>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              item.isUsed
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-green-500/20 text-green-400'
                            }`}>
                              {item.isUsed ? 'USED' : 'VALID'}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-tertiary)] font-mono">
                            {item.code}
                          </p>
                          {item.isUsed && item.usedAt && (
                            <p className="text-xs text-red-400/70 mt-1">
                              Used on: {new Date(item.usedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {!item.isUsed && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.code)
                              setCode(item.code)
                              setShowAllCodes(false)
                            }}
                            className="ml-3 px-3 py-1.5 text-xs btn-secondary"
                          >
                            Use
                          </button>
                        )}
                        {item.isUsed && (
                          <div className="ml-3 px-3 py-1.5 text-xs text-red-400 bg-red-500/10 rounded border border-red-500/30">
                            Used
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowAllCodes(false)
                    setAllCodes([])
                    setSuccess(null)
                  }}
                  className="w-full btn-secondary text-sm py-3"
                >
                  Back to Code Entry
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

