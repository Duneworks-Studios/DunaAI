// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNetlify = require('@netlify/plugin-nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable React DevTools in production
  reactDevOverlay: process.env.NODE_ENV !== 'production',
  
  // Image optimization
  images: {
    domains: [
      'media.discordapp.net', 
      'i.imgur.com', 
      'imgur.com',
      'localhost',
      'via.placeholder.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    minimumCacheTTL: 60, // 1 minute
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Production optimizations
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  compress: true,
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `node:` protocol
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      dns: false,
      child_process: false,
      module: false,
    }

    return config
  },
  
  // Enable server components
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ['@xenova/transformers'],
  },
}

// Apply Netlify plugin with Next.js config
module.exports = withNetlify(nextConfig)
