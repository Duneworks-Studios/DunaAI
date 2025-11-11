# Fix OAuth Redirect to Netlify Domain

## Problem
After signing in with Google, you're being redirected to `http://localhost:3000/` instead of your Netlify domain.

## Solution

### Step 1: Update Supabase Redirect URLs

1. Go to **Supabase Dashboard**: https://app.supabase.com/project/jjfjzpcnclccmjwdglgh
2. Navigate to **Authentication** → **URL Configuration**
3. Add your Netlify site URL to **Redirect URLs**:
   ```
   https://your-site-name.netlify.app/auth/callback
   ```
   Replace `your-site-name` with your actual Netlify site name.

4. Also add (for local development):
   ```
   http://localhost:3000/auth/callback
   ```

### Step 2: Update Google OAuth Redirect URIs

1. Go to **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Click to edit it
4. Under **Authorized redirect URIs**, add:
   ```
   https://jjfjzpcnclccmjwdglgh.supabase.co/auth/v1/callback
   ```
   (This is the Supabase callback URL - it handles the OAuth flow)

5. Also add your Netlify domain (if needed):
   ```
   https://your-site-name.netlify.app/auth/callback
   ```

### Step 3: Add Environment Variable in Netlify

In your Netlify dashboard, add:

```
NEXT_PUBLIC_SITE_URL
```
Value: `https://your-site-name.netlify.app` (your actual Netlify URL)

This ensures the app knows its production URL.

### Step 4: Update NEXTAUTH_URL

Make sure `NEXTAUTH_URL` in Netlify is set to:
```
https://your-site-name.netlify.app
```
(Not `http://localhost:3000`)

## How It Works

1. User clicks "Sign in with Google"
2. Redirects to Google OAuth
3. Google redirects to Supabase callback: `https://jjfjzpcnclccmjwdglgh.supabase.co/auth/v1/callback`
4. Supabase processes OAuth and redirects to your app: `https://your-site-name.netlify.app/auth/callback`
5. Your app's callback route processes the session and redirects to `/chat`

## Testing

After making these changes:
1. Deploy to Netlify
2. Try signing in with Google on your Netlify site
3. You should be redirected to: `https://your-site-name.netlify.app/chat`

## Troubleshooting

**Still redirecting to localhost?**
- Check `NEXTAUTH_URL` in Netlify is set to your Netlify domain
- Check `NEXT_PUBLIC_SITE_URL` is set in Netlify
- Verify Supabase redirect URLs include your Netlify domain
- Clear browser cache and try again

**Getting "redirect_uri_mismatch" error?**
- Make sure Google OAuth has the Supabase callback URL: `https://jjfjzpcnclccmjwdglgh.supabase.co/auth/v1/callback`
- This is the most important one - Google must allow Supabase's callback URL

