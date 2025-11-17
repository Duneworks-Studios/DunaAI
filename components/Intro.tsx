'use client'

import Hero from './Hero'
import Features from './Features'
import About from './About'
import Integration from './Integration'
import Footer from './Footer'

export default function Intro() {
  return (
    <div className="overflow-x-hidden w-full">
      <Hero />
      <Features />
      <About />
      <Integration />
      <Footer />
    </div>
  )
}
