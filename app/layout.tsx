import type { Metadata } from 'next'
import { Manrope, Orbitron } from 'next/font/google'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Duna – Premium AI Browser by Duneworks',
  description: 'A luxurious AI-powered browser that redefines intelligent browsing. Created by Duneworks Studios.',
  keywords: ['AI browser', 'Duna', 'Duneworks', 'intelligent browsing', 'AI assistant'],
  openGraph: {
    title: 'Duna – Premium AI Browser by Duneworks',
    description: 'A luxurious AI-powered browser that redefines intelligent browsing.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${manrope.variable} ${orbitron.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}

