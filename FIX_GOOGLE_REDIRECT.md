# Fix Google OAuth Redirect URI Mismatch Error

## Error: `redirect_uri_mismatch`

This error means the redirect URI in Google Cloud Console doesn't match what Supabase is sending.

## Solution: Add Supabase Callback URL to Google Cloud Console

### Step 1: Get Your Supabase Callback URL

Your Supabase project callback URL is:
```
https://jjfjzpcnclccmjwdglgh.supabase.co/auth/v1/callback
```

### Step 2: Add to Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID: `364636168371-rjivlli0lefrd5punkhi5j4stj2bud2e.apps.googleusercontent.com`
3. Click on it to edit
4. Under **Authorized redirect URIs**, click **+ ADD URI**
5. Add this exact URL:
   ```
   https://jjfjzpcnclccmjwdglgh.supabase.co/auth/v1/callback
   ```
6. Click **SAVE**

### Step 3: Also Add Local Development URL (Optional)

For local testing, you can also add:
```
http://localhost:3000/auth/callback
```

But the Supabase callback URL is the main one needed.

### Step 4: Wait a Few Minutes

Google OAuth changes can take 1-2 minutes to propagate.

### Step 5: Test Again

Try signing in with Google again. It should work now!

## Why This Happens

- Supabase handles OAuth and uses its own callback URL
- Your app redirects to `/auth/callback`, but Supabase intercepts it first
- Google needs to know about Supabase's callback URL, not your app's

## Current Configuration

- **Supabase Project**: `jjfjzpcnclccmjwdglgh`
- **Required Redirect URI**: `https://jjfjzpcnclccmjwdglgh.supabase.co/auth/v1/callback`
- **Your App Callback**: `http://localhost:3000/auth/callback` (handled by your app after Supabase)

