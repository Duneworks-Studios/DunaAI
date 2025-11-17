'use client'

import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-primary)] mb-6 sm:mb-10" style={{
            boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)'
          }}>
            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[var(--accent-primary)]" style={{
              boxShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.5)'
            }}></span>
            <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] tracking-wider uppercase" style={{
              textShadow: '0 0 8px rgba(255, 255, 255, 0.5)'
            }}>
              Premium AI Browser
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[12rem] font-black mb-6 sm:mb-8 leading-[0.9]">
            <span className="text-gradient block mb-2 sm:mb-4">
              Duna
            </span>
            <span className="text-[var(--text-primary)] text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light block" style={{
              textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)'
            }}>
              Intelligence
            </span>
          </h1>
          
          <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-light mb-4 sm:mb-8 text-[var(--text-primary)] max-w-4xl mx-auto leading-relaxed px-4" style={{
            textShadow: '0 0 15px rgba(255, 255, 255, 0.4), 0 0 30px rgba(255, 255, 255, 0.2)'
          }}>
            The Premium AI Browser Reimagined
          </p>
          
          <p className="text-sm sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-16 max-w-3xl mx-auto text-[var(--text-tertiary)] leading-relaxed px-4">
            Experience the future of intelligent browsing. Designed for those who demand performance, elegance, and precision.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-20 px-4">
            <a
              href="#pricing"
              className="btn-primary text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 w-full sm:w-auto"
            >
              Get Started Free
            </a>
            
            <a
              href={process.env.NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-base sm:text-lg px-8 sm:px-12 py-4 sm:py-6 w-full sm:w-auto"
            >
              Upgrade to Pro
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 text-sm sm:text-base md:text-lg text-[var(--text-tertiary)] px-4">
            {[
              { icon: '✓', text: 'Unlimited Messages' },
              { icon: '✓', text: 'Premium AI Agents' },
              { icon: '✓', text: '24/7 Support' },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 sm:gap-3"
              >
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent-primary)]" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))'
                  }}
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-[var(--text-primary)]" style={{
                  textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
