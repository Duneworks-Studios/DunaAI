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
        // Dark Professional Theme with Dune Accents
        background: {
          primary: '#0f0f0f',
          secondary: '#161616',
          tertiary: '#1b1b1b',
          elevated: '#1b1b1b',
          hover: '#252525',
        },
        foreground: {
          primary: '#f3f3f3',
          secondary: '#c7c7c7',
          tertiary: '#888888',
        },
        border: {
          primary: '#2a2a2a',
          secondary: '#3a3a3a',
        },
        accent: {
          DEFAULT: '#e5a64b',
          light: '#f1b866',
          dark: '#b98234',
        },
        dune: {
          primary: '#e5a64b',
          hover: '#f1b866',
          muted: '#b98234',
          dark: '#8a6325',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}
export default config

