import type { Metadata } from 'next'
import { Manrope, Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AgentProvider } from '@/contexts/AgentContext'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-satoshi',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Duna – Premium AI Browser by Duneworks',
  description: 'A luxurious AI-powered browser that redefines intelligent browsing. Created by Duneworks Studios.',
  keywords: ['AI browser', 'Duna', 'Duneworks', 'intelligent browsing', 'AI assistant'],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
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
    <html lang="en" className="scroll-smooth overflow-x-hidden">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      </head>
      <body className={`${manrope.variable} ${inter.variable} font-sans antialiased overflow-x-hidden`}>
        <ThemeProvider>
          <AgentProvider>
            <Navbar />
            {children}
          </AgentProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

