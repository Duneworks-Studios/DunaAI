'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative py-16 px-6 overflow-hidden border-t border-[var(--border-primary)]">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="font-display text-3xl font-bold text-gradient mb-4">
              Duna
            </h3>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              The intelligent browser reimagined. Created by Duneworks Studios.
            </p>
          </motion.div>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col space-y-3"
          >
            <h4 className="font-semibold mb-2 text-[var(--text-primary)]">
              Legal
            </h4>
            <Link
              href="/terms"
              className="transition-colors duration-300 text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="transition-colors duration-300 text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
            >
              Privacy Policy
            </Link>
            <Link
              href="/contact"
              className="transition-colors duration-300 text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
            >
              Contact
            </Link>
          </motion.div>

          {/* Company & Discord */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="font-semibold mb-2 text-[var(--text-primary)]">
              Duneworks Studios
            </h4>
            <p className="text-sm mb-4 text-[var(--text-secondary)]">
              Engineering the future of intelligent browsing.
            </p>
            <motion.a
              href="https://discord.gg/Duneworks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors duration-300 group text-[var(--text-secondary)] hover:text-[var(--accent-primary)]"
              whileHover={{ scale: 1.05 }}
            >
              <svg
                className="w-5 h-5 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_var(--accent-glow)]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.007-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928-1.793 6.4-3.498 6.4-3.498a.07.07 0 0 0 .031-.056c.004-.1-.015-.2-.056-.292a11.93 11.93 0 0 0-1.019-1.644.077.077 0 0 1 .01-.078c.12-.17.24-.34.35-.52a.074.074 0 0 1 .06-.033c2.56.19 5.1.19 7.62 0a.074.074 0 0 1 .061.033c.109.18.228.35.35.52a.077.077 0 0 1 .01.078 12.08 12.08 0 0 0-1.02 1.644.077.077 0 0 0-.025.292c.002.02.01.04.031.056 0 0 2.47 1.705 6.4 3.498a.077.077 0 0 0 .078.01 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span className="text-sm font-medium">Join Duneworks Community</span>
            </motion.a>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          className="border-t border-[var(--border-primary)] pt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-sm text-[var(--text-tertiary)]">
            © {currentYear} Duneworks Studios. All Rights Reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
