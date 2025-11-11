# Duna AI - Premium AI Browser Landing Page

A luxurious, cinematic landing page for **Duna**, an AI-powered browser created by **Duneworks Studios**. Built with Next.js, TypeScript, TailwindCSS, and Framer Motion.

## 🎨 Design

- **Dune-inspired color palette**: Deep sand tones, golden highlights, warm bronze accents
- **Premium, cinematic aesthetic**: Luxury sci-fi brand feel
- **Smooth animations**: Parallax dune effects, particle motion, elegant transitions
- **Futuristic typography**: Manrope and Orbitron fonts

## 🚀 Features

- Fully responsive design (desktop, tablet, mobile)
- Smooth scroll animations with Framer Motion
- Premium UI components with glow effects
- SEO-optimized
- Whop integration for payments
- NextAuth ready for authentication

## 📦 Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS** (Custom Dune color palette)
- **Framer Motion** (Animations)
- **NextAuth** (Authentication)
- **Prisma** (Database ORM)

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory with:
   ```
   DATABASE_URL="your_database_url"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your_secret"
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   AI_TOKEN="your_ai_token"
   WHOP_API_KEY="your_whop_api_key"
   NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY="your_monthly_checkout_url"
   NEXT_PUBLIC_WHOP_CHECKOUT_LIFETIME="your_lifetime_checkout_url"
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx      # Root layout with fonts and metadata
│   ├── page.tsx        # Main page with all sections
│   └── globals.css     # Global styles and Dune color palette
├── components/
│   ├── Hero.tsx        # Hero section with animated dune background
│   ├── About.tsx      # About Duna section
│   ├── Features.tsx   # Features showcase
│   ├── Pricing.tsx    # Pricing plans
│   ├── Integration.tsx # Whop integration info
│   └── Footer.tsx     # Footer with animated dune background
└── ...
```

## 🎯 Sections

1. **Hero** - Animated dune waves, floating particles, premium CTA buttons
2. **About** - Cinematic introduction to Duna
3. **Features** - Glowing feature cards with hover effects
4. **Pricing** - Free and Pro plans with Whop checkout integration
5. **Integration** - Whop payment processing information
6. **Footer** - Minimal footer with animated dune background

## 🔐 Authentication

The project is configured for NextAuth with Google OAuth. Database connection is set up for Prisma with PostgreSQL (Supabase).

## 📝 Auto-Push

This repository is configured to automatically commit and push changes to GitHub using the `.git-auto-push.sh` script.

## 📄 License

© 2025 Duneworks Studios. All Rights Reserved.

