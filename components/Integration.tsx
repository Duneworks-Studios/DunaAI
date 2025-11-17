'use client'

export default function Integration() {
  return (
    <section className="relative py-24 sm:py-32 px-6 overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gradient" style={{
            textShadow: '0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.4)',
            filter: 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.5))'
          }}>
            Seamless and Secure <span className="text-gradient">Payments</span>
          </h2>
          
          <p className="text-lg sm:text-xl leading-relaxed mb-12 max-w-2xl mx-auto text-[var(--text-primary)]">
            Duna integrates with Whop for premium subscriptions. Enjoy secure, 
            hassle-free payments with industry-leading encryption and privacy protection.
          </p>

          <div className="max-w-2xl mx-auto mt-12">
            <div className="premium-card glass-strong border border-[var(--border-primary)] p-8 sm:p-10 rounded-lg">
              <h3 className="text-2xl sm:text-3xl font-bold mb-6 font-display text-[var(--text-primary)] text-center">
                Why Whop?
              </h3>
              <ul className="text-left space-y-4 mb-6">
                <li className="flex items-start group">
                  <div className="flex-shrink-0 w-6 h-6 mr-4 mt-0.5 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center group-hover:bg-[var(--accent-primary)]/30 transition-colors">
                    <svg className="w-4 h-4 text-[var(--accent-primary)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-[var(--text-primary)] text-base leading-relaxed group-hover:text-[var(--accent-primary)] transition-colors">
                    All transactions are processed securely through Whop's encrypted payment system.
                  </span>
                </li>
                <li className="flex items-start group">
                  <div className="flex-shrink-0 w-6 h-6 mr-4 mt-0.5 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center group-hover:bg-[var(--accent-primary)]/30 transition-colors">
                    <svg className="w-4 h-4 text-[var(--accent-primary)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-[var(--text-primary)] text-base leading-relaxed group-hover:text-[var(--accent-primary)] transition-colors">
                    Your payment information is never stored on our servers.
                  </span>
                </li>
                <li className="flex items-start group">
                  <div className="flex-shrink-0 w-6 h-6 mr-4 mt-0.5 rounded-full bg-[var(--accent-primary)]/20 flex items-center justify-center group-hover:bg-[var(--accent-primary)]/30 transition-colors">
                    <svg className="w-4 h-4 text-[var(--accent-primary)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-[var(--text-primary)] text-base leading-relaxed group-hover:text-[var(--accent-primary)] transition-colors">
                    Instant access to premium features after purchase.
                  </span>
                </li>
              </ul>
              <div className="pt-6 border-t border-[var(--border-primary)]">
                <p className="text-xs sm:text-sm text-[var(--text-tertiary)] italic text-center">
                  Note: Whop integration tokens are configured in the environment variables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
