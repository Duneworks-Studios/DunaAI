'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Hero from './Hero'
import Features from './Features'
import About from './About'
import Integration from './Integration'
import Footer from './Footer'

export default function Intro() {
  return (
    <>
      <Hero />
      <Features />
      <About />
      <Integration />
      <Footer />
    </>
  )
}
