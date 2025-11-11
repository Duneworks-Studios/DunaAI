# Netlify Deployment Guide

## ✅ Yes, your website will work on Netlify!

Next.js apps work great on Netlify. Here's how to deploy:

## Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

## Step 2: Deploy to Netlify

### Option A: Via Netlify Dashboard (Recommended)

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub repository
4. Select your repository: `Duneworks-Studios/DunaAI`
5. Netlify will auto-detect Next.js settings

### Option B: Via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

## Step 3: Configure Environment Variables

**CRITICAL:** Add all these environment variables in Netlify Dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add each variable:

### Required Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://jjfjzpcnclccmjwdglgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZmp6cGNuY2xjY21qd2RnbGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzU3MDAsImV4cCI6MjA3ODQ1MTcwMH0.ePSNR_oLhjwHQhaIlzm-xVrcy1seMW-Hu-cXB0UCGvQ

# Supabase Service Role (for webhooks)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AI Service (DeepSeek)
AI_TOKEN=sk-56252bb00f6649c8a570b70a35e907b9
AI_ENDPOINT=https://api.deepseek.com/v1/chat/completions
AI_MODEL=deepseek-chat

# Whop Integration
WHOP_API_KEY=pik_4S8gJzo2Msj9F_C2683376_b38afad87b6bc5beab4915b9428be57113b90898bb093f12f73f20ff761c5196
WHOP_WEBHOOK_SECRET=your_whop_webhook_secret_here

# Whop Checkout URLs
NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY=https://whop.com/checkout/plan_vhBLiFWs6AJNx?d2c=true
NEXT_PUBLIC_WHOP_CHECKOUT_LIFETIME=https://whop.com/checkout/plan_nAv9o4mMRgV37?d2c=true
```

## Step 4: Update Webhook URL

After deployment, update your Whop webhook URL:

1. Get your Netlify site URL (e.g., `https://your-site.netlify.app`)
2. Go to Whop Dashboard → Webhooks
3. Update webhook URL to: `https://your-site.netlify.app/api/whop/webhook`

## Step 5: Build Settings

Netlify should auto-detect these, but verify in **Site settings** → **Build & deploy**:

- **Build command:** `npm run build`
- **Publish directory:** `.next` (or leave empty for auto-detection)
- **Node version:** 18 or 20

## Step 6: Deploy!

1. Click **"Deploy site"** in Netlify
2. Wait for build to complete (usually 2-3 minutes)
3. Your site will be live at `https://your-site.netlify.app`

## ✅ What Works on Netlify

- ✅ Next.js App Router
- ✅ API Routes (via Netlify Functions)
- ✅ Server-side rendering
- ✅ Supabase authentication
- ✅ Database connections
- ✅ Environment variables
- ✅ Image optimization
- ✅ Static assets

## ⚠️ Important Notes

1. **Environment Variables**: Must be set in Netlify Dashboard (not in `.env.local`)
2. **Webhook URL**: Update to your Netlify domain after deployment
3. **Build Time**: First build may take 3-5 minutes
4. **API Routes**: Work automatically via Netlify Functions
5. **Image Optimization**: Works with Next.js Image component

## 🔧 Troubleshooting

**Build fails:**
- Check Node version (should be 18+)
- Verify all environment variables are set
- Check build logs in Netlify dashboard

**API routes not working:**
- Ensure `netlify.toml` is in your repo
- Check Netlify Functions logs

**Authentication issues:**
- Verify Supabase URLs are correct
- Check redirect URLs in Supabase dashboard

## 📝 Post-Deployment Checklist

- [ ] All environment variables set in Netlify
- [ ] Webhook URL updated in Whop dashboard
- [ ] Supabase redirect URLs updated (if needed)
- [ ] Test login/signup
- [ ] Test chat functionality
- [ ] Test message counting
- [ ] Test premium upgrade flow

Your site is ready for Netlify! 🚀

