import Hero from '@/components/Hero'
import About from '@/components/About'
import Features from '@/components/Features'
import Pricing from '@/components/Pricing'
import Integration from '@/components/Integration'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <About />
      <Features />
      <Pricing />
      <Integration />
      <Footer />
    </main>
  )
}

