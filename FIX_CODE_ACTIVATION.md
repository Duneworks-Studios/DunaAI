# Fix Code Activation Error

## Problem
You're seeing the error: **"Supabase credentials not configured"** when trying to use the special codes.

## Solution: Add Environment Variable to Netlify

The `SUPABASE_SERVICE_ROLE_KEY` environment variable is missing from your Netlify deployment.

### Step 1: Get Your Supabase Service Role Key

1. Go to: https://app.supabase.com
2. Select your project
3. Go to **Settings** (gear icon) → **API**
4. Find the **service_role** key (⚠️ Keep this secret!)
5. Click the **eye icon** to reveal it
6. Copy the entire key (starts with `eyJ...`)

### Step 2: Add to Netlify

1. Go to: https://app.netlify.com
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Add:
   - **Key:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** (paste your service role key)
6. Click **Save**

### Step 3: Redeploy Your Site

**IMPORTANT:** After adding environment variables, you MUST redeploy:

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the deployment to complete

### Step 4: Test the Codes Again

After redeployment, try the codes again:

- **Pro Upgrade Code:** `IzEgQWkgRHVuZXdvcmtzIDY3`
- **Reset Message Limit:** `RHVuZXdvcmtzIElzICMxIERldiBTZXJ2ZXI=`

## Verify Environment Variables

Make sure you have ALL these variables in Netlify:

✅ `NEXT_PUBLIC_SUPABASE_URL`  
✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
✅ `SUPABASE_SERVICE_ROLE_KEY` ← **This one is missing!**  
✅ `AI_TOKEN`  
✅ `AI_ENDPOINT`  
✅ `AI_MODEL`  
✅ `WHOP_WEBHOOK_SECRET` (if using Whop)  
✅ `WHOP_API_KEY` (if using Whop)  

## Why This Is Needed

The `SUPABASE_SERVICE_ROLE_KEY` is required because:
- It allows the API to update user metadata (admin privileges)
- It's needed to upgrade users to Pro
- It's needed to reset message limits
- It bypasses Row Level Security (RLS) for admin operations

**Security Note:** The service role key has full admin access. Never commit it to GitHub or expose it in client-side code. Only use it in server-side API routes.

## Still Not Working?

1. **Check the browser console** - Look for detailed error messages
2. **Check Netlify logs** - Go to Deploys → Click on latest deploy → View logs
3. **Verify the key is correct** - Make sure you copied the entire key without spaces
4. **Make sure you redeployed** - Environment variables only take effect after redeployment

