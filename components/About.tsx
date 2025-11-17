'use client'

export default function About() {
  return (
    <section className="relative py-24 sm:py-32 px-6 overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center">
          <h2 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-8 text-gradient">
            The Future of Browsing, Powered by AI.
          </h2>
          
          <p className="text-lg sm:text-xl md:text-2xl leading-relaxed mb-6 max-w-4xl mx-auto text-[var(--text-primary)]">
            Duna is an AI-powered browser assistant that understands context, automates tasks, 
            and helps you browse smarter — wrapped in a cinematic, premium experience. 
            Experience the next evolution of intelligent browsing, where artificial intelligence 
            meets elegant design.
          </p>
          
          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-3xl mx-auto">
            Created by Duneworks Studios with precision, passion, and a vision for the future.
          </p>
        </div>
      </div>
    </section>
  )
}
