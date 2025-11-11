# Environment Variables Setup

## ⚠️ Important: Keep Secrets Local

All secrets should be stored in `.env.local` (which is gitignored) and **never committed** to the repository.

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres"

# Supabase Configuration
# Get these from: https://app.supabase.com/project/YOUR_PROJECT/settings/api
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key_here"

# Supabase Service Role Key (for webhooks)
# Get from: https://app.supabase.com/project/YOUR_PROJECT/settings/api
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"

# NextAuth (if needed)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate_a_random_secret_here"

# Google OAuth
# Get from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# AI Service (DeepSeek or OpenAI)
AI_TOKEN="your_ai_api_key_here"
AI_ENDPOINT="https://api.deepseek.com/v1/chat/completions"
AI_MODEL="deepseek-chat"

# Whop Integration
WHOP_API_KEY="your_whop_api_key_here"
WHOP_WEBHOOK_SECRET="your_whop_webhook_secret_here"

# Whop Checkout URLs
NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY="https://whop.com/checkout/your_monthly_plan_id?d2c=true"
NEXT_PUBLIC_WHOP_CHECKOUT_LIFETIME="https://whop.com/checkout/your_lifetime_plan_id?d2c=true"
```

## How to Get Each Secret

### Supabase Credentials
1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### Google OAuth
1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Copy:
   - **Client ID** → `GOOGLE_CLIENT_ID`
   - **Client Secret** → `GOOGLE_CLIENT_SECRET`

### AI Service (DeepSeek)
1. Go to https://platform.deepseek.com
2. Sign up/login
3. Go to **API Keys**
4. Create a new API key
5. Copy the key → `AI_TOKEN`

### Whop Integration
1. Go to https://whop.com
2. Navigate to your product settings
3. Get your API key from the developer section
4. Set up webhook and get the secret

## Security Notes

- ✅ `.env.local` is gitignored (won't be committed)
- ✅ Never commit secrets to GitHub
- ✅ Use placeholders in documentation
- ✅ Rotate secrets if they're ever exposed
- ✅ Use different secrets for development and production

## For Production (Netlify/Vercel)

Add all these environment variables in your hosting platform's dashboard:
- **Netlify**: Site Settings → Environment Variables
- **Vercel**: Project Settings → Environment Variables

See `NETLIFY_DEPLOYMENT.md` for deployment instructions.
