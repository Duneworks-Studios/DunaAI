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
        // Light Dune / Soft Sand Theme Palette
        background: {
          primary: '#f7f3e8',
          secondary: '#f0ebdd',
          tertiary: '#efe6d4',
          elevated: '#fffdf8',
          hover: '#e8e2d4',
        },
        foreground: {
          primary: '#2b2b2b',
          secondary: '#4a463f',
          tertiary: '#7a7468',
        },
        border: {
          primary: '#e2d9c4',
          secondary: '#d4c9b0',
        },
        accent: {
          DEFAULT: '#e5a64b',
          light: '#f1b866',
          dark: '#d48c2f',
        },
        dune: {
          sand: '#f7f3e8',
          cream: '#fffdf8',
          warm: '#f0ebdd',
          orange: '#e5a64b',
          amber: '#d48c2f',
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

