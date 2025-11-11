import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Gray theme palette
        gray: {
          dark: '#333333',
          mid: '#888888',
          light: '#BBBBBB',
          'white-gray': '#EEEEEE',
          accent: '#FFFFFF',
        },
        // Dune-inspired color palette
        dune: {
          sand: '#D4A574',
          'sand-light': '#E8C9A0',
          'sand-dark': '#B8955A',
          gold: '#C9A961',
          'gold-light': '#E5C77E',
          'gold-dark': '#A68B4F',
          bronze: '#8B6F47',
          'bronze-light': '#A6895F',
          'bronze-dark': '#6B5635',
          black: '#0d0d0d',
          'black-soft': '#1A1A1A',
          'black-lighter': '#2A2A2A',
        },
      },
      fontFamily: {
        sans: ['var(--font-satoshi)', 'var(--font-manrope)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-satoshi)', 'var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'dune-wave': 'dune-wave 20s ease-in-out infinite',
        'particle-float': 'particle-float 15s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        'dune-wave': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' },
        },
        'particle-float': {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '33%': { transform: 'translateY(-30px) translateX(20px)' },
          '66%': { transform: 'translateY(-15px) translateX(-20px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}
export default config

