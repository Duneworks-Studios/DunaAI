# Complete Environment Variables Setup Guide

## 📋 Step-by-Step Instructions

Follow these steps to get and configure all required environment variables for Duna AI.

---

## Step 1: Create `.env.local` File

1. In your project root directory, create a file named `.env.local`
2. This file is already in `.gitignore`, so it won't be committed to GitHub

---

## Step 2: Supabase Configuration

### 2.1 Get Supabase Project URL

1. Go to: https://app.supabase.com
2. Sign in to your account
3. Select your project (or create a new one)
4. Click on **Settings** (gear icon in left sidebar)
5. Click on **API** in the settings menu
6. Find **Project URL** (looks like: `https://xxxxx.supabase.co`)
7. Copy the entire URL

**Add to `.env.local`:**
```bash
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
```

### 2.2 Get Supabase Anon Key

1. Still in **Settings** → **API**
2. Find **Project API keys** section
3. Look for **anon/public** key
4. Click the **eye icon** to reveal it (or click **Copy**)
5. Copy the entire key (starts with `eyJ...`)

**Add to `.env.local`:**
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2.3 Get Supabase Service Role Key (for Webhooks)

1. Still in **Settings** → **API**
2. Find **service_role** key (⚠️ **Keep this secret!**)
3. Click the **eye icon** to reveal it
4. Copy the entire key

**Add to `.env.local`:**
```bash
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2.4 Get Database Connection String

1. Still in **Settings** → **API**
2. Scroll down to **Connection string** section
3. Select **URI** tab
4. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
5. Replace `[YOUR-PASSWORD]` with your actual database password (set when creating the project)

**Add to `.env.local`:**
```bash
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
```

**Note:** If you forgot your database password:
- Go to **Settings** → **Database**
- Click **Reset database password**
- Set a new password and update `DATABASE_URL`

---

## Step 3: Google OAuth Setup

### 3.1 Create Google Cloud Project

1. Go to: https://console.cloud.google.com
2. Click **Select a project** → **New Project**
3. Enter project name: `Duna AI` (or any name)
4. Click **Create**
5. Wait for project creation, then select it

### 3.2 Enable Google+ API

1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and click **Enable**

### 3.3 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure OAuth consent screen:
   - Choose **External** (unless you have Google Workspace)
   - Fill in app name: `Duna AI`
   - Add your email as support email
   - Add your email as developer contact
   - Click **Save and Continue** through the steps
4. Back to **Credentials**, click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Select **Web application**
6. Name it: `Duna AI Web Client`
7. Under **Authorized redirect URIs**, click **+ ADD URI**
8. Add your Supabase callback URL:
   ```
   https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
   ```
   (Replace `YOUR_PROJECT_ID` with your actual Supabase project ID from Step 2.1)
9. Click **Create**
10. A popup will show your credentials:
    - **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
    - **Client Secret** (looks like: `GOCSPX-xxxxx`)
11. Copy both values

**Add to `.env.local`:**
```bash
GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"
```

---

## Step 4: AI Service Setup (DeepSeek)

### 4.1 Create DeepSeek Account

1. Go to: https://platform.deepseek.com
2. Sign up or log in
3. Verify your email if needed

### 4.2 Get API Key

1. Go to: https://platform.deepseek.com/api_keys
2. Click **Create API Key**
3. Name it: `Duna AI`
4. Copy the API key (starts with `sk-...`)

**Add to `.env.local`:**
```bash
AI_TOKEN="sk-xxxxx"
AI_ENDPOINT="https://api.deepseek.com/v1/chat/completions"
AI_MODEL="deepseek-chat"
```

**Alternative: Using OpenAI**
If you prefer OpenAI instead:
```bash
AI_TOKEN="sk-xxxxx"  # Your OpenAI API key
AI_ENDPOINT="https://api.openai.com/v1/chat/completions"
AI_MODEL="gpt-4"  # or "gpt-3.5-turbo"
```

---

## Step 5: NextAuth Configuration

### 5.1 Generate NextAuth Secret

1. Open terminal in your project directory
2. Run this command:
   ```bash
   openssl rand -base64 32
   ```
3. Copy the generated string

**Add to `.env.local`:**
```bash
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="paste_generated_secret_here"
```

**For production:** Change `NEXTAUTH_URL` to your production domain:
```bash
NEXTAUTH_URL="https://your-domain.com"
```

---

## Step 6: Whop Integration

### 6.1 Get Whop API Key

1. Go to: https://whop.com
2. Sign in to your account
3. Go to your product/dashboard
4. Navigate to **Settings** → **Developer** or **API**
5. Create a new API key or copy existing one
6. Copy the API key (starts with `pik_...`)

**Add to `.env.local`:**
```bash
WHOP_API_KEY="pik_xxxxx"
```

### 6.2 Get Whop Webhook Secret

1. Still in Whop dashboard
2. Go to **Webhooks** section
3. Create a new webhook or edit existing
4. Set webhook URL to: `https://your-domain.com/api/whop/webhook`
5. Copy the webhook secret (provided when creating webhook)

