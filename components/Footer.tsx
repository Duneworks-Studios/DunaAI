'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative py-16 px-6 overflow-hidden">
      {/* Animated dune background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-64 dune-gradient opacity-20"
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            clipPath: 'polygon(0 30%, 100% 25%, 100% 100%, 0% 100%)',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-48 dune-gradient opacity-15"
          animate={{
            y: [0, -10, 0],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.3,
          }}
          style={{
            clipPath: 'polygon(0 40%, 100% 35%, 100% 100%, 0% 100%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
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
            <p className="text-dune-sand-dark text-sm leading-relaxed">
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
            <h4 className="text-dune-gold font-semibold mb-2">Legal</h4>
            <Link
              href="/terms"
              className="text-dune-sand-dark hover:text-dune-gold transition-colors duration-300"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-dune-sand-dark hover:text-dune-gold transition-colors duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              href="/contact"
              className="text-dune-sand-dark hover:text-dune-gold transition-colors duration-300"
            >
              Contact
            </Link>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-dune-gold font-semibold mb-2">Duneworks Studios</h4>
            <p className="text-dune-sand-dark text-sm">
              Engineering the future of intelligent browsing.
            </p>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          className="border-t border-dune-bronze/20 pt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-dune-sand-dark text-sm">
            © {currentYear} Duneworks Studios. All Rights Reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

