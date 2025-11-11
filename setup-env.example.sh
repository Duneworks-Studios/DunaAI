#!/bin/bash

# Setup script for Duna AI environment variables
# Copy this file and fill in your actual credentials

cat > .env.local << 'EOF'
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET"

# Google OAuth
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"

# AI Service
AI_TOKEN="YOUR_AI_TOKEN"
AI_ENDPOINT="https://api.openai.com/v1/chat/completions"

# Whop Integration
WHOP_API_KEY="YOUR_WHOP_API_KEY"
WHOP_WEBHOOK_SECRET=""

# Whop Checkout URLs
NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY="YOUR_MONTHLY_CHECKOUT_URL"
NEXT_PUBLIC_WHOP_CHECKOUT_LIFETIME="YOUR_LIFETIME_CHECKOUT_URL"
EOF

echo "✅ .env.local file created! Remember to fill in your actual credentials."