**Add to `.env.local`:**
```bash
WHOP_WEBHOOK_SECRET="your_webhook_secret_here"
```

### 6.3 Get Whop Checkout URLs

1. In Whop dashboard, go to your product
2. Go to **Pricing** or **Plans**
3. Find your Monthly plan
4. Click on it to get the checkout URL
5. It should look like: `https://whop.com/checkout/plan_xxxxx?d2c=true`
6. Copy the URL
7. Repeat for Lifetime plan

**Add to `.env.local`:**
```bash
NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY="https://whop.com/checkout/plan_xxxxx?d2c=true"
NEXT_PUBLIC_WHOP_CHECKOUT_LIFETIME="https://whop.com/checkout/plan_xxxxx?d2c=true"
```

---

## Step 7: Complete `.env.local` File

Your final `.env.local` file should look like this:

```bash
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_generated_secret_here"

# Google OAuth
GOOGLE_CLIENT_ID="xxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxx"

# AI Service (DeepSeek)
AI_TOKEN="sk-xxxxx"
AI_ENDPOINT="https://api.deepseek.com/v1/chat/completions"
AI_MODEL="deepseek-chat"

# Whop Integration
WHOP_API_KEY="pik_xxxxx"
WHOP_WEBHOOK_SECRET="your_webhook_secret_here"
NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY="https://whop.com/checkout/plan_xxxxx?d2c=true"
NEXT_PUBLIC_WHOP_CHECKOUT_LIFETIME="https://whop.com/checkout/plan_xxxxx?d2c=true"
```

---

## Step 8: Verify Setup

1. Save the `.env.local` file
2. Restart your development server:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```
3. Check the console for any errors
4. Try signing up/logging in to test

---

## Step 9: Set Up Database Tables

After configuring environment variables, you need to create the database tables:

1. Go to Supabase Dashboard → **SQL Editor**
2. Run the SQL from `SUPABASE_SETUP.md` or `FIX_EXISTING_TABLES.sql`
3. This creates:
   - `user_messages` table (for message counting)
   - `user_plans` table (for premium detection)

---

## Step 10: For Production (Netlify/Vercel)

When deploying, add all these environment variables in your hosting platform:

### Netlify:
1. Go to your site → **Site settings** → **Environment variables**
2. Add each variable from your `.env.local`
3. Click **Save**

### Vercel:
1. Go to your project → **Settings** → **Environment Variables**
2. Add each variable
3. Select environment (Production, Preview, Development)
4. Click **Save**

**Important:** Never commit `.env.local` to GitHub. It's already in `.gitignore`.

---

## Troubleshooting

### "Supabase URL is required" error
- Check `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- Make sure it starts with `https://`
- Restart the dev server after adding

### "Google OAuth redirect_uri_mismatch" error
- Make sure you added the Supabase callback URL to Google Cloud Console
- URL format: `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
- Wait 1-2 minutes after adding (Google needs time to update)

### "AI Service Not Configured" message
- Check `AI_TOKEN` is set correctly
- For DeepSeek, token should start with `sk-`
- Restart dev server after adding

### Database connection errors
- Verify `DATABASE_URL` has correct password
- Check Supabase project is active
- Ensure database tables are created (see Step 9)

---

## Quick Checklist

- [ ] Created `.env.local` file
- [ ] Added Supabase URL and keys (3 variables)
- [ ] Added Database URL
- [ ] Created Google OAuth credentials and added to `.env.local`
- [ ] Got DeepSeek API key and added to `.env.local`
- [ ] Generated NextAuth secret and added to `.env.local`
- [ ] Added Whop API key and webhook secret
- [ ] Added Whop checkout URLs
- [ ] Restarted dev server
- [ ] Created database tables in Supabase
- [ ] Tested login/signup
- [ ] Tested chat functionality

---

## Need Help?

- Check `ENV_SETUP.md` for more details
- Check `SUPABASE_SETUP.md` for database setup
- Check `WHOP_WEBHOOK_SETUP.md` for webhook configuration
- Check `NETLIFY_DEPLOYMENT.md` for production deployment

